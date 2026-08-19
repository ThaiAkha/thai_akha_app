import { useState, useEffect, useMemo } from 'react';
import { ingredientService, contentMetadataService } from '@thaiakha/shared/services';
import { IngredientListItem, ContentCategoryDB } from '@thaiakha/shared/types';
import type { PageMetadata } from './usePageSections';

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

export function useIngredientsFeed(targetSection?: string | null) {
  const [ingredients, setIngredients] = useState<IngredientListItem[]>([]);
  const [categories, setCategories] = useState<ContentCategoryDB[]>([]);
  const [metadata, setMetadata] = useState<PageMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(false);
        const [indexData, categoriesData, metaData] = await Promise.all([
          ingredientService.getIngredientsIndex(),
          contentMetadataService.getContentCategories('ingredient'),
          contentMetadataService.getPageMetadata(INGREDIENTS_HUB_SLUG),
        ]);
        if (mounted) {
          setIngredients(indexData);
          setCategories(categoriesData);
          setMetadata(metaData as PageMetadata | null);
        }
      } catch (e) {
        console.error('useIngredientsFeed: failed to load', e);
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

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
