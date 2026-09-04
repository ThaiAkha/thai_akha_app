import { supabase } from '@thaiakha/shared/lib/supabase';
import { SpicinessLevel } from '../types';
import { fetchWithCache, normalizeLang } from './_cache';
import { CONTENT_CATEGORY_PUBLIC_COLUMNS } from './contentMetadata.service';
import { mediaService } from './media.service';
import { sidecarJoin, mergeSidecarRow, mergeSidecarRows } from '../lib/mergeTranslation';

/**
 * Campi di CONTENUTO dei sidecar del mondo ricetta.
 * `slug` NON entra: lo slug tradotto ha una fonte sola, il registro
 * v_translated_slugs (vedi SIDECAR_META_COLUMNS), e il merge lo scarterebbe comunque.
 */
const RECIPE_T_FIELDS = [
    'name', 'subtitle', 'description', 'excerpt', 'health_benefits', 'garnish', 'cooks_tip',
    'notes', 'author_note', 'servings', 'seo_title', 'seo_description', 'og_title',
    'og_description', 'directions', 'essentials', 'dietary_variants',
] as const;

const CATEGORY_T_FIELDS = [
    'title', 'title_highlight', 'tab_label', 'subtitle', 'description', 'content_body',
    'ui_quote', 'seo_title', 'seo_description', 'og_title', 'og_description',
] as const;

const DIETARY_T_FIELDS = ['name', 'introduction', 'experience', 'description_long'] as const;

const SPICINESS_T_FIELDS = [
    'title', 'subtitle', 'description', 'label', 'philosophy_quote', 'chef_note', 'akha_connection',
] as const;

/** La categoria viaggia DENTRO la ricetta: va fusa allo stesso giro. */
const RECIPE_EMBEDDED = ['content_categories'] as const;

/** Join della categoria incorporata, gia' col suo sidecar. */
const categoryEmbed = (lang: string): string =>
    `content_categories(${CONTENT_CATEGORY_PUBLIC_COLUMNS}${sidecarJoin('content_categories_translations', CATEGORY_T_FIELDS, lang)})`;

export const recipeService = {

    /** 🍜 RECIPES: Titles for Cherry menu guardrail */
    async getRecipes(): Promise<Array<{ title: string }>> {
        const data = await fetchWithCache<Array<{ title: string }>>('recipes_titles_v3', async () => {
            const { data, error } = await supabase
                .from('recipes')
                .select('name')
                .eq('recipe_type', 'class')
                .order('name', { ascending: true });
            if (error) {
                console.error('Recipes fetch error:', error);
                return [];
            }
            return (data || []).map(r => ({ title: (r as Record<string, string>).name }));
        });
        return data || [];
    },

    /** 🍜 RECIPES: All complete recipes with ingredients */
    async getAllRecipesFull(lang = 'en'): Promise<Record<string, unknown>[]> {
        const l = normalizeLang(lang);
        // v6: select cambiata (join sidecar) + lingua nella chiave, o la cache
        // localStorage servirebbe l'inglese sotto /it/.
        const data = await fetchWithCache<Record<string, unknown>[]>(`recipes_full_${l}_v6`, async () => {
            let query = supabase
                .from('recipes')
                .select(`*, ${categoryEmbed(l)}, recipe_key_ingredients(ingredient, ingredient_id, display_order, dietary_adaptations, ui_role), cover:media_assets!cover_asset_id(asset_id, image_url, alt_text)`
                    + sidecarJoin('recipes_translations', RECIPE_T_FIELDS, l))
                .eq('recipe_type', 'class')
                .order('name', { ascending: true });
            if (l !== 'en') {
                query = query.eq('translations.lang', l).eq('content_categories.translations.lang', l);
            }
            const { data, error } = await query;
            if (error) {
                console.error('Recipes fetch error:', error);
                return [];
            }
            // Cast unico (regola repo #20): PostgREST non inferisce la select concatenata.
            return mergeSidecarRows(data as unknown as Record<string, unknown>[], l, RECIPE_EMBEDDED);
        });
        return data || [];
    },

    /** 🍜 RECIPE BY SLUG: Fetch single recipe with deep composition (class recipes only) */
    async getRecipeBySlug(slug: string, lang = 'en'): Promise<Record<string, unknown> | null> {
        const l = normalizeLang(lang);
        // v13: select cambiata (join sidecar) + lingua nella chiave.
        const data = await fetchWithCache<Record<string, unknown> | null>(`recipe_${slug}_${l}_v13`, async () => {
            let query = supabase
                .from('recipes')
                .select(`
                    *,
                    allergen_adaptations,
                    ${categoryEmbed(l)},
                    authors (
                        id,
                        name,
                        title,
                        description,
                        slug,
                        avatar:media_assets!avatar_asset_id(image_url, alt_text)
                    ),
                    cover:media_assets!cover_asset_id (
                        asset_id,
                        image_url,
                        alt_text,
                        title,
                        caption
                    ),
                    recipe_key_ingredients (
                        ingredient,
                        ingredient_id,
                        display_order,
                        dietary_adaptations,
                        ui_role
                    )
                `+ sidecarJoin('recipes_translations', RECIPE_T_FIELDS, l))
                .eq('slug', slug)
                .eq('recipe_type', 'class');
            if (l !== 'en') {
                query = query.eq('translations.lang', l).eq('content_categories.translations.lang', l);
            }
            const { data, error } = await query.single();
            if (error) {
                console.error(`Recipe fetch error [${slug}]:`, error);
                return null;
            }
            // Cast unico (regola repo #20): PostgREST non inferisce la select concatenata.
            const result = mergeSidecarRow(data as unknown as Record<string, unknown>, l, RECIPE_EMBEDDED);

            // Resolve author avatar_asset_id → media_assets; keep authors.avatar_url alias.
            const recipeAuthor = result.authors as Record<string, unknown> | null;
            if (recipeAuthor) {
                const av = recipeAuthor.avatar as { image_url?: string } | null;
                recipeAuthor.avatar_url = av?.image_url ?? null;
            }

            // Gallerie da gallery_items (FONTE UNICA) via getGallery, ordinate per
            // display_order. Sostituisce gallery_asset_ids / culture_asset_ids (restano
            // nel DB per l'admin, non più letti dal front). Shape superset (aggiunge quote).
            const [galleryAssets, cultureAssets] = await Promise.all([
                mediaService.getGallery(`recipe_${slug}`, l),
                mediaService.getGallery(`recipe_${slug}_culture`, l),
            ]);
            result.gallery_assets = galleryAssets;
            result.culture_assets = cultureAssets;

            return result;
        });
        return data ?? null;
    },

    /** 🥗 DIETARY PROFILES: Halal, Kosher, Vegan, etc. */
    async getDietaryProfiles(lang = 'en'): Promise<Record<string, unknown>[]> {
        const l = normalizeLang(lang);
        // v4: select cambiata (join sidecar) + lingua nella chiave.
        return (await fetchWithCache<Record<string, unknown>[]>(`dietary_profiles_${l}_v4`, async () => {
            let query = supabase
                .from('dietary_profiles')
                .select(`
                    *,
                    cover:media_assets!image_asset_id(image_url, alt_text),
                    dietary_substitutions (
                        original_ingredient,
                        substitute_ingredient,
                        alt_sub:ingredients_library!alt_substitute_ingredient_id(name)
                    )
                `+ sidecarJoin('dietary_profiles_translations', DIETARY_T_FIELDS, l))
                .order('display_order', { ascending: true });
            if (l !== 'en') query = query.eq('translations.lang', l);
            const { data: raw, error } = await query;

            if (error) {
                console.error('Dietary Sync Error:', error);
                return [];
            }

            // Cast unico (regola repo #20): PostgREST non inferisce la select concatenata.
            const data = mergeSidecarRows(raw as unknown as Record<string, unknown>[], l);
            return data.map(p => ({
                id: (p as Record<string, unknown>).id,
                name: (p as Record<string, unknown>).name,
                icon: (p as Record<string, unknown>).icon,
                type: (p as Record<string, unknown>).type || 'lifestyle',
                image_url: ((p as Record<string, unknown>).cover as { image_url?: string } | null)?.image_url ?? null,
                display_order: (p as Record<string, unknown>).display_order || 0,
                description: (p as Record<string, unknown>).introduction,
                description_long: (p as Record<string, unknown>).description_long,
                experience: (p as Record<string, unknown>).experience,
                substitutions: ((p as unknown as Record<string, unknown[]>).dietary_substitutions || []).map(s => ({
                    original: (s as Record<string, string>).original_ingredient,
                    substitute: (s as Record<string, string>).substitute_ingredient,
                    alt_substitute: ((s as Record<string, Record<string, string> | null>).alt_sub)?.name || null,
                })),
            }));
        })) || [];
    },

    /** 🔥 SPICINESS LEVELS: All spiciness options */
    async getSpicinessLevels(lang = 'en'): Promise<SpicinessLevel[]> {
        const l = normalizeLang(lang);
        // v3: select cambiata (join sidecar) + lingua nella chiave.
        const data = await fetchWithCache(`spiciness_levels_${l}_v3`, async () => {
            let query = supabase
                .from('spiciness_levels')
                .select('*, photo:media_assets!photo_asset_id(image_url, alt_text, title)'
                    + sidecarJoin('spiciness_levels_translations', SPICINESS_T_FIELDS, l))
                .order('id', { ascending: true });
            if (l !== 'en') query = query.eq('translations.lang', l);
            const { data, error } = await query;

            // Cast unico (regola repo #20): PostgREST non inferisce la select concatenata.
            return error ? [] : mergeSidecarRows(data as unknown as Record<string, unknown>[], l);
        });
        return (data || []) as unknown as SpicinessLevel[];
    },

    /** 🛡️ ALLERGY MAP: Key-Value record for fast lookup */
    async getAllergyMap(lang = 'en'): Promise<Record<string, string>> {
        const profiles = await recipeService.getDietaryProfiles(lang);
        return Object.fromEntries(
            profiles
                .filter(p => p.type === 'allergy')
                .map(item => [
                    String(item.id).replace(/^allergy[_-]/, '').replace(/[_-]/g, ' ').toLowerCase(),
                    String(item.experience || (item as any).description || ''),
                ])
        );
    },

    /** 🧅 INGREDIENTS LIBRARY: Fetch all ingredients for substitutions */
    async getIngredientsLibrary(lang = 'en'): Promise<Record<string, unknown>[]> {
        const l = normalizeLang(lang);
        // v4: select cambiata (join sidecar) + lingua nella chiave.
        const data = await fetchWithCache(`ingredients_library_${l}_v4`, async () => {
            let query = supabase
                .from('ingredients_library')
                .select('id, name, name_th, phonetic, description, summary_ai, category_id, cover:media_assets!image_asset_id(image_url, alt_text)'
                    + sidecarJoin('ingredients_library_translations', ['name', 'description', 'summary_ai'], l));
            if (l !== 'en') query = query.eq('translations.lang', l);
            const { data: raw, error } = await query;
            if (error) return [];
            // Cast unico (regola repo #20): PostgREST non inferisce la select concatenata.
            const data = mergeSidecarRows(raw as unknown as Record<string, unknown>[], l);
            // Resolve cover from image_asset_id → media_assets; keep the `image_url`
            // alias so existing consumers keep working after the legacy column is dropped.
            return data.map(item => {
                const cover = (item as Record<string, unknown>).cover as { image_url?: string; alt_text?: string } | null;
                return { ...item, image_url: cover?.image_url ?? null, image_alt: cover?.alt_text ?? null };
            });
        });
        return (data || []) as Record<string, unknown>[];
    },
};
