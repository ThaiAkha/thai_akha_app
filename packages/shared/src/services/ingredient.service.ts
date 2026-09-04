import { supabase } from '@thaiakha/shared/lib/supabase';
import { IngredientListItem, IngredientDetail, RecipeLink } from '../types';
import { fetchWithCache, normalizeLang } from './_cache';
import { sidecarJoin, mergeSidecarRow, mergeSidecarRows } from '../lib/mergeTranslation';

/** Campi di CONTENUTO del sidecar ingrediente (`slug` escluso: fonte = registro slug). */
const INGREDIENT_T_FIELDS = [
  'name', 'description', 'conclusion', 'culinary_uses', 'health_benefits', 'kitchen_usage',
  'the_essential', 'usage_note', 'season_note', 'seo_title', 'seo_description',
  'og_title', 'og_description',
] as const;

/** Solo il nome serve tradotto nelle card "usato in queste ricette". */
const RECIPE_LINK_T_FIELDS = ['name'] as const;

/** La categoria viaggia dentro il dettaglio ingrediente e va fusa allo stesso giro. */
const INGREDIENT_EMBEDDED = ['category'] as const;

// Light columns for the hub/category grids + sibling nav (cover joined via image_asset_id).
const INDEX_COLS =
  'id, slug, name, name_th, phonetic, category_id, ' +
  'cover_data:media_assets!image_asset_id(image_url, alt_text, title)';

/** Recipes that use an ingredient — union of recipe_key_ingredients + recipe_composition. */
async function fetchRecipesUsingIngredient(ingredientId: string, lang = 'en'): Promise<RecipeLink[]> {
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

  const l = normalizeLang(lang);
  let query = supabase
    .from('recipes')
    .select('id, slug, name, thai_name, cover_data:media_assets!cover_asset_id(image_url, alt_text)'
      + sidecarJoin('recipes_translations', RECIPE_LINK_T_FIELDS, l))
    .in('id', ids)
    .eq('is_published', true)
    .order('name', { ascending: true });
  if (l !== 'en') query = query.eq('translations.lang', l);
  const { data, error } = await query;

  if (error) {
    console.error('Recipes-using-ingredient fetch error:', error);
    return [];
  }
  // Cast unico (regola repo #20): PostgREST non inferisce la select concatenata.
  return mergeSidecarRows(data as unknown as Record<string, unknown>[], l) as unknown as RecipeLink[];
}

export const ingredientService = {

  /** 🌿 INGREDIENTS INDEX: published+visible ingredients for the hub grid, category grids and sibling nav.
   *  Gate = is_published AND is_visible_public; kitchen_usage NULL rows are excluded ("not shown"). */
  async getIngredientsIndex(lang = 'en'): Promise<IngredientListItem[]> {
    const l = normalizeLang(lang);
    // v3: select cambiata (join sidecar) + lingua nella chiave.
    const data = await fetchWithCache<IngredientListItem[]>(`ingredients_index_${l}_v3`, async () => {
      // I tre gate restano sulla riga MADRE: `kitchen_usage` decide se l'ingrediente
      // si mostra, e quella decisione non cambia da lingua a lingua.
      let query = supabase
        .from('ingredients_library')
        .select(INDEX_COLS + sidecarJoin('ingredients_library_translations', ['name'], l))
        .eq('is_published', true)
        .eq('is_visible_public', true)
        .not('kitchen_usage', 'is', null)
        .order('name', { ascending: true });
      if (l !== 'en') query = query.eq('translations.lang', l);
      const { data, error } = await query;

      if (error) {
        console.error('Ingredients index fetch error:', error);
        return [];
      }
      // Cast unico (regola repo #20): PostgREST non inferisce la select concatenata.
      return mergeSidecarRows(data as unknown as Record<string, unknown>[], l) as unknown as IngredientListItem[];
    });
    return data || [];
  },

  /** 🌿 INGREDIENT DETAIL: full rich-article record + the recipes that use it. */
  async getIngredientBySlug(slug: string, lang = 'en'): Promise<IngredientDetail | null> {
    const l = normalizeLang(lang);
    // v3: select cambiata (join sidecar) + lingua nella chiave.
    return fetchWithCache<IngredientDetail>(`ingredient_${slug}_${l}_v3`, async () => {
      let query = supabase
        .from('ingredients_library')
        .select(`
          *,
          author:authors(name, title, description, avatar:media_assets!avatar_asset_id(image_url, alt_text)),
          cover_data:media_assets!image_asset_id(image_url, alt_text, title),
          category:content_categories!category_id(id, title, slug${sidecarJoin('content_categories_translations', ['title'], l)})
        `+ sidecarJoin('ingredients_library_translations', INGREDIENT_T_FIELDS, l))
        .eq('slug', slug)
        .eq('is_published', true);
      if (l !== 'en') {
        query = query.eq('translations.lang', l).eq('category.translations.lang', l);
      }
      const { data, error } = await query.single();

      if (error) {
        console.error(`Ingredient fetch error [${slug}]:`, error);
        return null;
      }

      // Resolve author avatar_asset_id → media_assets; keep author.avatar_url alias (culture pattern).
      // Cast unico (regola repo #20): PostgREST non inferisce la select concatenata.
      const result = mergeSidecarRow(data as unknown as Record<string, unknown>, l, INGREDIENT_EMBEDDED);
      const author = result.author as Record<string, unknown> | null;
      if (author) {
        const av = author.avatar as { image_url?: string } | null;
        author.avatar_url = av?.image_url ?? null;
      }

      // Recipes that use this ingredient (published only). Empty array = section hidden in UI.
      result.used_in_recipes = await fetchRecipesUsingIngredient(result.id as string, l);

      return result as unknown as IngredientDetail;
    });
  },
};
