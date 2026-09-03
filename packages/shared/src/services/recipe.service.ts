import { supabase } from '@thaiakha/shared/lib/supabase';
import { SpicinessLevel } from '../types';
import { fetchWithCache } from './_cache';
import { CONTENT_CATEGORY_PUBLIC_COLUMNS } from './contentMetadata.service';
import { mediaService } from './media.service';

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
    async getAllRecipesFull(): Promise<Record<string, unknown>[]> {
        const data = await fetchWithCache<Record<string, unknown>[]>('recipes_full_v5', async () => {
            const { data, error } = await supabase
                .from('recipes')
                .select(`*, content_categories(${CONTENT_CATEGORY_PUBLIC_COLUMNS}), recipe_key_ingredients(ingredient, ingredient_id, display_order, dietary_adaptations, ui_role), cover:media_assets!cover_asset_id(asset_id, image_url, alt_text)`)
                .eq('recipe_type', 'class')
                .order('name', { ascending: true });
            if (error) {
                console.error('Recipes fetch error:', error);
                return [];
            }
            return data || [];
        });
        return data || [];
    },

    /** 🍜 RECIPE BY SLUG: Fetch single recipe with deep composition (class recipes only) */
    async getRecipeBySlug(slug: string): Promise<Record<string, unknown> | null> {
        const data = await fetchWithCache<Record<string, unknown> | null>(`recipe_${slug}_v12`, async () => {
            const { data, error } = await supabase
                .from('recipes')
                .select(`
                    *,
                    allergen_adaptations,
                    content_categories (${CONTENT_CATEGORY_PUBLIC_COLUMNS}),
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
                `)
                .eq('slug', slug)
                .eq('recipe_type', 'class')
                .single();
            if (error) {
                console.error(`Recipe fetch error [${slug}]:`, error);
                return null;
            }
            const result = data as Record<string, unknown>;

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
                mediaService.getGallery(`recipe_${slug}`),
                mediaService.getGallery(`recipe_${slug}_culture`),
            ]);
            result.gallery_assets = galleryAssets;
            result.culture_assets = cultureAssets;

            return result;
        });
        return data ?? null;
    },

    /** 🥗 DIETARY PROFILES: Halal, Kosher, Vegan, etc. */
    async getDietaryProfiles(): Promise<Record<string, unknown>[]> {
        return (await fetchWithCache<Record<string, unknown>[]>('dietary_profiles_v3', async () => {
            const { data, error } = await supabase
                .from('dietary_profiles')
                .select(`
                    *,
                    cover:media_assets!image_asset_id(image_url, alt_text),
                    dietary_substitutions (
                        original_ingredient,
                        substitute_ingredient,
                        alt_sub:ingredients_library!alt_substitute_ingredient_id(name)
                    )
                `)
                .order('display_order', { ascending: true });

            if (error) {
                console.error('Dietary Sync Error:', error);
                return [];
            }

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
    async getSpicinessLevels(): Promise<SpicinessLevel[]> {
        const data = await fetchWithCache('spiciness_levels_v2', async () => {
            const { data, error } = await supabase
                .from('spiciness_levels')
                .select('*, photo:media_assets!photo_asset_id(image_url, alt_text, title)')
                .order('id', { ascending: true });

            return error ? [] : (data || []);
        });
        return (data || []) as SpicinessLevel[];
    },

    /** 🛡️ ALLERGY MAP: Key-Value record for fast lookup */
    async getAllergyMap(): Promise<Record<string, string>> {
        const profiles = await recipeService.getDietaryProfiles();
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
    async getIngredientsLibrary(): Promise<Record<string, unknown>[]> {
        const data = await fetchWithCache('ingredients_library_v3', async () => {
            const { data, error } = await supabase
                .from('ingredients_library')
                .select('id, name, name_th, phonetic, description, summary_ai, category_id, cover:media_assets!image_asset_id(image_url, alt_text)');
            if (error) return [];
            // Resolve cover from image_asset_id → media_assets; keep the `image_url`
            // alias so existing consumers keep working after the legacy column is dropped.
            return (data || []).map(item => {
                const cover = (item as Record<string, unknown>).cover as { image_url?: string; alt_text?: string } | null;
                return { ...item, image_url: cover?.image_url ?? null, image_alt: cover?.alt_text ?? null };
            });
        });
        return (data || []) as Record<string, unknown>[];
    },
};
