import { supabase } from '../lib/supabase';
import { PageMetadata, SitePage } from '../types/content.types';
import { fetchWithCache } from './_cache';
import { buildLocalBusinessSchema } from '../lib/businessSchema';
import { contentMetadataService } from './contentMetadata.service';

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

export const seoService = {
  /**
   * Recupera i metadati SEO per uno slug specifico con logica di sicurezza e fallback.
   * Risolve cover_asset_id → media_assets.image_url via join.
   * Fallback a og_image (legacy) se cover_asset_id non ancora popolato.
   */
  async getMetadataForSlug(slug: string, table: 'site_metadata' = 'site_metadata'): Promise<PageMetadata> {
    // Cached + in-flight-deduped: SEOHead (global) and the page both read the same
    // slug — without this they fire two identical round-trips per page load.
    // Only real DB data is cached; misses/errors return null and fall back to
    // defaults below (so a transient failure never poisons the cache).
    // v2: json_ld LocalBusiness rigenerato da business_profile (bump cache)
    const cached = await fetchWithCache<PageMetadata>(
      `seo_meta_${slug}_${table}_v2`,
      () => this.fetchMetadataForSlug(slug, table),
    );
    return cached ?? this.getDefaultMetadata();
  },

  /** Raw fetch+build of page metadata. Returns null on miss/error (never cached). */
  async fetchMetadataForSlug(slug: string, table: 'site_metadata' = 'site_metadata'): Promise<PageMetadata | null> {
    const { data, error } = await supabase
      .from(table)
      .select(`
        *,
        cover_media:media_assets!site_metadata_cover_asset_id_fkey(image_url, alt_text, title)
      `)
      .eq('page_slug', slug)
      .maybeSingle();

    if (error || !data || !isSitePage(data)) {
      console.warn(`[SEO] No metadata found for slug: ${slug}, using defaults.`);
      return null;
    }

    const page = data;

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

    // 3. Metadata Construction
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
      canonical_url: `${SITE_URL}/${page.page_slug === 'home' ? '' : page.page_slug}`,
      hreflang: page.hreflang ?? null
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
