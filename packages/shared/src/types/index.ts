// Canonical DB types — single source of truth, generated from Supabase.
// Use Tables<'table'> / TablesInsert<'table'> / TablesUpdate<'table'> for typed rows.
export type {
  Database,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
} from './database.types';

export * from './auth.types';
export * from './content.types';
export * from './data.types';
export * from './legal.types';
export * from './infoContent.types';
export * from './media.types';
export * from './pickup.types';
import type { ChatOption, NodeBlock } from '../data/cherry/chatFlowData';

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
  /**
   * Testo completo e definitivo del messaggio, noto in anticipo (flussi statici
   * CHAT_FLOW / inject). Permette al formatter di calcolare la struttura HTML
   * finale dal primo frame e rivelare il testo progressivamente — niente salto
   * di formattazione a fine trascrizione. Assente nei flussi AI in streaming reale.
   */
  fullText?: string;
  /** Static follow-up buttons rendered under this message (no AI call) */
  options?: ChatOption[];
  /** Blocchi ricchi (linkCard/gallery) renderizzati in coda, dopo la trascrizione. */
  blocks?: NodeBlock[];
  /**
   * Livello del nodo CHAT_FLOW che ha generato questo messaggio (1 hub · 2 info ·
   * 3 approfondimento). Usato per la micro-CTA rotante per-livello sopra i bottoni
   * (getCherryCTA). Assente nei messaggi AI in streaming reale.
   */
  nodeLevel?: 1 | 2 | 3;
}



/**
 * Unified Content Category — source of truth for all domains:
 * 'recipe' | 'ingredient' | 'history' | 'blog' | 'quiz' | 'news'
 * Previously: quiz_categories was a separate table — now merged here (domain='quiz').
 */
export interface ContentCategoryDB {
  id: string;
  /** Domain: 'recipe' | 'ingredient' | 'history' | 'blog' | 'quiz' | 'news' */
  domain: string;
  title: string;
  title_highlight?: string | null;
  tab_label?: string | null;
  subtitle?: string | null;
  description?: string | null;
  content_body?: string | null;
  ui_quote?: string | null;
  /** @deprecated use cover_asset_id */
  image_url?: string | null;
  /** Cover image asset ID → media_assets.asset_id */
  cover_asset_id?: string | null;
  /** Icon identifier (icons.ts) — used by quiz and UI domains */
  icon_name?: string | null;
  /** Color theme token (e.g. 'quiz-p', 'btn-s') — used by quiz domain */
  color_theme?: string | null;
  /** Avatar asset ID → media_assets.asset_id — used by quiz domain */
  avatar_asset_id?: string | null;
  audio_story_url?: string | null;
  chef_secrets?: string[] | null;
  seo_keywords?: string[] | null;
  cherry_prompt?: string | null;
  cherry_response?: string | null;
  display_order?: number;
  is_active?: boolean;
  slug?: string | null;
  dietary_variants?: Record<string, {
    title?: string;
    description?: string;
    title_highlight?: string;
    content_body?: string;
    ui_quote?: string;
    cherry_prompt?: string;
    cherry_response?: string;
    [key: string]: unknown;
  }> | null;
  // SEO surface (selected in CONTENT_CATEGORY_PUBLIC_COLUMNS) — used by category landing pages.
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_url?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_type?: string | null;
  json_ld?: unknown;
  hreflang?: Record<string, string> | null;
  breadcrumbs?: unknown;
  cherry_button_ids?: string[] | null;
  last_content_audit_ai?: string | null;
  author_id?: string | null;
}

// ─── INGREDIENTS (Pantry world) ───────────────────────────────────────────────

export interface IngredientCover {
  image_url?: string | null;
  alt_text?: string | null;
  title?: string | null;
}

/** Light index item — hub/category grids + sibling nav. */
export interface IngredientListItem {
  id: string;
  slug: string;
  name_en: string;
  name_th?: string | null;
  phonetic?: string | null;
  category_id?: string | null;
  cover_data?: IngredientCover | null;
}

/** How an ingredient is used in the school (gates rendering; NULL = excluded). */
export type KitchenUsage = 'recipe' | 'market_tour' | 'support';

/** Independent per-ingredient context text (market_tour / support). */
export interface UsageNote {
  heading?: string | null;
  body?: string | null;
}

/** A recipe that uses an ingredient — links to its recipe page. */
export interface RecipeLink {
  id: string;
  slug: string;
  name: string;
  thai_name?: string | null;
  cover_data?: IngredientCover | null;
}

/** Full single-ingredient record (rich-article, mirrors CultureSectionDetail). */
export interface IngredientDetail extends IngredientListItem {
  description?: string | null;
  summary_ai?: string | null;
  culinary_uses?: string | null;
  health_benefits?: string | null;
  conclusion?: string | null;
  /** Key-facts box — object {label:value} or array [{label,value}]. */
  the_essential?: Record<string, unknown> | Array<{ label: string; value: string }> | null;
  faq?: unknown;
  reading_time_minutes?: number | null;
  /** How it's used (gates rendering; NULL = excluded). */
  kitchen_usage?: KitchenUsage | null;
  /** Independent context text (market_tour / support); NULL on 'recipe'. */
  usage_note?: UsageNote | null;
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_url?: string | null;
  json_ld?: unknown;
  hreflang?: Record<string, string> | null;
  cherry_prompt?: string | null;
  cherry_response?: string | null;
  cherry_button_ids?: string[] | null;
  last_content_audit_ai?: string | null;
  related_ingredients?: string[] | null;
  category?: { id: string; title: string; slug: string | null } | null;
  author?: {
    name: string;
    title?: string | null;
    description?: string | null;
    avatar_url?: string | null;
  } | null;
  /** Recipes that use this ingredient (published only). Empty = hide the section. */
  used_in_recipes?: RecipeLink[];
}

/**
 * QuizCategoryDB — alias di ContentCategoryDB con domain='quiz'.
 * Kept for backward compat — quiz_categories table dropped, data lives in content_categories.
 */
export type QuizCategoryDB = ContentCategoryDB;

export * from './quiz.types';

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
  ui_quote?: string | null;
  quote?: string | null;         // Legacy pull-quote — prefer ui_quote for new content
  cover_asset_id: string;
  display_order: number;
  featured: boolean | null;
  audio_asset_id?: string | null;
  seo_title?: string | null;
  canonical_url?: string;
  hreflang?: any;
  cover_data?: {
    image_url: string;
    alt_text: string | null;
    title: string | null;
  };
  category?: {
    id: string;
    title: string;
    slug: string;
  };
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
  ui_quote?: string | null;
  cover_asset_id: string;
  display_order: number;
  featured: boolean | null;
  is_published: boolean;
  /** Array of media asset IDs for the inline gallery on the detail page. */
  gallery_images?: string[] | null;
  seo_title?: string | null;
  seo_description?: string | null;
  audio_asset_id?: string | null;
  og_image?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  seo_keywords?: string[] | null;
  related_articles?: string[] | null;
  last_content_audit_ai?: string | null;
  faq?: { name: string; acceptedAnswer: { text: string } }[] | null;
  /** Cherry entry-point: domanda-seme, risposta preset, nodi-ingresso. */
  cherry_prompt?: string | null;
  cherry_response?: string | null;
  cherry_button_ids?: string[] | null;
  canonical_url?: string;
  hreflang?: any;
  primary_focus_keyword?: string;
  seo_health_score?: number;
  view_count?: number;
  author_id?: string | null;
  author?: {
    name: string;
    title: string;
    avatar_url: string | null;
    description?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  cover_data?: {
    image_url: string;
    alt_text: string | null;
    title: string | null;
  };
  category?: {
    id: string;
    title: string;
    slug: string;
  };
  /** JSON-LD structured data provided by the DB/Edge Function. */
  json_ld?: Record<string, unknown> | null;
  /** Legacy pull-quote text displayed in the article. Use ui_quote for new content. */
  quote?: string | null;
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
  photo_asset_id?: string | null;
  /** Resolved from media_assets via photo_asset_id (PostgREST embed). */
  photo?: { image_url: string; alt_text?: string | null; title?: string | null } | null;
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

/**
 * News Article — list item for the news feed index.
 * Matches akha_news columns used in the index query.
 */
export interface NewsArticle {
  id: string;
  news_id?: string | null;
  slug: string;
  title: string;
  excerpt: string;
  cover_asset_id: string;
  read_time_minutes?: number | null;
  published_at: string;
  canonical_url?: string;
  hreflang?: any;
  cover_data?: {
    image_url: string;
    alt_text: string | null;
    title: string | null;
  };
  category?: {
    id: string;
    title: string;
    slug: string;
  };
}

/**
 * News Detail — full record for the single news page.
 * Extends NewsArticle with all akha_news columns needed on the detail view.
 */
export interface NewsDetail extends NewsArticle {
  content: string;
  subtitle?: string | null;
  /** Cherry entry-point: domanda-seme, risposta preset, nodi-ingresso. */
  cherry_prompt?: string | null;
  cherry_response?: string | null;
  cherry_button_ids?: string[] | null;
  author_id?: string | null;
  is_featured?: boolean | null;
  created_at: string;
  updated_at: string;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_robots?: string | null;
  seo_keywords?: string[] | null;
  og_image?: string | null;
  json_ld?: Record<string, unknown> | null;
  audio_asset_id?: string | null;
  ui_quote?: string | null;
  tags?: string[] | null;
  access_level?: string | null;
  faq?: { name: string; acceptedAnswer: { text: string } }[] | null;
  last_content_audit_ai?: string | null;
  related_articles?: string[] | null;
  primary_focus_keyword?: string;
  seo_health_score?: number;
  view_count?: number;
  author?: {
    name: string;
    title: string;
    avatar_url: string | null;
    description?: string | null;
    phone?: string | null;
    email?: string | null;
  };
}

/**
 * Front Home Card — B2C home page card (table: home_cards_front).
 * NOT the same as home_cards (B2B, used by contentMetadataService.getHomeCards).
 */
export interface FrontHomeCard {
  id: string;
  card_id?: string | null;
  title: string;
  description: string;
  link_label: string;
  target_path: string;
  image_asset_id?: string | null;
  cover_data?: {
    image_url: string;
    alt_text: string | null;
    title: string | null;
  };
  display_order: number;
  extra_1?: string | null;
  suffix_extra_1?: string | null;
  extra_2?: string | null;
  suffix_extra_2?: string | null;
}
export * from './faq.types';
