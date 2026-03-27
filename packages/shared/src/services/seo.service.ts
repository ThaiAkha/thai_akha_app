import { supabase } from '../lib/supabase';
import { PageMetadata, SitePage } from '../types/content.types';

const SITE_URL = 'https://www.thaiakha.com';

export const seoService = {
  /**
   * Recupera i metadati SEO per uno slug specifico con logica di sicurezza e fallback.
   */
  async getMetadataForSlug(slug: string, table = 'site_metadata'): Promise<PageMetadata> {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('page_slug', slug)
      .maybeSingle();

    if (error || !data) {
      console.warn(`[SEO] No metadata found for slug: ${slug}, using defaults.`);
      return this.getDefaultMetadata();
    }

    const page = data as any as SitePage;

    // 1. Access Level Guard: Sicurezza assoluta
    const robots = page.access_level === 'public' 
      ? (page.seo_robots || 'index, follow') 
      : 'noindex, nofollow';

    // 2. Metadata Construction
    return {
      seo_title: page.seo_title || `${page.header_title_main} ${page.header_title_highlight} | Thai Akha Kitchen`,
      seo_description: page.seo_description || page.page_description || '',
      seo_keywords: page.seo_keywords || [],
      seo_robots: robots,
      og_image: this.ensureAbsoluteUrl(page.og_image || page.hero_image_url),
      json_ld: page.json_ld || {},
      seo_health_score: page.seo_health_score || 0,
      canonical_url: `${SITE_URL}/${page.page_slug === 'home' ? '' : page.page_slug}`
    };
  },

  /**
   * Garantisce che l'URL dell'immagine sia assoluto per i crawler social.
   */
  ensureAbsoluteUrl(url: string): string {
    if (!url) return `${SITE_URL}/default-og-image.jpg`;
    if (url.startsWith('http')) return url;
    return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  },

  /**
   * Metadati di emergenza per evitare tag vuoti.
   */
  getDefaultMetadata(): PageMetadata {
    return {
      seo_title: 'Thai Akha Kitchen | Authentic Cooking Class Chiang Mai',
      seo_description: 'Join Chef Cherry for a traditional Akha cooking experience in the heart of Chiang Mai. Hands-on classes and authentic heritage recipes.',
      seo_robots: 'index, follow',
      og_image: `${SITE_URL}/default-og-image.jpg`,
      seo_keywords: ['cooking class', 'Chiang Mai', 'Akha food', 'traditional Thai food']
    };
  }
};
