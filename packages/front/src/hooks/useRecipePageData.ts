import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@thaiakha/shared/query';
import { contentService, recipeService } from '@thaiakha/shared/services';
import type { UserProfile } from '@thaiakha/shared/types';
import { useDietaryKnowledge } from './useDietaryKnowledge';
import { useAudioAsset } from './useAudioAsset';
import { useAllergyMap } from './useAllergyMap';
import { useSpicinessLevels } from './useSpicinessLevels';
import { recipesFullQueryKey } from './useRecipesListData';
import { LOCAL_PASSPORT_KEY } from './useUserPassport';
import { mapToRecipeData } from '../lib/recipeHelpers';
import { adaptRecipeToDiet } from '../lib/recipeAdapter';
import type { RecipeData } from '../components/menu/index';
import type { RecipeCategoryInfo } from '../components/recipes';
import type { GalleryItem } from '../components/modal/GalleryModal';
import { t } from '../i18n';

export interface IngredientDetail {
  id: string;
  name_en: string;
  name_th: string;
  phonetic?: string;
  description: string;
  image_url: string;
  quantity?: string;
  unit?: string;
  prep_note?: string;
  substituted?: boolean;
  ui_role?: 'main' | 'regular' | 'base';
  dietary_adaptations?: Record<string, unknown>;
}

const normalizeAllergenKey = (s: string) =>
  s.replace(/^allergy[_-]/i, '').replace(/[_-]/g, ' ').trim().toLowerCase();

const NO_ROWS: Record<string, unknown>[] = [];
const NO_INGREDIENTS: IngredientDetail[] = [];

export const recipeBySlugQueryKey = (slug: string) => ['recipe', slug] as const;
export const ingredientsLibraryQueryKey = ['ingredients_library'] as const;

export interface UseRecipePageDataResult {
  recipe: RecipeData | null;
  recipeRaw: Record<string, unknown> | null;
  allRecipesRaw: Record<string, unknown>[];
  richIngredients: IngredientDetail[];
  allergyMap: Record<string, string>;
  galleryModalItems: GalleryItem[];
  cultureModalItems: GalleryItem[];
  recipeCategories: RecipeCategoryInfo[];
  previous: Record<string, unknown> | null;
  next: Record<string, unknown> | null;
  activeDiet: string;
  activeAllergies: string[];
  audioId: string | undefined;
  audioAsset: ReturnType<typeof useAudioAsset>['asset'];
  activeConflicts: Array<{ allergen: string; warning: string }>;
  /** Pre-resolved spice level record (all fields) — avoids extra Supabase call in RecipeEssentials */
  spiceLevel: Record<string, unknown> | null;
  loading: boolean;
  /** Nav data (prev/next/all recipes) is still loading — RecipeNav disabled meanwhile */
  navLoading: boolean;
}

/**
 * Data loader della pagina RICETTA SINGOLA (#118 lotto 5, regola #17).
 * Cinque letture su TanStack Query: ricetta per slug + ingredients_library qui,
 * allergy map / spiciness / lista completa via hook condivisi (stessa cache
 * di menu, lista ricette e passport). Le derivazioni (showroom ingredienti,
 * prev/next, categorie, gallerie) sono useMemo puri sui dati in cache.
 */
export function useRecipePageData(
  slug: string,
  userProfile: UserProfile | null | undefined
): UseRecipePageDataResult {
  const [activeDiet, setActiveDiet] = useState('');
  const [activeAllergies, setActiveAllergies] = useState<string[]>([]);

  const { loading: knowledgeLoading, profiles } = useDietaryKnowledge();
  const { allergyMap, loading: allergyLoading } = useAllergyMap();
  const { spicinessLevels, loading: spiceLoading } = useSpicinessLevels();

  const recipeQ = useQuery({
    queryKey: recipeBySlugQueryKey(slug),
    queryFn: async () => (await contentService.getRecipeBySlug(slug)) ?? null,
  });
  const libraryQ = useQuery({
    queryKey: ingredientsLibraryQueryKey,
    queryFn: async () => (await recipeService.getIngredientsLibrary()) ?? NO_ROWS,
  });
  // Stessa chiave della pagina lista (useRecipesListData): una sola copia in cache.
  const allQ = useQuery({
    queryKey: recipesFullQueryKey,
    queryFn: async () => (await contentService.getAllRecipesFull()) ?? NO_ROWS,
  });

  const recipeRaw = (recipeQ.data ?? null) as Record<string, unknown> | null;
  const fullLibrary = libraryQ.data ?? NO_ROWS;
  const allRecipesRaw = allQ.data ?? NO_ROWS;

  const audioId = recipeRaw?.audio_asset_id as string | undefined;
  const { asset: audioAsset } = useAudioAsset({ assetId: audioId });

  useEffect(() => {
    // Logged-in user (non-guest): source of truth is DB via userProfile
    if (userProfile?.dietary_profile && userProfile.id !== 'guest') {
      setActiveDiet(userProfile.dietary_profile);
      setActiveAllergies(userProfile.allergies || []);
    } else {
      // Guest (id === 'guest') or unauthenticated (null): localStorage is always
      // the fresh source — userProfile.dietary_profile may be stale if the guest
      // changed diet after App.tsx loaded (updatePassport only writes localStorage
      // without refreshing userProfile in App).
      try {
        const raw = localStorage.getItem(LOCAL_PASSPORT_KEY);
        if (raw) {
          const local = JSON.parse(raw);
          if (local.dietary_profile) setActiveDiet(local.dietary_profile);
          if (Array.isArray(local.allergies)) setActiveAllergies(local.allergies);
        }
      } catch { /* ignore malformed data */ }
    }
  }, [userProfile]);

  // Spice level risolto dal record ricetta (era parte del fetch critico).
  const spiceLevel = useMemo<Record<string, unknown> | null>(() => {
    const spiceLevelId = recipeRaw?.spice_level_id as number | undefined;
    if (!spiceLevelId) return null;
    const found = spicinessLevels.find(s => s.id === spiceLevelId);
    return found ? (found as unknown as Record<string, unknown>) : null;
  }, [recipeRaw, spicinessLevels]);

  // Showroom ingredienti: derivazione pura (era state + effect, stesso risultato).
  const baseRichIngredients = useMemo<IngredientDetail[]>(() => {
    if (!recipeRaw) return NO_INGREDIENTS;

    // Sort by display_order so 'main' (order 1) always leads the grid
    const keyIngredientsList = ((recipeRaw.recipe_key_ingredients as Array<{
      ingredient: string,
      ingredient_id?: string,
      display_order?: number,
      ui_role?: 'main' | 'regular' | 'base',
      dietary_adaptations?: string | Record<string, unknown>
    }>) || []).slice().sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));

    // Build library maps from fullLibrary (ingredients_library fetched separately)
    // compositionData is no longer fetched (recipe_composition removed from class flow query)
    const libraryMapById = new Map(
      fullLibrary.map(lib => [lib.id as string, lib])
    );
    const libraryMapByName = new Map(
      fullLibrary.map(lib => [(lib.name_en as string).toLowerCase().trim(), lib])
    );

    return keyIngredientsList.map(keyIng => {
      const name = keyIng.ingredient;

      let lib = keyIng.ingredient_id ? libraryMapById.get(keyIng.ingredient_id) : null;
      if (!lib) {
        lib = libraryMapByName.get(name.toLowerCase().trim());
      }

      // Parse dietary_adaptations if it's a string
      let parsedAdaptations: Record<string, unknown> = {};
      if (typeof keyIng.dietary_adaptations === 'string') {
        try { parsedAdaptations = JSON.parse(keyIng.dietary_adaptations); } catch { /* ignore */ }
      } else if (keyIng.dietary_adaptations && typeof keyIng.dietary_adaptations === 'object') {
        parsedAdaptations = keyIng.dietary_adaptations;
      }

      if (!lib) {
        return {
          id: keyIng.ingredient_id || name.toLowerCase().replace(/\s+/g, '-'),
          name_en: name,
          name_th: '',
          description: '',
          image_url: '',
          ui_role: keyIng.ui_role,
          dietary_adaptations: parsedAdaptations,
        };
      }
      return {
        id: lib.id as string,
        name_en: lib.name_en as string,
        name_th: lib.name_th as string,
        phonetic: lib.phonetic as string | undefined,
        description: lib.description as string,
        image_url: lib.image_url as string,
        ui_role: keyIng.ui_role,
        dietary_adaptations: parsedAdaptations,
        // Doses omitted per architectural rule (Visual Showroom vs BoM)
      };
    });
  }, [recipeRaw, fullLibrary]);

  const richIngredients = useMemo<IngredientDetail[]>(() => {
    if (!baseRichIngredients.length) return baseRichIngredients;

    const cleanDiet = activeDiet?.replace('diet_', '').toLowerCase() || 'regular';
    const dietKey = `diet_${cleanDiet}`;

    // Convert activeAllergies to valid keys (e.g., Peanut -> allergy_peanuts or allergy_peanut depending on naming,
    // wait, we map them directly to allergy_${key})
    const allergyKeys = activeAllergies.map(a => `allergy_${a.toLowerCase().replace(/\s+/g, '_')}`);
    const activeKeys = [dietKey, ...allergyKeys];

    return baseRichIngredients.reduce((acc: IngredientDetail[], ing) => {
      // Check adaptations
      if (ing.dietary_adaptations) {
        // Find if any active key has an adaptation for this ingredient
        const matchingKey = activeKeys.find(key => ing.dietary_adaptations![key]);

        if (matchingKey) {
          // dietary_adaptations e' Record<string, unknown> (JSONB): shape reale { action, substitute_id? } (Sistema B).
          const adaptation = ing.dietary_adaptations[matchingKey] as { action?: string; substitute_id?: string };
          if (adaptation.action === 'omit') {
            return acc; // Omit ingredient completely
          }
          if (adaptation.action === 'substitute' && adaptation.substitute_id) {
            // Find substitute from full library
            const substituteLib = fullLibrary.find(lib => lib.id === adaptation.substitute_id);
            if (substituteLib) {
              // Più originali possono convergere sullo stesso sostituto (es. Soy Sauce/Salt
              // in modalità vegan): dedup per id, evita chiavi React duplicate nello showroom.
              if (!acc.some(a => a.id === substituteLib.id)) {
                acc.push({
                  ...ing,
                  id: substituteLib.id as string,
                  name_en: substituteLib.name_en as string,
                  name_th: substituteLib.name_th as string,
                  phonetic: substituteLib.phonetic as string | undefined,
                  description: substituteLib.description as string,
                  image_url: substituteLib.image_url as string,
                  substituted: true
                });
              }
              return acc;
            }
          }
        }
      }
      if (!acc.some(a => a.id === ing.id)) acc.push(ing);
      return acc;
    }, []);
  }, [baseRichIngredients, activeDiet, activeAllergies, fullLibrary]);

  const recipe = useMemo<RecipeData | null>(() => {
    if (!recipeRaw) return null;
    const mapped = mapToRecipeData(recipeRaw);
    return adaptRecipeToDiet(mapped, activeDiet, activeAllergies, profiles);
  }, [recipeRaw, activeDiet, activeAllergies, profiles]);

  const { previous, next } = useMemo(() => {
    if (!recipeRaw || !allRecipesRaw.length) return { previous: null, next: null };
    const currentIndex = allRecipesRaw.findIndex(r => r.id === recipeRaw.id);
    let prev = currentIndex > 0 ? allRecipesRaw[currentIndex - 1] : null;
    let nxt = currentIndex < allRecipesRaw.length - 1 ? allRecipesRaw[currentIndex + 1] : null;
    if (!prev && nxt) prev = allRecipesRaw.find(r => r.id !== recipeRaw.id && r.id !== nxt!.id) ?? null;
    else if (!nxt && prev) nxt = allRecipesRaw.find(r => r.id !== recipeRaw.id && r.id !== prev!.id) ?? null;
    return { previous: prev ?? null, next: nxt ?? null };
  }, [recipeRaw, allRecipesRaw]);

  const recipeCategories = useMemo<RecipeCategoryInfo[]>(() => {
    const seen = new Set<string>();
    const cats: RecipeCategoryInfo[] = [];
    for (const r of allRecipesRaw) {
      const cat = r.content_categories as Record<string, unknown> | undefined;
      if (cat?.id && !seen.has(cat.id as string)) {
        seen.add(cat.id as string);
        cats.push({
          id: cat.id as string,
          title: (cat.title as string) ?? '',
          title_highlight: (cat.title_highlight as string | null) ?? null,
          display_order: (cat.display_order as number) ?? 0,
        });
      }
    }
    return cats;
  }, [allRecipesRaw]);

  const galleryModalItems = useMemo<GalleryItem[]>(() => {
    const assets = (recipeRaw?.gallery_assets as Record<string, unknown>[] | undefined) || [];
    return assets.map(img => ({
      image_url: img.image_url as string,
      title: (img.title as string) || '',
      description: (img.alt_text as string) || '',
      caption: (img.caption as string) || '',
      asset_id: img.asset_id as string,
    }));
  }, [recipeRaw]);

  const cultureModalItems = useMemo<GalleryItem[]>(() => {
    const assets = (recipeRaw?.culture_assets as Record<string, unknown>[] | undefined) || [];
    return assets.map(img => ({
      image_url: img.image_url as string,
      title: (img.title as string) || '',
      description: (img.alt_text as string) || '',
      caption: (img.caption as string) || '',
      asset_id: img.asset_id as string,
    }));
  }, [recipeRaw]);

  const activeConflicts = useMemo(() => {
    if (!recipe || !activeAllergies.length) return [];
    const checkMap: Record<string, boolean> = {
      'peanuts': recipe.hasPeanuts,
      'gluten': recipe.hasGluten,
      'shellfish': recipe.hasShellfish,
      'soy': recipe.hasSoy,
      'eggs': recipe.hasEggs,
      'fish': recipe.hasFish,
      'fish sauce': recipe.hasFishSauce,
      'seafood': recipe.hasSeafood,
      'sesame': recipe.hasSesame,
      'soy sauce': recipe.hasSoySauce,
      'tree nuts': recipe.hasTreeNuts,
    };
    return activeAllergies
      .map(allergen => {
        const normalized = normalizeAllergenKey(allergen);
        const hasConflict = checkMap[normalized] ?? false;
        if (!hasConflict) return null;
        const warning = allergyMap[normalized] || t('recipeSingle:defaultWarning');
        return { allergen: normalized.replace(/\b\w/g, c => c.toUpperCase()), warning };
      })
      .filter((c): c is { allergen: string; warning: string } => c !== null);
  }, [recipe, activeAllergies, allergyMap]);

  // Critico (blocca il render): ricetta + allergy map + spice + library, come prima.
  const loading =
    recipeQ.isPending || libraryQ.isPending || allergyLoading || spiceLoading || knowledgeLoading;

  return {
    recipe,
    recipeRaw,
    allRecipesRaw,
    richIngredients,
    allergyMap,
    galleryModalItems,
    cultureModalItems,
    recipeCategories,
    previous,
    next,
    activeDiet,
    activeAllergies,
    audioId,
    audioAsset,
    activeConflicts,
    spiceLevel,
    loading,
    navLoading: allQ.isPending,
  };
}
