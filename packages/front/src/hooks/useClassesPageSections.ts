/**
 * useClassesPageSections
 *
 * Fetches all 7 classes page section headers in a SINGLE Supabase query.
 * Replaces the N+1 pattern of 7 × SmartHeaderSection individual queries.
 */

import { useEffect, useState } from 'react';
import { newsService, contentMetadataService } from '@thaiakha/shared/services';

// ─── Types ───────────────────────────────────────────────────────────────────

export const CLASSES_SECTION_IDS = [
  'class-00',
  'class-01',
  'class-02',
  'class-03',
  'class-04',
  'class-05',
  'class-06',
] as const;

export type ClassesSectionId = (typeof CLASSES_SECTION_IDS)[number];

export interface PageSectionData {
  section_id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  highlight: string | null;
  tag_badge: string | null;
  // CMS Dynamic Data
  image_asset_id?: string;
  button_text?: string;
  button_link_url?: string;
  open_in_new_tab?: boolean;
}

export interface PageMetadata {
  titleMain: string;
  titleHighlight?: string | null;
  description?: string | null;
  badge?: string | null;
  icon?: string | null;
  imageUrl: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  ogType?: string | null;
  jsonLd?: object | null;
}

export type ClassesSections = {
  sections: Record<ClassesSectionId, PageSectionData | null>;
  metadata: PageMetadata | null;
};

// ─── Module-level singleton cache ────────────────────────────────────────────

let _cache: ClassesSections | null = null;
let _promise: Promise<ClassesSections> | null = null;

const EMPTY_SECTIONS: Record<ClassesSectionId, PageSectionData | null> = {
  'class-00': null,
  'class-01': null,
  'class-02': null,
  'class-03': null,
  'class-04': null,
  'class-05': null,
  'class-06': null,
};

const EMPTY: ClassesSections = {
  sections: EMPTY_SECTIONS,
  metadata: null,
};

export async function fetchFrontClassesPageData(): Promise<ClassesSections> {
  if (_cache) return Promise.resolve(_cache);
  if (_promise) return _promise;

  _promise = (async () => {
    const [sectionsData, meta] = await Promise.all([
      newsService.getPageSections<PageSectionData>(CLASSES_SECTION_IDS as unknown as string[]),
      contentMetadataService.getPageMetadata('thai-cooking-classes-chiang-mai'),
    ]);

    const sectionsMap = sectionsData.reduce<Record<ClassesSectionId, PageSectionData | null>>(
      (acc, row) => {
        acc[row.section_id as ClassesSectionId] = row;
        return acc;
      },
      { ...EMPTY_SECTIONS }
    );

    const result: ClassesSections = {
      sections: sectionsMap,
      metadata: meta ? {
        titleMain: meta.titleMain ?? '',
        titleHighlight: meta.titleHighlight,
        description: meta.description,
        badge: meta.badge,
        icon: meta.icon,
        imageUrl: (meta as unknown as Record<string, unknown>).imageUrl as string ?? '',
        seoTitle: meta.seoTitle,
        seoDescription: (meta as unknown as Record<string, unknown>).seoDescription as string ?? null,
        canonicalUrl: meta.canonicalUrl,
        ogTitle: (meta as unknown as Record<string, unknown>).ogTitle as string ?? null,
        ogDescription: (meta as unknown as Record<string, unknown>).ogDescription as string ?? null,
        ogImage: meta.ogImage,
        ogType: (meta as unknown as Record<string, unknown>).ogType as string ?? null,
        jsonLd: (meta as unknown as Record<string, unknown>).jsonLd as object ?? null,
      } as PageMetadata : null,
    };

    _cache = result;
    return result;
  })();

  _promise.finally(() => {
    _promise = null;
  });

  return _promise;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

interface UseClassesPageSectionsResult {
  sections: Record<ClassesSectionId, PageSectionData | null>;
  metadata: PageMetadata | null;
  loading: boolean;
  error: Error | null;
}

export function useClassesPageSections(): UseClassesPageSectionsResult {
  const [data, setData] = useState<ClassesSections>(() => _cache ?? { ...EMPTY });
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

    fetchFrontClassesPageData()
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load classes sections'));
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  return {
    sections: data.sections,
    metadata: data.metadata,
    loading,
    error
  };
}
