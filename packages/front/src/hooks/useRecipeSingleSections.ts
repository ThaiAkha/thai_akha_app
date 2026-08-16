/**
 * useRecipeSingleSections
 *
 * Fetches ALL 8 recipe-single page section headers in ONE Supabase query.
 * Uses the same singleton-cache pattern as useHomePageSections to avoid
 * duplicate fetches on re-mounts / navigation.
 *
 * Usage:
 *   const { sections, loading } = useRecipeSingleSections();
 *   const ingredientsHeader = sections['recipe_single_ingredients'];
 *
 * Pass `sections['recipe_single_xxx']` as `prefetchedData` to SmartHeaderSection
 * to skip its internal individual fetch.
 */

import { useEffect, useState } from 'react';
import { newsService } from '@thaiakha/shared/services';
import type { PageSectionData } from './useHomePageSections';

// ─── Section IDs ─────────────────────────────────────────────────────────────

export const RECIPE_SINGLE_SECTION_IDS = [
  'recipe_single_description',
  'recipe_single_ingredients',
  'recipe_single_directions',
  'recipe_single_culture_story',
  'recipe_single_health',
  'recipe_single_gallery',
  'recipe_single_essentials',
  'recipe_single_author_note',
  'recipe_single_ask_cherry',
] as const;

export type RecipeSingleSectionId = (typeof RECIPE_SINGLE_SECTION_IDS)[number];

export type RecipeSingleSections = Record<RecipeSingleSectionId, PageSectionData | null>;

// ─── Singleton cache ──────────────────────────────────────────────────────────

const EMPTY_SECTIONS: RecipeSingleSections = {
  recipe_single_description:   null,
  recipe_single_ingredients:   null,
  recipe_single_directions:    null,
  recipe_single_culture_story: null,
  recipe_single_health:        null,
  recipe_single_gallery:       null,
  recipe_single_essentials:    null,
  recipe_single_author_note:   null,
  recipe_single_ask_cherry:    null,
};

let _cache: RecipeSingleSections | null = null;
let _promise: Promise<RecipeSingleSections> | null = null;

async function fetchRecipeSingleSections(): Promise<RecipeSingleSections> {
  if (_cache) return _cache;
  if (_promise) return _promise;

  _promise = (async () => {
    const rows = await newsService.getPageSections<PageSectionData>(RECIPE_SINGLE_SECTION_IDS);

    const map = rows.reduce<RecipeSingleSections>(
      (acc, row) => {
        acc[row.section_id as RecipeSingleSectionId] = row;
        return acc;
      },
      { ...EMPTY_SECTIONS }
    );

    _cache = map;
    return map;
  })();

  _promise.finally(() => { _promise = null; });
  return _promise;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseRecipeSingleSectionsResult {
  sections: RecipeSingleSections;
  loading: boolean;
  error: Error | null;
}

export function useRecipeSingleSections(): UseRecipeSingleSectionsResult {
  const [sections, setSections] = useState<RecipeSingleSections>(() => _cache ?? { ...EMPTY_SECTIONS });
  const [loading, setLoading]   = useState<boolean>(!_cache);
  const [error, setError]       = useState<Error | null>(null);

  useEffect(() => {
    if (_cache) {
      setSections(_cache);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchRecipeSingleSections()
      .then((res) => {
        if (!cancelled) { setSections(res); setLoading(false); }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load recipe sections'));
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  return { sections, loading, error };
}
