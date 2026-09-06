/**
 * La riga di `site_metadata` che il front legge UNA volta per pagina.
 *
 * Fino al 2026-09-06 la stessa riga si leggeva due volte, con due chiavi di
 * cache e due liste di colonne quasi uguali: una per l'header della pagina
 * (`getPageMetadata`) e una per i meta dei motori (`seo.service`). Due liste
 * separate divergono in silenzio, come divergevano le due chiavi. Qui ce n'e' una,
 * ed e' l'UNIONE di quello che i due lettori usano davvero.
 *
 * Restano fuori di proposito: `semantic_vector` e `seo_audit_logs` (pesanti e mai
 * letti dal browser), `alt_text` e `title` del join cover e `cover_asset_id`
 * (nessun consumatore li legge: solo `image_url`).
 */

export const SITE_METADATA_ROW_COLUMNS = [
  'id', 'page_slug', 'access_level',
  'header_badge', 'header_icon', 'header_title_main', 'header_title_highlight', 'page_description',
  'cover_media:media_assets!site_metadata_cover_asset_id_fkey(image_url)',
  'seo_title', 'seo_description', 'seo_keywords', 'seo_robots',
  'og_title', 'og_description', 'og_type', 'twitter_card',
  'canonical_url', 'json_ld', 'hreflang', 'seo_health_score', 'business_profile_id',
  'summary_ai', 'key_entities', 'page_essentials', 'related_queries_geo',
  'cherry_prompt', 'cherry_response', 'cherry_button_ids',
  'legal_version', 'date_published', 'date_modified', 'faq_refs', 'sibling_slugs',
].join(', ');

/**
 * I campi che il sidecar delle traduzioni puo' sovrascrivere, campo per campo.
 * Tutti verificati sul sidecar reale (site_metadata_translations, 25 colonne).
 */
export const SITE_METADATA_ROW_T_FIELDS = [
  'header_title_main', 'header_title_highlight', 'header_badge', 'page_description',
  'seo_title', 'seo_description', 'seo_keywords', 'og_title', 'og_description',
  'summary_ai', 'key_entities', 'page_essentials', 'related_queries_geo',
] as const;

/** La riga dopo il merge del sidecar: le colonne della select, niente di piu'. */
export interface SiteMetadataRow {
  id: string;
  page_slug: string;
  access_level: string | null;
  header_badge: string | null;
  header_icon: string | null;
  header_title_main: string | null;
  header_title_highlight: string | null;
  page_description: string | null;
  cover_media: { image_url?: string | null } | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  seo_robots: string | null;
  og_title: string | null;
  og_description: string | null;
  og_type: string | null;
  twitter_card: string | null;
  canonical_url: string | null;
  json_ld: unknown;
  hreflang: Record<string, string> | null;
  seo_health_score: number | null;
  business_profile_id: string | null;
  summary_ai: string | null;
  key_entities: unknown;
  page_essentials: Record<string, unknown> | null;
  related_queries_geo: unknown;
  cherry_prompt: string | null;
  cherry_response: string | null;
  cherry_button_ids: string[] | null;
  legal_version: string | null;
  date_published: string | null;
  date_modified: string | null;
  faq_refs: string[] | null;
  sibling_slugs: string[] | null;
}

/**
 * Type guard: i campi strutturali che i meta dei motori danno per certi.
 * Non controlla i campi SEO, che il costruttore riempie con i fallback:
 * eviterebbe di servire i default a righe con dati SEO parziali.
 */
export function isSiteMetadataRow(data: unknown): data is SiteMetadataRow {
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
