/**
 * MenuManager - stato e dati: piatti selezionati/fissi per la prenotazione, categorie menu,
 * categoria attiva, ricetta in vista, azioni (modifica menu, Ask Cherry, musica).
 * Estratto da MenuManager.tsx (#16 split monstre) a comportamento invariato; le tre letture
 * (categorie, piatti fissi, piatti scelti) sono su useQuery (CLAUDE.md #17).
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- righe piatti non tipizzate, come nell'originale */
import { useEffect, useMemo, useState } from 'react';
import { useQuery, keepPreviousData } from '@thaiakha/shared/query';
import { supabase } from '@thaiakha/shared/lib/supabase';
import type { RecipeData } from '../../menu/RecipeView';
import { useContentCategories } from '../../../hooks/useContentCategories';
import { normalizeCatKey, FALLBACK_CATEGORY_INFO } from './menuHelpers';
import type { MenuManagerProps } from './types';

/** Le tre categorie dell'esperienza inclusa (tab). */
const FIXED_TAB_KEYS = ['akha_specialty', 'appetizer', 'dessert'];
const NO_DISHES: any[] = [];
const NO_IDS: string[] = [];

export const fixedClassDishesQueryKey = ['recipes', 'fixed_class_dishes'] as const;
export const menuSelectedDishesQueryKey = (ids: readonly string[]) =>
  ['recipes', 'menu_selected', ids.join('|')] as const;

export function useMenuManager({ bookingId, menuSelection, onNavigate }: Pick<MenuManagerProps, 'bookingId' | 'menuSelection' | 'onNavigate'>) {
  const [activeCategory, setActiveCategory] = useState<string>('akha_specialty');
  const [viewingRecipe, setViewingRecipe] = useState<RecipeData | null>(null);

  // 0. Categorie per i tab: solo le tre dell'esperienza inclusa.
  const { categories: allCategories, loading: catsLoading } = useContentCategories('recipe');
  const categories = useMemo(
    () => allCategories.filter(c => FIXED_TAB_KEYS.includes(normalizeCatKey(c.id))),
    [allCategories]
  );

  // 1. Piatti fissi (Included Experience): letti una volta, condivisi fra prenotazioni.
  const fixedQ = useQuery({
    queryKey: fixedClassDishesQueryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*, recipe_key_ingredients(ingredient), cover:media_assets!cover_asset_id(asset_id, image_url, alt_text)')
        .eq('recipe_type', 'class')
        .eq('is_fixed_dish', true)
        .order('category');
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  // 2. Piatti scelti (Your Menu): chiave = i tre id nell'ordine curry/soup/stirfry.
  const ids = menuSelection
    ? [menuSelection.curry_id, menuSelection.soup_id, menuSelection.stirfry_id].filter((id): id is string => Boolean(id))
    : NO_IDS;
  const selectedQ = useQuery({
    queryKey: menuSelectedDishesQueryKey(ids),
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*, cover:media_assets!cover_asset_id(asset_id, image_url, alt_text)')
        .eq('recipe_type', 'class')
        .in('id', ids);
      if (error) throw error;
      const selected = data ?? [];
      return [menuSelection?.curry_id, menuSelection?.soup_id, menuSelection?.stirfry_id]
        .map(id => selected.find(r => r.id === id))
        .filter(Boolean)
        // Resolve cover → image so the "Your Menu" hero cards (<img src={dish.image}>) render.
        .map((r: any) => ({ ...r, image: r.cover?.image_url || r.image })) as any[];
    },
    // Al cambio prenotazione restano i piatti precedenti finche' arrivano i nuovi (come prima).
    placeholderData: keepPreviousData,
  });

  const fixedDishes: any[] = fixedQ.data ?? NO_DISHES;
  const selectedDishes: any[] = ids.length > 0 ? (selectedQ.data ?? NO_DISHES) : NO_DISHES;

  // Loading "di pagina" solo al primo caricamento, com'era: dopo, un cambio di prenotazione
  // non rimette gli skeleton (l'originale lo saltava se aveva gia' dei piatti).
  const chainPending = catsLoading || fixedQ.isPending || (ids.length > 0 && selectedQ.isPending);
  const [initialDone, setInitialDone] = useState(false);
  useEffect(() => {
    if (!chainPending) setInitialDone(true);
  }, [chainPending]);
  const loading = !initialDone && chainPending;

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
    loading, selectedDishes, fixedDishes, categories, activeCategory, setActiveCategory, viewingRecipe, setViewingRecipe, getDisplayItems, FIXED_TABS, getCategoryDescription, handleEditMenu, handleAskCherry, handlePlayMusic,
  };
}

export type MenuManagerState = ReturnType<typeof useMenuManager>;
