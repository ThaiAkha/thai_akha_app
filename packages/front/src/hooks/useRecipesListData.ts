import { useEffect, useState } from 'react';
import { useQuery } from '@thaiakha/shared/query';
import { contentService } from '@thaiakha/shared/services';
import { useContentCategories } from './useContentCategories';
import { useSpicinessLevels } from './useSpicinessLevels';

const NO_RECIPES: Record<string, unknown>[] = [];

export const recipesFullQueryKey = ['recipes', 'class_full'] as const;

/**
 * Data loader for the Recipes LIST page (Recipes.tsx).
 * Distinct from `useRecipePageData` which serves the single-recipe page.
 * Tre query in cache (CLAUDE.md #17); categorie e piccantezza sono hook condivisi.
 */
export const useRecipesListData = () => {
  const { categories, loading: catsLoading } = useContentCategories('recipe');
  const { spicinessLevels, loading: spiceLoading } = useSpicinessLevels();
  const recipesQ = useQuery({
    queryKey: recipesFullQueryKey,
    queryFn: () => contentService.getAllRecipesFull(),
  });
  const fetching = catsLoading || spiceLoading || recipesQ.isPending;

  // Coda artificiale di 600 ms dopo l'arrivo dei dati (invariata): evita il flash dello
  // skeleton quando la risposta e' immediata, che con la cache e' il caso normale.
  const [tailDone, setTailDone] = useState(false);
  useEffect(() => {
    if (fetching) return;
    const t = setTimeout(() => setTailDone(true), 600);
    return () => clearTimeout(t);
  }, [fetching]);

  return {
    categories,
    recipes: recipesQ.data ?? NO_RECIPES,
    spicinessLevels,
    loading: fetching || !tailDone,
  };
};
