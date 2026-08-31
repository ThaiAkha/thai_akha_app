import { useQuery } from '@thaiakha/shared/query';
import { contentService } from '@thaiakha/shared/services';
import type { ContentCategoryDB } from '@thaiakha/shared/types';

/** Vuoto stabile: un `[]` inline sarebbe un riferimento nuovo a ogni render (rompe i useMemo a valle). */
const NO_CATEGORIES: ContentCategoryDB[] = [];

export const contentCategoriesQueryKey = (domain: string) => ['content_categories', domain] as const;

/**
 * Categorie attive di un dominio (recipe, quiz, ...) da content_categories.
 * Data layer unico (CLAUDE.md #17): la stessa `contentService.getContentCategories(domain)`
 * era chiamata dentro un useEffect in quattro file (useRecipeView, useMenuManager,
 * useRecipesListData, UserMenu). Ora una voce di cache sola, condivisa fra le pagine.
 */
export function useContentCategories(domain: string) {
  const query = useQuery({
    queryKey: contentCategoriesQueryKey(domain),
    queryFn: () => contentService.getContentCategories(domain),
  });
  return { categories: query.data ?? NO_CATEGORIES, loading: query.isPending };
}
