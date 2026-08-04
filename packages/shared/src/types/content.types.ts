/**
 * Page metadata for SEO and social sharing
 */
export interface PageMetadata {
  seo_title: string;
  seo_description: string;
  seo_keywords?: string[];
  seo_robots: string;
  og_image: string;
  og_title?: string;
  og_description?: string;
  og_type?: string;
  twitter_card?: string;
  json_ld?: Record<string, unknown>;
  seo_health_score?: number;
  canonical_url?: string;
  /** hreflang map — e.g. { "en": "https://...", "th": "https://..." } */
  hreflang?: Record<string, string> | null;
}

/**
 * Extended page type with SEO metadata
 * Updated: migration_002 — business fields moved to business_profile table
 */
export interface SitePage extends PageMetadata {
  id: string;
  page_slug: string;
  header_title_main: string;
  header_title_highlight: string;
  access_level: string;
  page_description: string;
  // Image — resolved from cover_asset_id via media_assets join
  cover_asset_id?: string | null;
  cover_media?: { image_url: string; alt_text: string | null; title: string | null } | null;
  // Business profile FK — only populated for 'home' page
  business_profile_id?: string | null;
  // hero_image_url, og_image, primary_image_alt/title — DROPPED in migration_001
}

/**
 * Business profile — single row for Thai Akha Kitchen LocalBusiness schema
 * Referenced from site_metadata.business_profile_id (only home page)
 */
/** Canale contatto UI (bottoni social/messaging) — business_profile.contact_channels. */
export interface ContactChannel {
  /** Chiave design (whatsapp|line|instagram|messenger|facebook|youtube|pinterest|x|tripadvisor|maps|…). */
  type: string;
  url: string;
  /** Valore mostrato (numero, @handle). */
  value?: string;
  /** Override etichetta (default: dal type nella mappa design). */
  label?: string;
  /** true → CTA grande in evidenza; altrimenti icona tonda. */
  highlight?: boolean;
  /** false → canale spento (non renderizzato). */
  is_active?: boolean;
}

export interface BusinessProfile {
  id: string;
  name: string;
  /** Ragione sociale (schema.org legalName) — blocco Business & Billing. */
  legal_name?: string | null;
  /** Partita IVA / Tax ID (schema.org taxID) — blocco Business & Billing. */
  tax_id?: string | null;
  /** Canali contatto per i bottoni UI (ordine array = ordine render). */
  contact_channels?: ContactChannel[] | null;
  latitude?: number | null;
  longitude?: number | null;
  street_address?: string | null;
  address_locality?: string | null;
  address_region?: string | null;
  postal_code?: string | null;
  address_country?: string | null;
  telephone?: string | null;
  email?: string | null;
  business_type?: string | null;
  service_type?: string[] | null;
  price_range?: string | null;
  area_served?: Record<string, unknown>[] | null;
  service_radius?: number | null;
  opening_hours?: Record<string, unknown>[] | null;
  same_as?: string[] | null;
  founding_date?: string | null;
  timezone?: string | null;
  google_place_id?: string | null;
  has_map?: string | null;
  aggregate_rating?: { ratingValue: string; reviewCount: string } | null;
}



export interface PageFeature {
  icon: string;
  color: string;
  title: string;
  body: string;
}

// ─── PageEssentials ───────────────────────────────────────────────────────────

export interface EssentialFact {
  label: string;
  value: string;
}

export interface EssentialReference {
  label: string;
  url: string;
  icon?: string;
}

export interface EssentialsData {
  facts?: EssentialFact[];
  references?: EssentialReference[];
  author_note?: string;
  /** "About AI" card copy — how AI supports the service. Falls back to author_note when absent. */
  ai_note?: string;
  date_published?: string;
}

/**
 * Page header metadata - used in front app
 */
export interface HeaderMetadata {
  badge?: string | null;
  icon?: string | null;
  titleMain?: string | null;
  titleHighlight?: string | null;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  ogType?: string | null;
  twitterCard?: string | null;
  canonicalUrl?: string | null;
  robots?: string | null;
  jsonLd?: object | null;
  features?: PageFeature[] | null;
  /** Cherry entry-point (site_metadata): domanda-seme, risposta preset, nodi-ingresso. */
  cherryPrompt?: string | null;
  cherryResponse?: string | null;
  cherryButtonIds?: string[] | null;
}

/**
 * Cooking Class Database Model
 */
export interface CookingClassDB {
  id: string;
  title: string;
  badge?: string | null;
  tags?: string[] | null;
  price: number;
  currency?: string | null;
  unit?: string | null;
  theme_color?: string | null;
  duration_text?: string | null;
  tagline?: string | null;
  capacity_text?: string | null;
  /** Immagine hero della pagina classe (HeroContent). URL Storage diretta. */
  image_url?: string | null;
  description?: string | null;
  highlights?: string[] | null;
  schedule_items?: Record<string, unknown>[] | null;
  inclusions?: string[] | null;
  is_active?: boolean;
  created_at?: string;
}
