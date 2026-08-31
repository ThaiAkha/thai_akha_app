/**
 * RecipeView (menu) - stato e logica: ingredienti ricchi + mappa allergie da DB, conflitti dieta/
 * allergie, categorie/menu, audio story/cooking, gallery, Ask Cherry.
 * Estratto da RecipeView.tsx (#16 split monstre) a comportamento invariato; le tre letture
 * (ingredienti per nome, allergy map, categorie) sono su useQuery (CLAUDE.md #17).
 */
import { useMemo, useState, useRef, useEffect } from 'react';
import { useQuery } from '@thaiakha/shared/query';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { useContentCategories } from '../../../hooks/useContentCategories';
import { useAllergyMap } from '../../../hooks/useAllergyMap';
import type { GalleryItem } from '../../modal/GalleryModal';
import type { RecipeData, IngredientDetail } from './types';

interface Params { recipe: RecipeData; allRecipes: RecipeData[]; activeDiet: string; userAllergies: string[]; }

const NO_INGREDIENTS: IngredientDetail[] = [];
const NO_NAMES: string[] = [];
/** Chiave per insieme di nomi (ordinati): due ricette con gli stessi ingredienti condividono la voce. */
export const ingredientsByNameQueryKey = (names: readonly string[]) =>
  ['ingredients_by_name', [...names].sort().join('|')] as const;

export function useRecipeView({ recipe, allRecipes, activeDiet, userAllergies }: Params) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [activeAudio, setActiveAudio] = useState<'story' | 'cooking' | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeIngredient, setActiveIngredient] = useState<IngredientDetail | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // --- 1. INGREDIENTI RICCHI, ALLERGY MAP, CATEGORIE ---
  const ingredientNames = recipe.keyIngredients ?? NO_NAMES;
  const ingredientsQ = useQuery({
    queryKey: ingredientsByNameQueryKey(ingredientNames),
    enabled: ingredientNames.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients_library')
        .select('id, name_en, name_th, phonetic, description, is_visible_public, cover:media_assets!image_asset_id(image_url, alt_text)')
        .in('name_en', ingredientNames);
      if (error) throw error;
      // Resolve cover from image_asset_id → media_assets; keep the image_url alias.
      return ((data ?? []) as Array<Record<string, unknown>>).map((item): IngredientDetail => {
        const cover = item.cover as { image_url?: string } | null;
        return {
          id: item.id as string,
          name_en: item.name_en as string,
          name_th: item.name_th as string,
          phonetic: item.phonetic as string | undefined,
          description: item.description as string,
          is_visible_public: item.is_visible_public as boolean,
          image_url: cover?.image_url ?? '',
        };
      });
    },
  });
  const { allergyMap } = useAllergyMap();
  const { categories } = useContentCategories('recipe');

  const richIngredients = ingredientsQ.data ?? NO_INGREDIENTS;
  const loadingIng = ingredientNames.length > 0 && ingredientsQ.isPending;

  // Al cambio ricetta si torna in cima (come prima).
  useEffect(() => {
    const mainContainer = document.getElementById('main-scroll-container');
    if (mainContainer) mainContainer.scrollTo({ top: 0, behavior: 'instant' });
    else window.scrollTo(0, 0);
  }, [recipe.id]);

  // --- 2. FILTRO PRIVACY PUBBLICA ---
  const visibleIngredientsNames = useMemo(() => {
    return recipe.keyIngredients.filter(name => {
      const rich = richIngredients.find(ri => ri.name_en === name);
      return rich ? rich.is_visible_public : false;
    });
  }, [recipe.keyIngredients, richIngredients]);

  // --- 3. RILEVAMENTO CONFLITTI ALLERGIE (Safety Shield) ---
  const activeConflicts = useMemo(() => {
    const conflicts: { allergen: string; warning: string }[] = [];
    const checkMap: Record<string, boolean> = {
      'Peanuts': recipe.hasPeanuts,
      'Shellfish': recipe.hasShellfish,
      'Gluten': recipe.hasGluten,
      'Soy': recipe.hasSoy,
      'Eggs': recipe.hasEggs,
      'Fish': recipe.hasFish,
      'Fish Sauce': recipe.hasFishSauce,
      'Seafood': recipe.hasSeafood,
      'Sesame': recipe.hasSesame,
      'Soy Sauce': recipe.hasSoySauce,
      'Tree Nuts': recipe.hasTreeNuts
    };

    userAllergies.forEach(allergen => {
      const key = Object.keys(checkMap).find(k => k.toLowerCase() === allergen.toLowerCase());
      if (key && checkMap[key]) {
        const kbKey = allergen.toLowerCase();
        const warning = allergyMap[kbKey] || "We will modify the preparation for your safety.";
        conflicts.push({ allergen, warning });
      }
    });
    return conflicts;
  }, [recipe, userAllergies, allergyMap]);

  // --- 4. MEDIA & DROPDOWN DATA ---
  const galleryItems: GalleryItem[] = useMemo(() => {
    const mainImage: GalleryItem = { image_url: recipe.image, title: recipe.name, description: "Signature Dish" };
    const secondaryImages = (recipe.galleryImages || []).map((url, i) => ({ image_url: url, title: `Detail ${i + 1}` }));
    return [mainImage, ...secondaryImages];
  }, [recipe]);

  const groupedRecipes = useMemo(() => {
    const groups: Record<string, RecipeData[]> = {};
    categories.forEach(cat => groups[cat.id] = []);
    allRecipes.forEach(r => {
      const catId = r.category;
      if (!groups[catId]) {
         // Try finding matching category by prefix or ID
         const found = categories.find(c => catId.includes(c.id.toLowerCase()) || c.id.toLowerCase().includes(catId.toLowerCase()));
         if (found) {
            if (!groups[found.id]) groups[found.id] = [];
            groups[found.id].push(r);
         }
      } else {
         groups[catId].push(r);
      }
    });
    return groups;
  }, [allRecipes, categories]);

  const categoryOrder = useMemo(() => categories.map(c => c.id), [categories]);

  const getCategoryLabel = (catId: string) => {
      const cat = categories.find(c => c.id === catId);
      return cat?.title || catId.toUpperCase();
  };

  // --- HANDLERS ---
  const handleAskCherry = () => {
    const topic = `Tell me about the history of ${recipe.name} for my ${activeDiet} diet kha`;
    window.dispatchEvent(new CustomEvent('trigger-chat-topic', { detail: { topic } }));
  };

  const toggleAudio = (type: 'story' | 'cooking') => {
    if (activeAudio === type) {
      audioRef.current?.pause();
      setActiveAudio(null);
    } else {
      const url = type === 'story' ? recipe.audio_story_url : recipe.audio_cooking_url;
      if (url && audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setActiveAudio(type);
      }
    }
  };

  const openGalleryAt = (index: number) => {
    setGalleryStartIndex(index);
    setIsGalleryOpen(true);
  };

  return {
    isGalleryOpen, setIsGalleryOpen, galleryItems, galleryStartIndex, setGalleryStartIndex, activeAudio, setActiveAudio, isMenuOpen, setIsMenuOpen, categories, richIngredients, activeIngredient, setActiveIngredient, loadingIng, allergyMap, audioRef, menuRef, visibleIngredientsNames, activeConflicts, groupedRecipes, categoryOrder, getCategoryLabel, handleAskCherry, toggleAudio, openGalleryAt,
  };
}

export type RecipeViewState = ReturnType<typeof useRecipeView>;
