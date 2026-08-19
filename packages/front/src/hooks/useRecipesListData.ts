import { useState, useEffect } from 'react';
import { contentService } from '@thaiakha/shared/services';
import { ContentCategoryDB, SpicinessLevel } from '@thaiakha/shared';

/**
 * Data loader for the Recipes LIST page (Recipes.tsx).
 * Distinct from `useRecipePageData` which serves the single-recipe page.
 * Keeps the original artificial 600ms loader tail to avoid skeleton flash.
 */
export const useRecipesListData = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ContentCategoryDB[]>([]);
  const [recipes, setRecipes] = useState<Record<string, unknown>[]>([]);
  const [spicinessLevels, setSpicinessLevels] = useState<SpicinessLevel[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cats, recipesRes, spiceData] = await Promise.all([
          contentService.getContentCategories('recipe'),
          contentService.getAllRecipesFull(),
          contentService.getSpicinessLevels(),
        ]);
        if (!mounted) return;
        setCategories(cats);
        if (recipesRes) setRecipes(recipesRes);
        setSpicinessLevels(spiceData);
      } catch (e) {
        console.error('Error fetching recipes:', e);
      } finally {
        setTimeout(() => { if (mounted) setLoading(false); }, 600);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  return { categories, recipes, spicinessLevels, loading };
};
