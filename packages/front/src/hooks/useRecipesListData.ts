import { useQuery } from '@thaiakha/shared/query';
import { contentService } from '@thaiakha/shared/services';
import { useContentCategories } from './useContentCategories';
import { useSpicinessLevels } from './useSpicinessLevels';
import { useLanguage } from '../context/LanguageContext';

const NO_RECIPES: Record<string, unknown>[] = [];

export const recipesFullQueryKey = (lang = 'en') => ['recipes', 'class_full', lang] as const;

/**
 * Data loader for the Recipes LIST page (Recipes.tsx).
 * Distinct from `useRecipePageData` which serves the single-recipe page.
 * Tre query in cache (CLAUDE.md #17); categorie e piccantezza sono hook condivisi.
 */
export const useRecipesListData = () => {
  const { categories, loading: catsLoading } = useContentCategories('recipe');
  const { spicinessLevels, loading: spiceLoading } = useSpicinessLevels();
  const { lang } = useLanguage();
  const recipesQ = useQuery({
    queryKey: recipesFullQueryKey(lang),
    queryFn: () => contentService.getAllRecipesFull(lang),
  });
  // Qui c'erano 600 ms di attesa aggiunti DOPO l'arrivo dei dati, per non far
  // lampeggiare il caricamento quando la risposta era immediata. Ma il ritardo
  // scattava sempre, anche a cache fredda, cioe' proprio quando l'attesa era gia'
  // lunga e nessun lampeggio era possibile: mezzo secondo regalato al caso
  // peggiore per proteggere il caso migliore. Tolto il 2026-09-05, insieme alla
  // schermata piena che lo rendeva necessario: ora il corpo mostra i suoi
  // scheletri, che possono comparire e sparire senza dare fastidio.
  return {
    categories,
    recipes: recipesQ.data ?? NO_RECIPES,
    spicinessLevels,
    loading: catsLoading || spiceLoading || recipesQ.isPending,
  };
};
