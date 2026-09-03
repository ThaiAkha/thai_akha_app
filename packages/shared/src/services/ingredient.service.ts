import { supabase } from '@thaiakha/shared/lib/supabase';
import { IngredientListItem, IngredientDetail, RecipeLink } from '../types';
import { fetchWithCache } from './_cache';

// Light columns for the hub/category grids + sibling nav (cover joined via image_asset_id).
const INDEX_COLS =
  'id, slug, name, name_th, phonetic, category_id, ' +
  'cover_data:media_assets!image_asset_id(image_url, alt_text, title)';

/** Recipes that use an ingredient — union of recipe_key_ingredients + recipe_composition. */
async function fetchRecipesUsingIngredient(ingredientId: string): Promise<RecipeLink[]> {
  const [keyRes, compRes] = await Promise.all([
    supabase.from('recipe_key_ingredients').select('recipe_id').eq('ingredient_id', ingredientId),
    supabase.from('recipe_composition').select('recipe_id').eq('ingredient_id', ingredientId),
  ]);

  const ids = Array.from(new Set(
    [...(keyRes.data || []), ...(compRes.data || [])]
      .map((r) => (r as { recipe_id: string | null }).recipe_id)
      .filter((id): id is string => !!id),
  ));
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from('recipes')
    .select('id, slug, name, thai_name, cover_data:media_assets!cover_asset_id(image_url, alt_text)')
    .in('id', ids)
    .eq('is_published', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Recipes-using-ingredient fetch error:', error);
    return [];
  }
  return (data || []) as unknown as RecipeLink[];
}

export const ingredientService = {

  /** 🌿 INGREDIENTS INDEX: published+visible ingredients for the hub grid, category grids and sibling nav.
   *  Gate = is_published AND is_visible_public; kitchen_usage NULL rows are excluded ("not shown"). */
  async getIngredientsIndex(): Promise<IngredientListItem[]> {
    const data = await fetchWithCache<IngredientListItem[]>('ingredients_index_v2', async () => {
      const { data, error } = await supabase
        .from('ingredients_library')
        .select(INDEX_COLS)
        .eq('is_published', true)
        .eq('is_visible_public', true)
        .not('kitchen_usage', 'is', null)
        .order('name', { ascending: true });

      if (error) {
        console.error('Ingredients index fetch error:', error);
        return [];
      }
      return (data || []) as unknown as IngredientListItem[];
    });
    return data || [];
  },

  /** 🌿 INGREDIENT DETAIL: full rich-article record + the recipes that use it. */
  async getIngredientBySlug(slug: string): Promise<IngredientDetail | null> {
    return fetchWithCache<IngredientDetail>(`ingredient_${slug}_v2`, async () => {
      const { data, error } = await supabase
        .from('ingredients_library')
        .select(`
          *,
          author:authors(name, title, description, avatar:media_assets!avatar_asset_id(image_url, alt_text)),
          cover_data:media_assets!image_asset_id(image_url, alt_text, title),
          category:content_categories!category_id(id, title, slug)
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) {
        console.error(`Ingredient fetch error [${slug}]:`, error);
        return null;
      }

      // Resolve author avatar_asset_id → media_assets; keep author.avatar_url alias (culture pattern).
      const result = data as Record<string, unknown>;
      const author = result.author as Record<string, unknown> | null;
      if (author) {
        const av = author.avatar as { image_url?: string } | null;
        author.avatar_url = av?.image_url ?? null;
      }

      // Recipes that use this ingredient (published only). Empty array = section hidden in UI.
      result.used_in_recipes = await fetchRecipesUsingIngredient(result.id as string);

      return result as unknown as IngredientDetail;
    });
  },
};
