
import { RecipeData } from '../components/menu/RecipeView';

/**
 * 🛠️ MASTER RECIPE MAPPER
 * Trasforma i record grezzi di Supabase nell'interfaccia tipizzata RecipeData.
 * Garantisce che tutti i campi obbligatori abbiano un fallback sicuro.
 */
export const mapToRecipeData = (r: any): RecipeData => {
  if (!r) throw new Error("Cannot map null recipe");

  return {
    id: r.id,
    name: r.name,
    thai_name: r.thai_name || '',
    description: r.description || '',
    category: r.category || 'general',
    image: r.image || 'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/Recipes01.jpg',
    spiciness: r.spiciness || 0,
    
    // Booleani Dietetici
    isVegan: r.is_vegan ?? false,
    isVegetarian: r.is_vegetarian ?? false,
    
    // Allergeni (Default a false per sicurezza)
    hasPeanuts: r.has_peanuts ?? false,
    hasGluten: r.has_gluten ?? false,
    hasShellfish: r.has_shellfish ?? false,
    hasSoy: r.has_soy ?? false,
    
    // Metadata
    isSignature: r.is_signature ?? false,
    isFixedDish: r.is_fixed_dish ?? false,
    healthBenefits: r.health_benefits || "Traditional Akha heritage dish.",
    
    // Mapping Ingredienti (Nested JSON)
    keyIngredients: r.recipe_key_ingredients?.map((i: any) => i.ingredient) || [],
    
    // Media & UI
    galleryImages: r.gallery_images || [],
    colorTheme: r.color_theme || '#FB2E58'
  };
};

