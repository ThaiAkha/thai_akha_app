import { supabase } from '../lib/supabase';
import { PageMetadata, SitePage } from '../types/content.types';
import { fetchWithCache } from './_cache';
import { buildLocalBusinessSchema } from '../lib/businessSchema';
import { contentMetadataService } from './contentMetadata.service';
import { mergeTranslation, pickTranslation } from '../lib/mergeTranslation';
import { translatedSlugService } from './translatedSlug.service';
import {
  ACTIVE_LANGS,
  DEFAULT_LANG,
  I18N_ROUTES_ENABLED,
  OG_LOCALES,
  type SupportedLang,
} from '../lib/i18n';

/**
 * Se il json_ld ha un @graph con un nodo LocalBusiness e la pagina è agganciata
 * a business_profile, rigenera quel nodo dalla fonte unica (indirizzo/telefono/
 * legalName/taxID sempre freschi dal DB — niente copia statica da mantenere).
 * Gli altri nodi (FAQPage, BreadcrumbList, …) restano invariati.
 */
async function withDynamicLocalBusiness(
  jsonLd: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const graph = jsonLd['@graph'];
  if (!Array.isArray(graph)) return jsonLd;

  const bp = await contentMetadataService.getBusinessProfile();
  if (!bp) return jsonLd;

  const dynamicNode = buildLocalBusinessSchema(bp);
  // Dentro @graph il @context appartiene alla radice, non al nodo.
  delete dynamicNode['@context'];
  const dynamicId = dynamicNode['@id'];

  let replaced = false;
  const newGraph = graph.map((node: unknown) => {
    const n = node as Record<string, unknown>;
    // Match per @id canonico (condiviso con Organization), fallback per @type.
    if (!replaced && (n['@id'] === dynamicId || n['@type'] === 'LocalBusiness')) {
      replaced = true;
      return dynamicNode;
    }
    return n;
  });

  return replaced ? { ...jsonLd, '@graph': newGraph } : jsonLd;
}

const SITE_URL = 'https://www.thaiakha.com';

// OG fallback — Supabase storage (stessa dell'Edge Function, sempre disponibile)
const OG_DEFAULT_IMAGE = 'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/og-default.jpg';

/**
 * Type guard: verifica che i campi strutturali obbligatori di SitePage
 * siano presenti nel record restituito da Supabase.
 * Non controlla i campi PageMetadata perché vengono costruiti con fallback
 * dal service stesso — evita falsi negativi su righe DB con dati SEO parziali.
 * Updated: migration_002 — hero_image_url rimosso dalla guard (campo opzionale ora)
 */
function isSitePage(data: unknown): data is SitePage {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d['id'] === 'string' &&
    typeof d['page_slug'] === 'string' &&
    typeof d['header_title_main'] === 'string' &&
    typeof d['header_title_highlight'] === 'string' &&
    typeof d['access_level'] === 'string' &&
    typeof d['page_description'] === 'string'
  );
}

/**
 * 🌍 hreflang GENERATO, mai memorizzato.
 *
 * Regola traduci-vs-genera: gli slug stanno nel registro, gli hreflang si
 * calcolano da quello a ogni render. Emette una alternate per ogni lingua ATTIVA
 * più x-default sull'inglese. Le lingue senza slug tradotto (th/zh/ko/ja, o una
 * entità non ancora tradotta) puntano a prefisso + slug inglese: URL valido,
 * mai un 404, mai percent-encoding.
 *
 * A flag SPENTO non viene mai chiamata: emettere 11 alternate verso URL che
 * rispondono 302 sarebbe dare a Google una mappa di link morti.
 */
function buildHreflang(
  enSlug: string,
  alternates: Record<string, string>,
): Record<string, string> {
  const pathFor = (lang: SupportedLang): string => {
    const slug = lang === DEFAULT_LANG ? enSlug : (alternates[lang] ?? enSlug);
    // La home ha slug NULL nel registro: vive alla radice della sua lingua.
    const isHome = enSlug === 'home' || enSlug === '';
    if (lang === DEFAULT_LANG) return isHome ? `${SITE_URL}/` : `${SITE_URL}/${slug}`;
    return isHome ? `${SITE_URL}/${lang}/` : `${SITE_URL}/${lang}/${slug}`;
  };

  const out: Record<string, string> = {};
  for (const lang of ACTIVE_LANGS) out[lang] = pathFor(lang);
  // x-default = inglese: la versione che serve chi non matcha nessuna lingua.
  out['x-default'] = pathFor(DEFAULT_LANG);
  return out;
}

export const seoService = {
  /**
   * Recupera i metadati SEO per uno slug specifico con logica di sicurezza e fallback.
   * Risolve cover_asset_id → media_assets.image_url via join.
   * Fallback a og_image (legacy) se cover_asset_id non ancora popolato.
   *
   * @param slug SEMPRE lo slug INGLESE (identità DB). La traduzione dell'URL la
   *             fa il router prima di chiamare qui: un solo posto che conosce gli slug.
   * @param lang lingua richiesta; 'en' legge solo la base, le altre fondono il
   *             sidecar campo per campo.
   */
  async getMetadataForSlug(
    slug: string,
    table: 'site_metadata' = 'site_metadata',
    lang: string = DEFAULT_LANG,
  ): Promise<PageMetadata> {
    // Cached + in-flight-deduped: SEOHead (global) and the page both read the same
    // slug — without this they fire two identical round-trips per page load.
    // Only real DB data is cached; misses/errors return null and fall back to
    // defaults below (so a transient failure never poisons the cache).
    // v2: json_ld LocalBusiness rigenerato da business_profile (bump cache)
    // v3: sidecar site_metadata_translations + hreflang generato (la chiave porta
    //     la lingua: due lingue non possono più servirsi la cache a vicenda)
    const cached = await fetchWithCache<PageMetadata>(
      `seo_meta_${slug}_${table}_${lang}_v3`,
      () => this.fetchMetadataForSlug(slug, table, lang),
    );
    return cached ?? this.getDefaultMetadata();
  },

  /** Raw fetch+build of page metadata. Returns null on miss/error (never cached). */
  async fetchMetadataForSlug(
    slug: string,
    table: 'site_metadata' = 'site_metadata',
    lang: string = DEFAULT_LANG,
  ): Promise<PageMetadata | null> {
    // Il sidecar arriva nella stessa query: una sola round-trip per pagina.
    // In inglese non serve — la base È l'inglese.
    const needsTranslation = lang !== DEFAULT_LANG;
    const translationJoin = needsTranslation
      ? `, translations:site_metadata_translations(
            lang, header_badge, header_title_main, header_title_highlight,
            page_description, menu_label, seo_title, seo_description, seo_keywords,
            og_title, og_description, summary_ai, key_entities, page_essentials,
            related_queries_geo
         )`
      : '';

    const { data, error } = await supabase
      .from(table)
      .select(`
        *,
        cover_media:media_assets!site_metadata_cover_asset_id_fkey(image_url, alt_text, title)${translationJoin}
      `)
      .eq('page_slug', slug)
      .maybeSingle();

    if (error || !data || !isSitePage(data)) {
      console.warn(`[SEO] No metadata found for slug: ${slug}, using defaults.`);
      return null;
    }

    // FALLBACK PER CAMPO: ogni campo tradotto vince, ogni campo vuoto ricade
    // sull'inglese. Mai per riga — vedi lib/mergeTranslation.ts.
    const translations = (data as unknown as { translations?: Array<{ lang?: string | null }> }).translations;
    const page = needsTranslation
      ? mergeTranslation(
          data as unknown as Record<string, unknown>,
          pickTranslation(translations, lang) as Record<string, unknown> | null,
        ) as unknown as SitePage
      : data;

    // 1. Access Level Guard: Sicurezza assoluta
    const robots = page.access_level === 'public'
      ? (page.seo_robots || 'index, follow')
      : 'noindex, nofollow';

    // 2. Risolvi immagine: cover_asset_id → media_assets (join cover_media)
    const coverMedia = page.cover_media as { image_url?: string } | null;
    const resolvedImage = coverMedia?.image_url || '';

    // 2b. json_ld: pagine agganciate a business_profile (home) → nodo LocalBusiness
    //     rigenerato dalla fonte unica; il resto del @graph resta com'è.
    let jsonLd = (page.json_ld || {}) as Record<string, unknown>;
    if (page.business_profile_id) {
      jsonLd = await withDynamicLocalBusiness(jsonLd);
    }

    // 3. URL della pagina in questa lingua.
    // `page.page_slug` resta SEMPRE l'inglese: mergeTranslation non tocca gli
    // slug, la loro fonte unica è il registro (v_translated_slugs).
    const enSlug = page.page_slug;
    const isHome = enSlug === 'home';

    // A flag spento nessuna delle due query di registro parte: il sito è quello
    // di oggi, e route/hreflang/sitemap si accendono insieme o non si accendono.
    const alternates = I18N_ROUTES_ENABLED
      ? await translatedSlugService.getAlternatesForSlug(enSlug)
      : {};
    const localizedSlug = lang === DEFAULT_LANG ? enSlug : (alternates[lang] ?? enSlug);

    // Il canonical deve puntare a un URL che RISOLVE davvero. A flag spento le
    // route a prefisso non esistono: un canonical `/es/…` manderebbe Google su
    // un 302. Quindi finché l'interruttore è giù il canonical è sempre quello
    // inglese, anche se i contenuti serviti sono tradotti.
    const usePrefix = I18N_ROUTES_ENABLED && lang !== DEFAULT_LANG;
    const canonicalPath = usePrefix
      ? (isHome ? `${lang}/` : `${lang}/${localizedSlug}`)
      : (isHome ? '' : enSlug);

    // 4. Metadata Construction
    return {
      seo_title: page.seo_title || `${page.header_title_main} ${page.header_title_highlight} | Thai Akha Kitchen`,
      seo_description: page.seo_description || page.page_description || '',
      seo_keywords: page.seo_keywords || [],
      seo_robots: robots,
      og_image: this.ensureAbsoluteUrl(resolvedImage),
      og_title: page.og_title || undefined,
      og_description: page.og_description || undefined,
      og_type: page.og_type || undefined,
      twitter_card: page.twitter_card || undefined,
      json_ld: jsonLd,
      seo_health_score: page.seo_health_score || 0,
      canonical_url: `${SITE_URL}/${canonicalPath}`,
      // GENERATO dal registro a flag acceso; a flag spento resta il valore DB,
      // che oggi è la sola self-reference inglese.
      hreflang: I18N_ROUTES_ENABLED
        ? buildHreflang(enSlug, alternates)
        : (page.hreflang ?? null),

      // Multilingua
      lang,
      page_slug: enSlug,
      localized_slug: localizedSlug,
      og_locale: OG_LOCALES[lang as SupportedLang] ?? OG_LOCALES.en,

      // GEO / AI-search — già tradotti dal merge per campo.
      // page_essentials è ancora vuota lato dati: qui passa comunque, così quando
      // /translate-db la riempie non serve toccare il lettore.
      summary_ai: (page as unknown as Record<string, unknown>).summary_ai as string | null ?? null,
      key_entities: (page as unknown as Record<string, unknown>).key_entities ?? null,
      page_essentials: (page as unknown as Record<string, unknown>).page_essentials ?? null,
      related_queries_geo: (page as unknown as Record<string, unknown>).related_queries_geo ?? null,
    };
  },

  /**
   * Garantisce che l'URL dell'immagine sia assoluto per i crawler social.
   * Fallback → Supabase storage default (stessa immagine dell'Edge Function).
   */
  ensureAbsoluteUrl(url: string): string {
    if (!url) return OG_DEFAULT_IMAGE;
    if (url.startsWith('http')) return url;
    return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  },

  /**
   * Metadati di emergenza per evitare tag vuoti.
   * canonical_url è intenzionalmente assente — SEOHead usa window.location.href come fallback.
   */
  getDefaultMetadata(): PageMetadata {
    return {
      seo_title: 'Thai Akha Kitchen | Authentic Cooking Class Chiang Mai',
      seo_description: 'Join Chef Cherry for a traditional Akha cooking experience in the heart of Chiang Mai. Hands-on classes and authentic heritage recipes.',
      seo_robots: 'index, follow',
      og_image: OG_DEFAULT_IMAGE,
      seo_keywords: ['cooking class', 'Chiang Mai', 'Akha food', 'traditional Thai food']
    };
  }
};
