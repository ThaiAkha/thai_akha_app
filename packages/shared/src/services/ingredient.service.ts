import { supabase } from '@thaiakha/shared/lib/supabase';
import { IngredientListItem, IngredientDetail, RecipeLink } from '../types';
import { fetchWithCache, normalizeLang } from './_cache';
import { sidecarJoin, sidecarFilter, mergeSidecarRow, mergeSidecarRows } from '../lib/mergeTranslation';

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

/**
 * Colonne di `ingredients_library` servite al browser: tutte tranne
 * `semantic_vector` (vector 1536, circa 19 KB di testo per riga), che serve solo
 * alla ricerca semantica lato server.
 */
const INGREDIENT_PUBLIC_COLUMNS =
  'author_id, breadcrumbs, canonical_url, category_id, cherry_button_ids, cherry_prompt,' +
  'cherry_response, conclusion, content_quality_score, created_at, culinary_uses,' +
  'default_unit, description, health_benefits, hreflang, id, image_asset_id,' +
  'is_logistics_item, is_published, is_teacher_item, is_visible_public, json_ld,' +
  'key_entities, kitchen_usage, last_content_audit_ai, logistics_shop, name, name_th,' +
  'og_description, og_title, og_type, phonetic, primary_focus_keyword, published_at,' +
  'purchase_group, purchase_pack_label, purchase_pack_size, reading_time_minutes,' +
  'related_ingredients, related_queries_geo, season_months, season_note, season_source,' +
  'season_status, season_verified_at, seo_description, seo_keywords, seo_robots,' +
  'seo_title, slug, storage_area, summary_ai, teacher_shop, the_essential, twitter_card,' +
  'updated_at, usage_note';

/**
 * Ricette che usano un ingrediente: unione di recipe_key_ingredients e
 * recipe_composition. Gli id delle righe ponte arrivano ora insieme al dettaglio
 * (embed nella query madre), quindi qui resta una sola chiamata invece delle tre
 * in fila di prima: dettaglio, poi ponti, poi ricette.
 */
async function fetchRecipesForIds(ids: string[], lang = 'en'): Promise<RecipeLink[]> {
  if (ids.length === 0) return [];

  const l = normalizeLang(lang);
  const query = sidecarFilter(supabase
    .from('recipes')
    .select('id, slug, name, thai_name, cover_data:media_assets!cover_asset_id(image_url, alt_text)'
      + sidecarJoin('recipes_translations', RECIPE_LINK_T_FIELDS, l))
    .in('id', ids)
    .eq('is_published', true)
    .order('name', { ascending: true }), l);
  const { data, error } = await query;

  if (error) {
    console.error('Recipes-using-ingredient fetch error:', error);
    return [];
  }
  return mergeSidecarRows<RecipeLink>(data, l);
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
      const query = sidecarFilter(supabase
        .from('ingredients_library')
        .select(INDEX_COLS + sidecarJoin('ingredients_library_translations', ['name'], l))
        .eq('is_published', true)
        .eq('is_visible_public', true)
        .not('kitchen_usage', 'is', null)
        .order('name', { ascending: true }), l);
      const { data, error } = await query;

      if (error) {
        console.error('Ingredients index fetch error:', error);
        return [];
      }
      return mergeSidecarRows<IngredientListItem>(data, l);
    });
    return data || [];
  },

  /** 🌿 INGREDIENT DETAIL: full rich-article record + the recipes that use it. */
  async getIngredientBySlug(slug: string, lang = 'en'): Promise<IngredientDetail | null> {
    const l = normalizeLang(lang);
    // v4: colonne esplicite (via semantic_vector) + righe ponte nella stessa query.
    return fetchWithCache<IngredientDetail>(`ingredient_${slug}_${l}_v4`, async () => {
      const query = sidecarFilter(supabase
        .from('ingredients_library')
        .select(`
          ${INGREDIENT_PUBLIC_COLUMNS},
          author:authors(name, title, description, avatar:media_assets!avatar_asset_id(image_url, alt_text)),
          cover_data:media_assets!image_asset_id(image_url, alt_text, title),
          category:content_categories!category_id(id, title, slug${sidecarJoin('content_categories_translations', ['title'], l)}),
          key_links:recipe_key_ingredients(recipe_id),
          comp_links:recipe_composition(recipe_id)
        `+ sidecarJoin('ingredients_library_translations', INGREDIENT_T_FIELDS, l))
        .eq('slug', slug)
        .eq('is_published', true), l, INGREDIENT_EMBEDDED);
      const { data, error } = await query.single();

      if (error) {
        console.error(`Ingredient fetch error [${slug}]:`, error);
        return null;
      }

      // Resolve author avatar_asset_id → media_assets; keep author.avatar_url alias (culture pattern).
      const result = mergeSidecarRow(data, l, INGREDIENT_EMBEDDED);
      const author = result.author as Record<string, unknown> | null;
      if (author) {
        const av = author.avatar as { image_url?: string } | null;
        author.avatar_url = av?.image_url ?? null;
      }

      // Recipes that use this ingredient (published only). Empty array = section hidden in UI.
      // Le righe ponte viaggiano con la query madre (embed `key_links`/`comp_links`):
      // qui restano solo gli id da risolvere. Le due chiavi escono dal risultato,
      // cosi' la forma dell'oggetto (e la voce di cache) resta quella di prima.
      type BridgeRow = { recipe_id: string | null };
      const { key_links, comp_links, ...clean } = result as Record<string, unknown>;
      const recipeIds = Array.from(new Set(
        [...((key_links as BridgeRow[] | null) ?? []), ...((comp_links as BridgeRow[] | null) ?? [])]
          .map((r) => r.recipe_id)
          .filter((id): id is string => !!id),
      ));
      clean.used_in_recipes = await fetchRecipesForIds(recipeIds, l);

      return clean as unknown as IngredientDetail;
    });
  },
};
