/**
 * RecipeView (menu) - stato e logica: ingredienti ricchi + mappa allergie da DB, conflitti dieta/
 * allergie, categorie/menu, audio story/cooking, gallery, Ask Cherry.
 * Estratto da RecipeView.tsx (#16 split monstre) a comportamento invariato.
 */
import { useMemo, useState, useRef, useEffect } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { contentService } from '@thaiakha/shared/services';
import { ContentCategoryDB } from '@thaiakha/shared';
import type { GalleryItem } from '../../modal/GalleryModal';
import type { RecipeData, IngredientDetail } from './types';

interface Params { recipe: RecipeData; allRecipes: RecipeData[]; activeDiet: string; userAllergies: string[]; }

export function useRecipeView({ recipe, allRecipes, activeDiet, userAllergies }: Params) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [activeAudio, setActiveAudio] = useState<'story' | 'cooking' | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<ContentCategoryDB[]>([]);
  const [richIngredients, setRichIngredients] = useState<IngredientDetail[]>([]);
  const [activeIngredient, setActiveIngredient] = useState<IngredientDetail | null>(null);
  const [loadingIng, setLoadingIng] = useState(false);
  const [allergyMap, setAllergyMap]   = useState<Record<string, string>>({});
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // --- 1. FETCH INGREDIENTI & ALLERGY MAP ---
  useEffect(() => {
    const fetchRichIngredients = async () => {
        if (!recipe.keyIngredients || recipe.keyIngredients.length === 0) return;
        setLoadingIng(true);
        const { data } = await supabase
            .from('ingredients_library')
            .select('id, name_en, name_th, phonetic, description, is_visible_public, cover:media_assets!image_asset_id(image_url, alt_text)')
            .in('name_en', recipe.keyIngredients);
        // Resolve cover from image_asset_id → media_assets; keep the image_url alias.
        if (data) setRichIngredients(
            (data as Array<Record<string, unknown>>).map((item) => {
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
            })
        );
        setLoadingIng(false);
    };

    const fetchAllergies = async () => {
        const map = await contentService.getAllergyMap();
        setAllergyMap(map);
    };

    const fetchCategories = async () => {
        const cats = await contentService.getContentCategories('recipe');
        setCategories(cats);
    };

    fetchRichIngredients();
    fetchAllergies();
    fetchCategories();
    
    const mainContainer = document.getElementById('main-scroll-container');
    if (mainContainer) mainContainer.scrollTo({ top: 0, behavior: 'instant' });
    else window.scrollTo(0, 0);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch solo al cambio ricetta (keyIngredients e' un array nuovo a ogni render)
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
    isGalleryOpen, setIsGalleryOpen, galleryItems, galleryStartIndex, setGalleryStartIndex, activeAudio, setActiveAudio, isMenuOpen, setIsMenuOpen, categories, setCategories, richIngredients, setRichIngredients, activeIngredient, setActiveIngredient, loadingIng, setLoadingIng, allergyMap, setAllergyMap, audioRef, menuRef, visibleIngredientsNames, activeConflicts, groupedRecipes, categoryOrder, getCategoryLabel, handleAskCherry, toggleAudio, openGalleryAt,
  };
}

export type RecipeViewState = ReturnType<typeof useRecipeView>;
