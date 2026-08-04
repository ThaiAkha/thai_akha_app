/**
 * useHomePageSections
 *
 * Fetches all 5 home page section headers in a SINGLE Supabase query.
 * Replaces the N+1 pattern of 5 × SmartHeaderSection individual queries.
 *
 * Features:
 * - Module-level singleton cache (zero re-fetches on re-mounts)
 * - Error state for graceful degradation
 * - Result keyed by section_id for O(1) lookup
 *
 * Usage:
 *   const { sections, loading, error } = useHomePageSections();
 *   const header1 = sections['home_01']; // title, subtitle, description, highlight, tag_badge
 */

import { useEffect, useState } from 'react';
import { newsService, contentMetadataService } from '@thaiakha/shared/services';

// ─── Types ───────────────────────────────────────────────────────────────────

export const HOME_SECTION_IDS = [
  'home_01',
  'home_02',
  'home_03',
  'home_04',
  'home_05',
  'home_06',
] as const;

export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

/** Card CMS dentro page_sections.cards (jsonb): renderizzata come StatCard. */
export interface PageSectionCard {
  title: string;
  description: string;
  /** Colore StatCard (primary | action | quiz | …) — validare con toStatCardColor. */
  variant: string;
}

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
  /** Domanda-seme per il pulsante Ask Cherry (entry point chat). */
  cherry_prompt?: string | null;
  /** Risposta preset zero-latency / contesto per la chat. */
  cherry_response?: string | null;
  /** Checklist (array di stringhe) — jsonb. */
  bullets?: string[] | null;
  /** Stat card CMS — jsonb array. */
  cards?: PageSectionCard[] | null;
}

// ── StatCard color mapping (variant DB → colore StatCard, fallback 'primary') ──
const STAT_CARD_COLORS = [
  'primary', 'secondary', 'action', 'success', 'warning',
  'error', 'info', 'default', 'quiz', 'transparent',
] as const;
export type StatCardColor = (typeof STAT_CARD_COLORS)[number];

export function toStatCardColor(variant: string | null | undefined): StatCardColor {
  return (STAT_CARD_COLORS as readonly string[]).includes(variant ?? '')
    ? (variant as StatCardColor)
    : 'primary';
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

export type HomeSections = {
  sections: Record<HomeSectionId, PageSectionData | null>;
  metadata: PageMetadata | null;
};

// ─── Module-level singleton cache ────────────────────────────────────────────
// Avoids duplicate fetches when the hook is mounted multiple times (e.g. HMR,
// re-render cycles, Strict Mode double-invoke in development).

let _cache: HomeSections | null = null;
let _promise: Promise<HomeSections> | null = null;

// Dummy placeholders while loading to prevent UI flashes
const EMPTY_SECTIONS: Record<HomeSectionId, PageSectionData | null> = {
  home_01: null,
  home_02: null,
  home_03: null,
  home_04: null,
  home_05: null,
  home_06: null,
};

const EMPTY: HomeSections = {
  sections: EMPTY_SECTIONS,
  metadata: null,
};

export async function fetchFrontHomePageData(): Promise<HomeSections> {
  if (_cache) return Promise.resolve(_cache);
  if (_promise) return _promise;

  _promise = (async () => {
    const [sectionsData, meta] = await Promise.all([
      newsService.getPageSections<PageSectionData>(HOME_SECTION_IDS),
      contentMetadataService.getPageMetadata('home'),
    ]);

    const sectionsMap = sectionsData.reduce<Record<HomeSectionId, PageSectionData | null>>(
      (acc, row) => {
        acc[row.section_id as HomeSectionId] = row;
        return acc;
      },
      { ...EMPTY_SECTIONS }
    );

    const result: HomeSections = {
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

interface UseHomePageSectionsResult {
  sections: Record<HomeSectionId, PageSectionData | null>;
  metadata: PageMetadata | null;
  loading: boolean;
  error: Error | null;
}

export function useHomePageSections(): UseHomePageSectionsResult {
  const [data, setData] = useState<HomeSections>(() => _cache ?? { ...EMPTY });
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

    fetchFrontHomePageData()
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load home sections'));
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
