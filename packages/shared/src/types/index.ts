export * from './auth.types';
export * from './content.types';
export * from './data.types';
export * from './legal.types';
export * from './media.types';
/**
 * Chat message format - used across both admin and front apps
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  parts?: { text: string }[];
  isStreaming?: boolean;
  timestamp?: Date;
}



/**
 * Unified Content Category Database Model (recipe, ingredient, history, blog)
 */
export interface ContentCategoryDB {
  id: string;
  domain: string;
  title: string;
  title_highlight?: string | null;
  tab_label?: string | null;
  subtitle?: string | null;
  description?: string | null;
  content_body?: string | null;
  ui_quote?: string | null;
  image_url?: string | null;
  icon_name?: string | null;
  audio_story_url?: string | null;
  cherry_context?: string | null;
  chef_secrets?: string[] | null;
  seo_keywords?: string[] | null;
  display_order?: number;
  is_active?: boolean;
}


export * from './quiz.types';

export interface QuizCategoryDB {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  icon_name: string | null;
  color_theme: string;
  avatar_url: string | null;
  cover_image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface QuizRewardDB {
  id: number;
  icon_name: string;
  label: string;
  required_points: number;
  description: string | null;
  image_url: string | null;
  audio_url: string | null;
  is_active: boolean;
}

/**
 * Culture Section — one entry in the culture_sections Supabase table.
 * Used by the History Index page and its card grid.
 */
export interface CultureSection {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  quote?: string | null;
  primary_image: string | null;
  display_order: number;
  featured: boolean | null;
  category?: string | null;
  category_id?: string | null;
  audio_asset_id?: string | null;
  seo_title?: string | null;
}

/**
 * Culture Section Detail — full record for the CultureDetailPage.
 * Matches the actual culture_sections Supabase table schema.
 */
export interface CultureSectionDetail {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  content?: string | null;
  quote?: string | null;
  primary_image?: string | null;
  display_order: number;
  featured: boolean | null;
  is_published: boolean;
  /** Array of media asset IDs for the inline gallery on the detail page. */
  gallery_images?: string[] | null;
  seo_title?: string | null;
  seo_description?: string | null;
  category?: string | null;
  audio_asset_id?: string | null;
  og_image?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  author_name?: string | null;
  seo_keywords?: string[] | null;
  /** Legacy field — kept for backwards-compat with older cache entries. */
  tag?: string;
  /** Legacy field — kept for backwards-compat with older cache entries. */
  gallery_id?: string;
}

export interface SpicinessLevel {
  id: number;
  title: string;
  description: string;
  icon: string;
  label?: string | null;
  subtitle?: string | null;
  color_code?: string | null;
}

/**
 * Gallery item joined with its media_asset.
 * Used by the CultureDetailPage gallery grid.
 */
export interface CultureGalleryItem {
  id: string;
  gallery_id: string;
  asset_id: string;
  display_order: number;
  quote?: string;
  media_assets?: {
    asset_id: string;
    image_url: string;
    title?: string;
    caption?: string;
    alt_text?: string;
  };
}
