import { useMemo } from 'react';
import { ingredientService } from '@thaiakha/shared/services';
import { IngredientDetail, IngredientListItem } from '@thaiakha/shared/types';
import { useContentDetail } from './useContentDetail';

/**
 * Single-ingredient detail + prev/next within the provided index.
 * Thin wrapper over the generic useContentDetail (culture/news pattern).
 */
export function useIngredientDetail(slug: string, listItems: IngredientListItem[] = []) {
  const fetcher = useMemo(
    () => (s: string, l: string) => ingredientService.getIngredientBySlug(s, l),
    [],
  );

  const { detail, previous, next, loading, error } = useContentDetail<IngredientDetail, IngredientListItem>({
    cacheKey: 'ingredient_detail',
    slug,
    listItems,
    fetcher,
  });

  return { ingredient: detail, previous, next, loading, error };
}
