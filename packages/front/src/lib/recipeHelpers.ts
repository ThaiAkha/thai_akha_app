
import { RecipeData } from '../components/menu/RecipeView';

/**
 * 🛠️ MASTER RECIPE MAPPER
 * Trasforma i record grezzi di Supabase nell'interfaccia tipizzata RecipeData.
 * Garantisce che tutti i campi obbligatori abbiano un fallback sicuro.
 */
export const mapToRecipeData = (r: Record<string, unknown>): RecipeData => {
  if (!r) throw new Error("Cannot map null recipe");

  return {
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    thai_name: (r.thai_name as string) || '',
    subtitle: (r.subtitle as string) || '',
    excerpt: (r.excerpt as string) || '',
    description: (r.description as string) || '',
    category: (r.category as string) || 'general',
    image: ((r.cover as any)?.image_url as string)
        || 'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/og-default.jpg',
    coverAltText: ((r.cover as any)?.alt_text as string) || (r.name as string) || '',
    // Allergeni (Default a false per sicurezza)
    hasPeanuts: (r.has_peanuts as boolean) ?? false,
    hasGluten: (r.has_gluten as boolean) ?? false,
    hasShellfish: (r.has_shellfish as boolean) ?? false,
    hasSoy: (r.has_soy as boolean) ?? false,
    hasEggs: (r.has_eggs as boolean) ?? false,
    hasFish: (r.has_fish as boolean) ?? false,
    hasFishSauce: (r.has_fish_sauce as boolean) ?? false,
    hasSeafood: (r.has_seafood as boolean) ?? false,
    hasSesame: (r.has_sesame as boolean) ?? false,
    hasSoySauce: (r.has_soy_sauce as boolean) ?? false,
    hasTreeNuts: (r.has_tree_nuts as boolean) ?? false,

    // Metadata
    isSignature: (r.is_signature as boolean) ?? false,
    isFixedDish: (r.is_fixed_dish as boolean) ?? false,
    healthBenefits: (r.health_benefits as string) || 'Traditional Akha heritage dish.',

    // Mapping Ingredienti (Nested JSON)
    keyIngredients: (r.recipe_key_ingredients as Array<{ ingredient: string }>)?.map(i => i.ingredient) || [],

    // Media & UI
    galleryImages: (r.gallery_assets as Array<{ image_url: string }>)?.map(a => a.image_url) || [],
    dietary_variants: (r.dietary_variants as Record<string, any>) || undefined,

    // Cookbook / Recipe Detail
    servings: (r.servings as string) || undefined,
    prep_time_min: (r.prep_time_min as number) || undefined,
    cook_time_min: (r.cook_time_min as number) || undefined,
    directions: Array.isArray(r.directions) 
      ? r.directions.map((d: any, i: number) => typeof d === 'string' ? { step: i + 1, text: d } : d) 
      : undefined,
    garnish: (r.garnish as string) || undefined,
    cooks_tip: (r.cooks_tip as string) || undefined,
    notes: (r.notes as string) || undefined,
  };
};

