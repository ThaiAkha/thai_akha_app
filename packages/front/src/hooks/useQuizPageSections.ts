/**
 * useQuizPageSections
 *
 * Fetches quiz-specific CTA section headers in a SINGLE Supabase query.
 * (v1.1)
 */

import { useEffect, useState } from 'react';
import { newsService } from '@thaiakha/shared/services';

// ─── Types ───────────────────────────────────────────────────────────────────

export const QUIZ_SECTION_IDS = [
  'quiz-cta-save',
  'quiz-cta-book',
] as const;

export type QuizSectionId = (typeof QUIZ_SECTION_IDS)[number];

export interface PageSectionData {
  section_id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  highlight: string | null;
  tag_badge: string | null;
  image_asset_id?: string;
  button_text?: string;
  button_link_url?: string;
  open_in_new_tab?: boolean;
}

export type QuizSections = {
  sections: Record<QuizSectionId, PageSectionData | null>;
};

// ─── Module-level singleton cache ────────────────────────────────────────────

let _cache: QuizSections | null = null;
let _promise: Promise<QuizSections> | null = null;

const EMPTY_SECTIONS: Record<QuizSectionId, PageSectionData | null> = {
  'quiz-cta-save': null,
  'quiz-cta-book': null,
};

const EMPTY: QuizSections = {
  sections: EMPTY_SECTIONS,
};

export async function fetchQuizPageData(): Promise<QuizSections> {
  if (_cache) return Promise.resolve(_cache);
  if (_promise) return _promise;

  _promise = (async () => {
    try {
      const sectionsData = await newsService.getPageSections<PageSectionData>(QUIZ_SECTION_IDS);

      const sectionsMap = sectionsData.reduce<Record<QuizSectionId, PageSectionData | null>>(
        (acc, row) => {
          acc[row.section_id as QuizSectionId] = row;
          return acc;
        },
        { ...EMPTY_SECTIONS }
      );

      const result: QuizSections = {
        sections: sectionsMap,
      };

      _cache = result;
      return result;
    } catch (err) {
      return EMPTY;
    }
  })();

  _promise.finally(() => {
    _promise = null;
  });

  return _promise;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

interface UseQuizPageSectionsResult {
  sections: Record<QuizSectionId, PageSectionData | null>;
  loading: boolean;
  error: Error | null;
}

export function useQuizPageSections(): UseQuizPageSectionsResult {
  const [data, setData] = useState<QuizSections>(() => _cache ?? { ...EMPTY });
  const [loading, setLoading] = useState<boolean>(!_cache);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (_cache) {
      setData(_cache);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchQuizPageData()
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load quiz sections'));
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  return {
    sections: data.sections,
    loading,
    error
  };
}

export default useQuizPageSections;
