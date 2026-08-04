import React, { useEffect, useState } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import HeaderSection, { HeaderSectionVariant, HeaderSectionAlign, HeaderSectionProps } from './HeaderSection';
import { SkeletonHeader } from '../skeleton';
import type { PageSectionData } from '../../hooks/useHomePageSections';


export interface SmartHeaderSectionProps {
  sectionId: string;
  variant?: HeaderSectionVariant;
  align?: HeaderSectionAlign;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  fallbackDescription?: string;
  fallbackHighlight?: string;
  fallbackTag?: string;
  hideTitle?: boolean;
  hideSubtitle?: boolean;
  hideDivider?: boolean;
  hideDescription?: boolean;
  hideTag?: boolean;
  /**
   * Optional pre-fetched data from useHomePageSections (or similar batch hook).
   * When provided, the internal Supabase fetch is skipped entirely — zero extra roundtrip.
   */
  prefetchedData?: PageSectionData | null;
  /**
   * Controlled loading flag from the parent batch hook (e.g. useHomePageSections).
   * When provided it is authoritative: the component stays in skeleton while true
   * and never flashes the fallback header on a transient `null` prefetchedData.
   */
  loading?: boolean;
  /** Theme color for the header divider pixel pattern — passed to HeaderSection */
  dividerTheme?: HeaderSectionProps['dividerTheme'];
}

/**
 * SmartHeaderSection
 *
 * Fetches header content dynamically from the page_sections table in Supabase.
 * Renders a skeleton loader while fetching.
 *
 * Performance tip: Pass `prefetchedData` when you already have the section
 * data from a parent batch fetch (e.g. useHomePageSections). This skips the
 * internal query entirely.
 */
export const SmartHeaderSection: React.FC<SmartHeaderSectionProps> = ({
  sectionId,
  variant = 'section',
  align = 'center',
  className,
  gradientFrom = 'primary',
  gradientTo = 'action',
  fallbackTitle,
  fallbackSubtitle,
  fallbackDescription,
  fallbackHighlight,
  fallbackTag,
  hideTitle,
  hideSubtitle,
  hideDivider,
  hideDescription,
  hideTag = false,
  prefetchedData,
  loading: loadingProp,
  dividerTheme,
}) => {
  // Controlled mode: a parent batch hook supplies `loadingProp` and is the single
  // source of truth — stay in skeleton while true, never self-fetch, never flash
  // the fallback on a transient `null` prefetchedData.
  const controlled = loadingProp !== undefined;
  const [data, setData] = useState<PageSectionData | null>(prefetchedData ?? null);
  const [loading, setLoading] = useState(controlled ? loadingProp : !prefetchedData);

  useEffect(() => {
    // Controlled: parent owns loading + data. No self-fetch, no premature fallback.
    if (controlled) {
      setData(prefetchedData ?? null);
      setLoading(loadingProp);
      return;
    }
    // Already have data from parent batch fetch — nothing to do
    if (prefetchedData !== undefined) {
      setData(prefetchedData);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchSectionContent = async () => {
      try {
        setLoading(true);
        const { data: sectionData, error } = await supabase
          .from('page_sections')
          .select('section_id, title, subtitle, description, highlight, tag_badge')
          .eq('section_id', sectionId)
          .maybeSingle(); // tolerate missing section_id (no 406 / PGRST116 on 0 rows)

        if (error) throw error;
        if (!cancelled && sectionData) setData(sectionData);
      } catch (err) {
        console.error(`SmartHeaderSection fetch error [${sectionId}]:`, err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSectionContent();
    return () => { cancelled = true; };
  }, [sectionId, prefetchedData, controlled, loadingProp]);

  if (loading) {
    return (
      <SkeletonHeader
        variant={variant === 'history' || variant === 'kitchen' ? 'sub' : variant}
        align={align}
        hideTitle={hideTitle}
        hideSubtitle={hideSubtitle}
        hideDivider={hideDivider}
        hideDescription={hideDescription}
        className={className}
      />
    );
  }

  // Se non c'è dato nel DB, usiamo i fallback
  const title = data?.title || fallbackTitle || sectionId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const subtitle = data?.subtitle || fallbackSubtitle;
  const description = data?.description || fallbackDescription;
  const highlight = data?.highlight || fallbackHighlight;
  const tag = data?.tag_badge || fallbackTag;

  return (
    <HeaderSection
      title={title}
      subtitle={subtitle ?? undefined}
      description={description ?? undefined}
      highlight={highlight ?? undefined}
      tag={tag ?? undefined}
      variant={variant}
      align={align}
      className={className}
      gradientFrom={gradientFrom}
      gradientTo={gradientTo}
      hideTitle={hideTitle}
      hideSubtitle={hideSubtitle}
      hideDivider={hideDivider}
      hideDescription={hideDescription}
      hideTag={hideTag}
      dividerTheme={dividerTheme}
    />
  );
};

export default SmartHeaderSection;
