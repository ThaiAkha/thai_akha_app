import { useMemo } from 'react';
import { useQuery } from '@thaiakha/shared/query';
import { ingredientService } from '@thaiakha/shared/services';
import type { IngredientListItem } from '@thaiakha/shared/types';
import { useContentCategories } from './useContentCategories';
import { useLanguage } from '../context/LanguageContext';
import { usePageMetadata } from './usePageMetadata';

// URL patterns (hub prefix = 'thai-cooking-ingredients'):
//   /thai-cooking-ingredients                         → hub (6 category cards)
//   /thai-cooking-ingredients/{cat-slug}-guide        → category landing (ingredient grid)
//   /thai-cooking-ingredients/{ingredient-slug}       → single ingredient (rich article)
// Disambiguation: category slugs end in '-guide', ingredient slugs never do.

export const INGREDIENTS_HUB_SLUG = 'thai-cooking-ingredients';

export type IngredientsView = 'hub' | 'category' | 'detail';

export function isCategorySlug(sub: string | null | undefined): boolean {
  return !!sub && sub.endsWith('-guide');
}

const NO_INGREDIENTS: IngredientListItem[] = [];

export const ingredientsIndexQueryKey = (lang = 'en') => ['ingredients_index', lang] as const;

/**
 * Hub ingredienti: indice + categorie + metadata pagina. Data layer unico (CLAUDE.md #17):
 * era un Promise.all in useEffect; ora tre query in cache, e i metadata condividono la
 * chiave di PageLayout (prima si pagavano una seconda volta a ogni mount).
 */
export function useIngredientsFeed(targetSection?: string | null) {
  const { lang } = useLanguage();
  const index = useQuery({
    queryKey: ingredientsIndexQueryKey(lang),
    queryFn: () => ingredientService.getIngredientsIndex(lang),
  });
  const { categories, loading: catsLoading } = useContentCategories('ingredient');
  const { metadata, loading: metaLoading } = usePageMetadata(INGREDIENTS_HUB_SLUG);

  const ingredients = index.data ?? NO_INGREDIENTS;
  const loading = index.isPending || catsLoading || metaLoading;
  const error = index.isError;

  // The sub-slug (parts[1], passed as targetSection) selects the view.
  const sub = targetSection ?? null;
  const view: IngredientsView = isCategorySlug(sub) ? 'category' : (sub ? 'detail' : 'hub');
  const activeCategorySlug = view === 'category' ? sub : null;
  const activeSlug = view === 'detail' ? sub : null;

  const activeCategory = useMemo(
    () => categories.find(c => c.slug === activeCategorySlug) ?? null,
    [categories, activeCategorySlug],
  );

  const categoryIngredients = useMemo(() => {
    if (!activeCategory) return [];
    return ingredients.filter(i => i.category_id === activeCategory.id);
  }, [ingredients, activeCategory]);

  // Ingredient count per category (for the hub cards).
  const countByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ing of ingredients) {
      if (ing.category_id) counts[ing.category_id] = (counts[ing.category_id] ?? 0) + 1;
    }
    return counts;
  }, [ingredients]);

  return {
    view,
    ingredients,
    categories,
    countByCategory,
    activeSlug,
    activeCategorySlug,
    activeCategory,
    categoryIngredients,
    pageMetadata: metadata,
    loading,
    error,
    isInitialLoading: loading && ingredients.length === 0,
  };
}
