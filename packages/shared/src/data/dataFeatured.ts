// packages/shared/src/data/dataFeatured.ts
//
// 🗂 Central repository of static/hardcoded UI content for the Thai Akha app.
// Keeps data out of page components and makes it easy to migrate to DB later.
//
// Convention:
//   - One namespace section per feature area (HOME, CLASSES, MENU…)
//   - Editorial copy that *could* go to a page_sections row is marked [DB-CANDIDATE]
//   - Pure functional config (icons, colors, URLs) stays here permanently

// ============================================================================
// SHARED INTERFACES
// ============================================================================

export interface FeatureCardConfig {
  icon: string;        // Material Symbols name
  colorClass: string;  // Semantic color token class e.g. 'text-primary'
  targetPath?: string; // Route path
  title: string;       // [DB-CANDIDATE]
  description: string; // [DB-CANDIDATE]
}

// ============================================================================
// HOME — Meet Cherry section
// ============================================================================

export interface HomeCherryFeature {
  icon: string;
  colorClass: string;
  title: string;
  description: string;
}

/**
 * Feature cards shown beside the Cherry image on the Home page.
 * If you want CMS control, move these to a Supabase table and fetch with a hook.
 */
export const CHERRY_FEATURES: HomeCherryFeature[] = [
  {
    icon: 'mic',
    colorClass: 'text-primary',
    title: 'Voice Live',
    description: 'Real-time low-latency voice interaction.',
  },
  {
    icon: 'menu_book',
    colorClass: 'text-action',
    title: 'Recipe Expert',
    description: 'Deep knowledge of our 11 signature dishes.',
  },
];

/** Supabase Storage URLs (functional assets — not editorial text) */
export const CHERRY_IMAGE_URL =
  'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/Akha01.jpg';

export const CHERRY_AUDIO_URL =
  'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/voice_over/cherry_welcome_cherry_normal.wav';

// ============================================================================
// HOME — Main Public Features (B2C)
// ============================================================================

export const HOME_FEATURE_CARDS: FeatureCardConfig[] = [
  {
    icon: 'outdoor_grill',
    colorClass: 'text-primary',
    targetPath: '/classes',
    title: 'Cooking Classes',
    description: 'Join our Morning or Evening classes and cook 11 authentic dishes.',
  },
  {
    icon: 'badge',
    colorClass: 'text-action',
    targetPath: '/user-passport',
    title: 'Digital Passport',
    description: 'Manage your culinary identity and customized dietary preferences.',
  },
  {
    icon: 'trophy',
    colorClass: 'text-quiz-p',
    targetPath: '/user-quiz',
    title: 'Akha Wisdom Path',
    description: 'Test your cultural knowledge, unlock achievements, and earn rewards.',
  },
  {
    icon: 'menu_book',
    colorClass: 'text-secondary',
    targetPath: '/recipes',
    title: 'Traditional Recipes',
    description: 'Access our digital cookbook and master Akha signature dishes.',
  },
  {
    icon: 'landmark',
    colorClass: 'text-primary',
    targetPath: '/history',
    title: 'Highland Heritage',
    description: 'Discover the origins of the Akha people and our life in the mountains.',
  },
  {
    icon: 'language',
    colorClass: 'text-action',
    targetPath: 'https://www.thaiakhakitchen.com',
    title: 'Classic Website',
    description: 'Visit our traditional website for more photos and history.',
  }
];

// ============================================================================
// HISTORY — Culture & Heritage pages
// ============================================================================

export const HISTORY_UI = {
  siblingNav: {
    title: 'Other Chapters',
    prev: 'PREVIOUS',
    next: 'NEXT',
    backButton: 'Back to All Chapters',
    backIcon: 'arrow-left',
  },
  error: {
    title: 'Could not load this chapter',
    back: 'Go back',
  },
  gallery: {
    label: 'Gallery',
    openFull: 'Open Full Gallery',
  },
} as const;

// ============================================================================
// PHOTO — Photo viewer / modal
// ============================================================================

export const PHOTO_UI = {
  closeButton: 'Close Photo',
  zoomIcon: 'zoom-in',
} as const;

// ============================================================================
// DASHBOARD — User / Student Portal
// ============================================================================

export const USER_DASHBOARD_CARDS: FeatureCardConfig[] = [
  {
    icon: 'utensils',
    colorClass: 'text-primary',
    targetPath: '/user-menu',
    title: 'Your Culinary Selection',
    description: 'Review and customize the 3 signature dishes you will learn to cook.',
  },
  {
    icon: 'layout_dashboard',
    colorClass: 'text-action',
    targetPath: '/user-dashboard',
    title: 'Your Kitchen Hub',
    description: 'The summary of your culinary journey and your booking status.',
  },
  {
    icon: 'calendar_days',
    colorClass: 'text-secondary',
    targetPath: '/booking',
    title: 'Secure Your Station',
    description: 'Check availability and reserve your cooking class in Chiang Mai.',
  }
];



































































































