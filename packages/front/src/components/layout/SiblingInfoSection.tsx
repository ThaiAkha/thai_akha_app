import React, { useMemo } from 'react';
import { getSiblingPagesBySlugs } from '@thaiakha/shared/services';
import { useQuery } from '@thaiakha/shared/query';
import { useSiteMetadata } from '../../hooks/useSiteMetadata';
import { SiblingCardPage, SiblingPage } from '../ui/card/SiblingCardPage';
import { SiblingSection } from './SiblingSection';
import { SkeletonBase } from '../skeleton/atoms';
import { AkhaThemedLine } from '../divider';

interface SiblingInfoSectionProps {
  currentSlug: string;
  onNavigate: (path: string) => void;
  sectionId?: string;
  /** Accento per mondo: 'brand' (default) | 'ocean' (pagine info a tema FAQ). */
  accent?: 'brand' | 'ocean';
}

/**
 * Fetches sibling pages defined in site_metadata.sibling_slugs for the current page
 * and renders them as SiblingCardPage inside a SiblingSection wrapper.
 *
 * Layout mirrors the inline sibling pattern used in NewsPageSingle / HistoryPageSingle:
 * - AkhaThemedLine wrapped in max-w-6xl + padding-inline:m
 * - SiblingSection wrapped in max-w-6xl + padding-inline:m + padding-bottom:xl
 * - gap:xl between the two blocks (matches PageLayout main gap:xl on single pages)
 */
export const SiblingInfoSection: React.FC<SiblingInfoSectionProps> = ({
  currentSlug,
  onNavigate,
  sectionId = 'sibiling_info',
  accent = 'brand',
}) => {
  const isOcean = accent === 'ocean';
  // Ocean: divider block_faq + rimappa token accent (primary/action) → ocean.
  // Il glow hover NON è un color token (shadow-action-glow è inlinato) → gestito
  // via prop accent sulla SiblingCardPage (shadow-glow-ocean).
  const oceanVars = isOcean ? '[--color-action:var(--color-ocean-blue)] [--color-primary:var(--color-deep-ocean)]' : '';
  const dividerTheme = isOcean ? 'block_faq' : 'akha';

  // Data layer (#86): sibling_slugs dalla riga site_metadata condivisa, poi UNA
  // query per le sorelle (chiave = lista slug: pagine con le stesse sorelle la condividono).
  const { extras, loading: extrasLoading } = useSiteMetadata(currentSlug);
  const slugsKey = (extras?.siblingSlugs ?? []).join(',');
  const siblingsQuery = useQuery({
    queryKey: ['sibling_pages', slugsKey] as const,
    queryFn: () => getSiblingPagesBySlugs(slugsKey.split(',')),
    enabled: slugsKey.length > 0,
  });
  const siblings: SiblingPage[] = useMemo(
    () => (siblingsQuery.data ?? []).map(d => ({
      titleMain: d.header_title_main,
      titleHighlight: d.header_title_highlight,
      description: d.page_description,
      imageUrl: d.hero_image_url,
      href: `/${d.page_slug}`,
      slug: d.page_slug,
    })),
    [siblingsQuery.data],
  );
  const loading = extrasLoading || (slugsKey.length > 0 && siblingsQuery.isPending);

  if (loading) {
    return (
      <div className={`w-full flex flex-col [gap:var(--space-fluid-xl)] ${oceanVars}`}>
        <div className="w-full max-w-[var(--container-section)] mx-auto">
          <AkhaThemedLine theme={dividerTheme} className="[padding-top:var(--space-fluid-l)] [padding-bottom:var(--space-fluid-xs)]" />
        </div>
        <div className="w-full max-w-[var(--container-section)] mx-auto [padding-bottom:var(--space-fluid-xl)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 [gap:var(--space-fluid-s)]">
            <SkeletonBase className="w-full h-32 rounded-3xl" />
            <SkeletonBase className="w-full h-32 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (siblings.length === 0) return null;

  return (
    <div className={`w-full flex flex-col [gap:var(--space-fluid-xl)] ${oceanVars}`}>
      <div className="w-full max-w-[var(--container-section)] mx-auto">
        <AkhaThemedLine theme={dividerTheme} className="[padding-top:var(--space-fluid-l)] [padding-bottom:var(--space-fluid-xs)]" />
      </div>
      <div className="w-full max-w-[var(--container-section)] mx-auto [padding-bottom:var(--space-fluid-xl)]">
        <SiblingSection sectionId={sectionId}>
          {siblings.map((sibling, index) => (
            <SiblingCardPage
              key={sibling.slug}
              item={sibling}
              direction={index === 0 ? 'prev' : 'next'}
              accent={accent}
              onClick={() => onNavigate(sibling.slug)}
            />
          ))}
        </SiblingSection>
      </div>
    </div>
  );
};

export default SiblingInfoSection;
