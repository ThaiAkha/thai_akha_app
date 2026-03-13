/**
 * Page metadata for SEO and social sharing
 */
export interface PageMetadata {
  seo_title: string;
  seo_description: string;
  seo_keywords?: string[];
  seo_robots: string;
  og_image: string;
  json_ld?: Record<string, any>;
  seo_health_score?: number;
  canonical_url?: string;
  og_title?: string;
}

/**
 * Extended page type with SEO metadata
 */
export interface SitePage extends PageMetadata {
  id: string;
  page_slug: string;
  header_title_main: string;
  header_title_highlight: string;
  access_level: string;
  hero_image_url: string;
  page_description: string;
}

/**
 * Chat message format - used across both admin and front apps
 */
export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  parts: { text: string }[];
  timestamp?: Date;
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
}
