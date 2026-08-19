/**
 * MenuManager - stato e dati: piatti selezionati/fissi per la prenotazione, categorie menu,
 * categoria attiva, ricetta in vista, azioni (modifica menu, Ask Cherry, musica).
 * Estratto da MenuManager.tsx (#16 split monstre) a comportamento invariato.
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- righe piatti non tipizzate, come nell'originale */
import { useState, useEffect } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import type { RecipeData } from '../../menu/RecipeView';
import { contentService } from '@thaiakha/shared/services';
import { ContentCategoryDB } from '@thaiakha/shared';
import { normalizeCatKey, FALLBACK_CATEGORY_INFO } from './menuHelpers';
import type { MenuManagerProps } from './types';

export function useMenuManager({ bookingId, menuSelection, onNavigate }: Pick<MenuManagerProps, 'bookingId' | 'menuSelection' | 'onNavigate'>) {
  const [loading, setLoading] = useState(true);
  const [selectedDishes, setSelectedDishes] = useState<any[]>([]);
  const [fixedDishes, setFixedDishes] = useState<any[]>([]);
  const [categories, setCategories] = useState<ContentCategoryDB[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('akha_specialty');
  const [viewingRecipe, setViewingRecipe] = useState<RecipeData | null>(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchMenuDetails = async () => {
      // Only show top-level loading if we have no dishes yet
      if (selectedDishes.length === 0 && fixedDishes.length === 0) {
        setLoading(true);
      }
      
      try {
        // 0. Fetch Categories for Tabs
        if (categories.length === 0) {
            const cats = await contentService.getContentCategories('recipe');
            // Filter only fixed experience categories for these tabs
            const fixedCats = cats.filter(c => ['akha_specialty', 'appetizer', 'dessert'].includes(normalizeCatKey(c.id)));
            setCategories(fixedCats);
            if (fixedCats.length > 0 && !activeCategory) {
               setActiveCategory(normalizeCatKey(fixedCats[0].id));
            }
        }

        // 1. Fetch Fixed Dishes (Included Experience) - Fetch only once
        if (fixedDishes.length === 0) {
          const { data: fixed } = await supabase
              .from('recipes')
              .select('*, recipe_key_ingredients(ingredient), cover:media_assets!cover_asset_id(asset_id, image_url, alt_text)')
              .eq('recipe_type', 'class')
              .eq('is_fixed_dish', true)
              .order('category');
          
          if (fixed) setFixedDishes(fixed);
        }

        // 2. Fetch Selected Dishes (Your Menu)
        if (menuSelection) {
          const ids = [
            menuSelection.curry_id,
            menuSelection.soup_id,
            menuSelection.stirfry_id
          ].filter((id): id is string => Boolean(id));

          if (ids.length > 0) {
            // Check if IDs have changed before refetching
            const currentIds = selectedDishes.map(d => d.id).sort();
            const newIds = [...ids].sort();
            const hasChanged = JSON.stringify(currentIds) !== JSON.stringify(newIds);

            if (hasChanged || selectedDishes.length === 0) {
              const { data: selected } = await supabase
                .from('recipes')
                .select('*, cover:media_assets!cover_asset_id(asset_id, image_url, alt_text)')
                .eq('recipe_type', 'class')
                .in('id', ids);
              const ordered = [
                selected?.find(r => r.id === menuSelection.curry_id),
                selected?.find(r => r.id === menuSelection.soup_id),
                selected?.find(r => r.id === menuSelection.stirfry_id)
              ].filter(Boolean)
                // Resolve cover → image so the "Your Menu" hero cards (<img src={dish.image}>) render.
                .map((r: any) => ({ ...r, image: r.cover?.image_url || r.image }));

              setSelectedDishes(ordered as any[]);
            }
          } else {
             setSelectedDishes([]);
          }
        } else {
            setSelectedDishes([]);
        }
      } catch (err) {
        console.error("Menu Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenuDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch only when menuSelection changes; selectedDishes is written by this effect (loop risk)
  }, [menuSelection]);

  // --- HELPERS ---
  
  // LOGICA CUSTOM: Unisce piatti DB e Schede Culturali
  const getDisplayItems = (cat: string) => {
    const dbItems = fixedDishes.filter(d => normalizeCatKey(d.category) === cat);

    // 1. APPETIZER: Aggiungi scheda "Wooden Mortar"
    if (cat === 'appetizer') {
        const culturalCard = {
            id: 'culture-mortar',
            name: 'The Wooden Mortar',
            thai_name: 'Krok Mai',
            // Placeholder immagine Mortaio
            image: 'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/og-default.jpg',
            description: 'Why wood? We use the "Krok" to gently bruise the papaya, absorbing flavors without crushing the texture.',
            isCultural: true,
            icon: 'soup_kitchen'
        };
        return [...dbItems, culturalCard];
    }

    // 2. DESSERT: Aggiungi scheda "Magic Rice Color"
    if (cat === 'dessert') {
        const culturalCard = {
            id: 'culture-rice',
            name: 'Natural Chemistry',
            thai_name: 'Anchan Lime',
            // Placeholder immagine Blue Tea
            image: 'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/og-default.jpg',
            description: 'Watch the magic! We boil Blue Pea flowers, then squeeze lime to turn the rice from blue to vibrant purple.',
            isCultural: true,
            icon: 'science'
        };
        return [...dbItems, culturalCard];
    }

    return dbItems;
  };

  // Tabs Configuration
  const FIXED_TABS = categories.map(cat => ({
    value: normalizeCatKey(cat.id),
    label: cat.title,
    icon: cat.icon_name || 'landscape',
    activeColor: 'secondary' as const
  }));

  const getCategoryDescription = (catId: string) => {
      const cat = categories.find(c => normalizeCatKey(c.id) === catId);
      return cat?.description || cat?.subtitle || FALLBACK_CATEGORY_INFO[catId.toLowerCase()] || "";
  };

  const handleEditMenu = () => {
      if (bookingId) onNavigate('menu', undefined, bookingId);
      else onNavigate('menu');
  };

  const handleAskCherry = (dish: any) => {
    const topic = `Tell me about the tradition of ${dish.name} kha`;
    window.dispatchEvent(new CustomEvent('trigger-chat-topic', { detail: { topic } }));
  };

  const handlePlayMusic = (name: string) => {
      alert(`Playing traditional song for: ${name}`);
  };

  return {
    loading, setLoading, selectedDishes, setSelectedDishes, fixedDishes, setFixedDishes, categories, setCategories, activeCategory, setActiveCategory, viewingRecipe, setViewingRecipe, getDisplayItems, FIXED_TABS, getCategoryDescription, handleEditMenu, handleAskCherry, handlePlayMusic,
  };
}

export type MenuManagerState = ReturnType<typeof useMenuManager>;
