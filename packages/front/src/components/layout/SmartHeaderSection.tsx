import React from 'react';
import HeaderSection, { HeaderSectionVariant, HeaderSectionAlign, HeaderSectionProps } from './HeaderSection';
import { SkeletonHeader } from '../skeleton';
import { usePageSection, type PageSectionData } from '../../hooks/usePageSections';


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
   * Optional pre-fetched data from usePageSections (or similar batch hook).
   * When provided, the internal Supabase fetch is skipped entirely — zero extra roundtrip.
   */
  prefetchedData?: PageSectionData | null;
  /**
   * Controlled loading flag from the parent batch hook (e.g. usePageSections).
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
 * data from a parent batch fetch (e.g. usePageSections). This skips the
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
  // Tre modalita', una sola fonte dati (usePageSection, cache TanStack condivisa):
  // - controlled: il padre (batch hook) possiede loading + data - nessuna query propria;
  // - prefetched: il padre passa i dati gia' pronti - nessuna query propria;
  // - standalone: query propria via usePageSection (cache: la stessa sezione
  //   montata altrove non rifa' la chiamata).
  const controlled = loadingProp !== undefined;
  const standalone = !controlled && prefetchedData === undefined;
  const { section: fetched, loading: fetchLoading } = usePageSection(sectionId, { enabled: standalone });
  const data = standalone ? fetched : (prefetchedData ?? null);
  const loading = controlled ? loadingProp : standalone ? fetchLoading : false;

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
