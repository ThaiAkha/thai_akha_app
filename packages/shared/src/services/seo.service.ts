import { PageMetadata, BusinessProfile } from '../types/content.types';
import { buildLocalBusinessSchema } from '../lib/businessSchema';
import { isSiteMetadataRow } from './siteMetadataRow';
import {
  ACTIVE_LANGS,
  DEFAULT_LANG,
  PREFIX_ROUTES_ACTIVE,
  OG_LOCALES,
  type SupportedLang,
} from '../lib/i18n';

/**
 * Se il json_ld ha un @graph con un nodo LocalBusiness e la pagina e' agganciata
 * a business_profile, rigenera quel nodo dalla fonte unica (indirizzo/telefono/
 * legalName/taxID sempre freschi dal DB, niente copia statica da mantenere).
 * Gli altri nodi (FAQPage, BreadcrumbList, ...) restano invariati.
 * Riceve il profilo invece di leggerlo: chi lo legge decide se e come aspettarlo.
 */
function applyLocalBusiness(
  jsonLd: Record<string, unknown>,
  bp: BusinessProfile | null,
): Record<string, unknown> {
  const graph = jsonLd['@graph'];
  if (!Array.isArray(graph)) return jsonLd;
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

export const SITE_URL = 'https://www.thaiakha.com';

// OG fallback — Supabase storage (stessa dell'Edge Function, sempre disponibile)
const OG_DEFAULT_IMAGE = 'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/og-default.jpg';

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
export function buildHreflang(
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

/**
 * hreflang di una SOTTO-PAGINA (hub + slug, entrambi tradotti dal registro):
 * ricette, sezioni culture, articoli news, ingredienti, categorie ingrediente.
 * Stessa regola di buildHreflang, su due segmenti: una lingua senza traduzione
 * per uno dei due resta inglese per quel segmento. x-default = inglese.
 * A lista lingue vuota ACTIVE_LANGS e' ['en'] e l'uscita e' la sola self-reference.
 */
export function buildSubPageHreflang(
  hubEn: string,
  slugEn: string,
  hubAlternates: Record<string, string>,
  slugAlternates: Record<string, string>,
): Record<string, string> {
  const pathFor = (lang: SupportedLang): string => {
    const hub = lang === DEFAULT_LANG ? hubEn : (hubAlternates[lang] ?? hubEn);
    const slug = lang === DEFAULT_LANG ? slugEn : (slugAlternates[lang] ?? slugEn);
    const prefix = lang === DEFAULT_LANG ? '' : `/${lang}`;
    return `${SITE_URL}${prefix}/${hub}/${slug}`;
  };
  const out: Record<string, string> = {};
  for (const lang of ACTIVE_LANGS) out[lang] = pathFor(lang);
  out['x-default'] = pathFor(DEFAULT_LANG);
  return out;
}

/** URL assoluto per i crawler social; vuoto → immagine di ripiego (la stessa della edge). */
export function toAbsoluteImageUrl(url: string): string {
  if (!url) return OG_DEFAULT_IMAGE;
  if (url.startsWith('http')) return url;
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

/** Le due dipendenze esterne dei meta: chi le procura decide come aspettarle. */
export interface PageSeoDeps {
  /** Riga di business_profile; serve solo alle pagine con `business_profile_id` (oggi: home). */
  businessProfile: BusinessProfile | null;
  /** Slug tradotti per lingua, dal registro; vuoto a lingue spente. */
  alternates: Record<string, string>;
}

/**
 * Costruisce i meta dei motori dalla riga di site_metadata GIA' letta e fusa.
 *
 * PURA e SINCRONA di proposito. Fino al 2026-09-06 questa logica viveva dentro
 * una funzione che faceva anche la lettura dal database, piu' due attese in
 * fila (il profilo aziendale per il nodo LocalBusiness, il registro degli slug
 * per gli hreflang). Cosi' la stessa riga si leggeva due volte per pagina: una
 * per l'header, una per i meta. Ora la riga arriva da `getPageMetadata`, che e'
 * gia' la lettura dell'header, e le due dipendenze le procura il chiamante
 * (`useSEO`, con due query dipendenti) e le passa qui. Nessun `await`: puo'
 * stare in un `useMemo`, e per la prima volta si puo' testare senza rete.
 *
 * Restituisce null se la riga non e' una pagina valida: il chiamante ricade
 * sui default, come faceva prima.
 */
export function buildPageSeo(row: unknown, lang: string, deps: PageSeoDeps): PageMetadata | null {
  if (!isSiteMetadataRow(row)) return null;
  const page = row;

  // 1. Access Level Guard: Sicurezza assoluta
  const robots = page.access_level === 'public'
    ? (page.seo_robots || 'index, follow')
    : 'noindex, nofollow';

  // 2. Risolvi immagine: cover_asset_id → media_assets (join cover_media)
  const resolvedImage = page.cover_media?.image_url || '';

  // 2b. json_ld: pagine agganciate a business_profile (home) → nodo LocalBusiness
  //     rigenerato dalla fonte unica; il resto del @graph resta com'e'.
  let jsonLd = (page.json_ld || {}) as Record<string, unknown>;
  if (page.business_profile_id) {
    jsonLd = applyLocalBusiness(jsonLd, deps.businessProfile);
  }

  // 3. URL della pagina in questa lingua.
  // `page.page_slug` resta SEMPRE l'inglese: il merge non tocca gli slug, la loro
  // fonte unica e' il registro (v_translated_slugs), che arriva in `deps.alternates`.
  const enSlug = page.page_slug;
  const isHome = enSlug === 'home';

  // A flag spento il registro non si interroga: il sito e' quello di oggi, e
  // route/hreflang/sitemap si accendono insieme o non si accendono.
  const alternates = PREFIX_ROUTES_ACTIVE ? deps.alternates : {};
  const localizedSlug = lang === DEFAULT_LANG ? enSlug : (alternates[lang] ?? enSlug);

  // Il canonical deve puntare a un URL che RISOLVE davvero. A flag spento le
  // route a prefisso non esistono: un canonical `/es/…` manderebbe Google su
  // un 302. Quindi finche' l'interruttore e' giu' il canonical e' sempre quello
  // inglese, anche se i contenuti serviti sono tradotti.
  const usePrefix = PREFIX_ROUTES_ACTIVE && lang !== DEFAULT_LANG;
  const canonicalPath = usePrefix
    ? (isHome ? `${lang}/` : `${lang}/${localizedSlug}`)
    : (isHome ? '' : enSlug);

  // 4. Metadata Construction
  return {
    seo_title: page.seo_title || `${page.header_title_main} ${page.header_title_highlight} | Thai Akha Kitchen`,
    seo_description: page.seo_description || page.page_description || '',
    seo_keywords: page.seo_keywords || [],
    seo_robots: robots,
    og_image: toAbsoluteImageUrl(resolvedImage),
    og_title: page.og_title || undefined,
    og_description: page.og_description || undefined,
    og_type: page.og_type || undefined,
    twitter_card: page.twitter_card || undefined,
    json_ld: jsonLd,
    seo_health_score: page.seo_health_score || 0,
    canonical_url: `${SITE_URL}/${canonicalPath}`,
    // GENERATO dal registro a flag acceso; a flag spento resta il valore DB,
    // che oggi e' la sola self-reference inglese.
    hreflang: PREFIX_ROUTES_ACTIVE
      ? buildHreflang(enSlug, alternates)
      : (page.hreflang ?? null),

    // Multilingua
    lang,
    page_slug: enSlug,
    localized_slug: localizedSlug,
    og_locale: OG_LOCALES[lang as SupportedLang] ?? OG_LOCALES.en,

    // GEO / AI-search — gia' tradotti dal merge per campo.
    summary_ai: page.summary_ai ?? null,
    key_entities: page.key_entities ?? null,
    page_essentials: page.page_essentials ?? null,
    related_queries_geo: page.related_queries_geo ?? null,
  };
}

export const seoService = {
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
