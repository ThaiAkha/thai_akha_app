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
    () => (s: string) => ingredientService.getIngredientBySlug(s),
    [],
  );

  const { detail, previous, next, loading, error } = useContentDetail<IngredientDetail, IngredientListItem>({
    slug,
    listItems,
    fetcher,
  });

  return { ingredient: detail, previous, next, loading, error };
}
