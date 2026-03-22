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
  suggestions?: string[];
  isStreaming?: boolean;
  timestamp?: Date;
}

/**
 * Cooking Class Database Model
 */
export interface CookingClassDB {
  id: string;
  title: string;
  badge: string;
  tags: string[];
  price: number;
  theme_color: string;
  duration_text: string;
  image_url: string;
  description: string;
  schedule_items: {
    label: string;
    time: string;
    description?: string;
  }[];
  highlights: string[];
  inclusions: string[];
  has_market_tour?: boolean;
}

/**
 * Recipe Category Database Model
 */
export interface RecipeCategoryDB {
  id: string;
  title: string;
  description: string;
  image: string;
  display_order: number;
  ui_quote?: string;
  content_body?: string;
  audio_story_url?: string;
  icon_name?: string;
  keywords?: string[];
  chef_secrets?: string[];
  cherry_context?: string;
}
export * from './quiz.types';

/**
 * Culture Section — one entry in the culture_sections Supabase table.
 * Used by the History Index page and its card grid.
 */
export interface CultureSection {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  primary_image: string | null;
  display_order: number;
  featured: boolean | null;
  category?: string | null;
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
  /** Legacy field — kept for backwards-compat with older cache entries. */
  tag?: string;
  /** Legacy field — kept for backwards-compat with older cache entries. */
  gallery_id?: string;
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
