/**
 * RecipeView (menu) - tipi ricetta/categoria/ingrediente. Estratti da RecipeView.tsx (#16 split
 * monstre) a comportamento invariato; RecipeView li ri-esporta per i consumer esistenti.
 */
/** Per-diet text override stored in recipes.dietary_variants (JSONB, keys = dietary_profiles.id) */
export interface RecipeDietaryVariant {
  name?: string;
  description?: string;
  health_benefits?: string;
  subtitle?: string;
  excerpt?: string;
  key_ingredients?: string[];
  [key: string]: unknown;
}

export interface RecipeData {
  id: string;
  slug?: string;
  name: string;
  thai_name?: string;
  subtitle?: string;
  excerpt?: string;
  description: string;
  category: string;
  image: string;
  // Diete & Allergeni
  hasPeanuts: boolean;
  hasGluten: boolean;
  hasShellfish: boolean;
  hasSoy: boolean;
  hasEggs: boolean;
  hasFish: boolean;
  hasFishSauce: boolean;
  hasSeafood: boolean;
  hasSesame: boolean;
  hasSoySauce: boolean;
  hasTreeNuts: boolean;
  // Metadata
  isSignature: boolean;
  isFixedDish: boolean;
  healthBenefits: string;
  keyIngredients: string[];
  // Media
  coverAltText?: string;
  audio_story_url?: string;
  audio_cooking_url?: string;
  galleryImages: string[];
  dietary_variants?: Record<string, RecipeDietaryVariant>;
  activeDietLabel?: string;
  // Cookbook / Recipe Detail
  servings?: string;
  prep_time_min?: number;
  cook_time_min?: number;
  directions?: Array<{ step: number; text: string }>;
  garnish?: string;
  cooks_tip?: string;
  notes?: string;
}

export interface CategoryData {
  title: string;
  description: string;
  image?: string;
}

export interface IngredientDetail {
  id: string;
  name: string;
  /** Nome INGLESE della madre: `name` puo' arrivare tradotto, le chiavi di recipe_key_ingredients no. */
  name_key?: string;
  name_th: string;
  phonetic?: string;
  description: string;
  image_url: string;
  is_visible_public: boolean;
}
