// Canonical SEO slugs for the public top-level pages — SINGLE SOURCE shared by:
// - App.tsx: inbound URL normalization (LEGACY_SLUG_MAP) + outbound link building (slugMap)
// - SEOHead: pathname → site_metadata slug (senza questa mappa gli URL legacy
//   tipo /recipes cadrebbero sui default SEO invece che sulla riga canonica)
// NB: supabase/functions/og-meta-tags ha una copia propria (Deno, no import) — tenerle allineate.
export const PAGE_SLUGS: Record<string, string> = {
  news: 'thai-cooking-tips-news',
  quiz: 'akha-wisdom-path-quiz',
  history: 'akha-culture-highland-heritage',
  ingredients: 'thai-cooking-ingredients',
  recipes: 'authentic-thai-akha-recipes',
  classes: 'thai-cooking-classes-chiang-mai',
  'morning-class': 'morning-cooking-class-market-tour',
  'evening-class': 'evening-cooking-class-dinner',
  'about-us': 'about-thai-akha-kitchen',
  contact: 'contact-cooking-school-chiang-mai',
  booking: 'book-cooking-class-chiang-mai',
  location: 'free-pickup-location-chiang-mai',
  faq: 'cooking-class-faq-chiang-mai',
};

// Alias legacy top-level → slug canonico site_metadata (usato da SEOHead).
export const LEGACY_TOP_SLUGS: Record<string, string> = {
  ...PAGE_SLUGS,
  'terms-and-conditions': 'booking-terms-conditions',
  'policy-and-privacy': 'privacy-policy',
};
