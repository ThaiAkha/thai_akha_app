import React from 'react';
import GlassCard from './GlassCard';
import Button from '../navigation/Button';
import MediaImage from '../../modal/MediaImage';
import { RippleLink } from '../RippleLink';
import { SmartHeaderSection } from '../../layout';
import { cn } from '@thaiakha/shared/lib/utils';
import { usePageSection, type PageSectionData } from '../../../hooks/usePageSections';
import { ButtonVariant } from '../navigation/Button';
import { SkeletonBase, SkeletonText, SkeletonTitle } from '../../skeleton/atoms';

interface GlassCardFullProps {
  sectionId: string;
  prefetchedData?: PageSectionData | null;
  /** Controlled loading flag from a parent batch hook (e.g. usePageSections). */
  loading?: boolean;
  imageAssetId?: string;
  imageAlt?: string;
  imageHref?: string;
  buttonText?: string;
  buttonVariant?: ButtonVariant;
  onNavigate: (path: string) => void;
  imagePosition?: 'left' | 'right';
  glassVariant?: 'primary' | 'action' | 'secondary' | 'subtle';
  buttonSize?: 'xs' | 'sm' | "md" | 'lg';
  gradientFrom?: string;
  gradientTo?: string;
  hideImage?: boolean;
  hideSubtitle?: boolean;
  radius?: string;
}

export const GlassCardFull: React.FC<GlassCardFullProps> = ({
  sectionId,
  prefetchedData,
  loading: loadingProp,
  imageAssetId: propImageAssetId,
  imageAlt: propImageAlt,
  imageHref: propImageHref,
  buttonText: propButtonText,
  buttonVariant = 'brand',
  onNavigate,
  imagePosition = 'left',
  glassVariant = 'subtle',
  buttonSize = 'md',
  gradientFrom,
  gradientTo,
  hideImage = false,
  hideSubtitle = false,
  radius,
}) => {
  // Stessa logica di SmartHeaderSection: controlled / prefetched / standalone,
  // una sola fonte dati (usePageSection, cache TanStack condivisa).
  const controlled = loadingProp !== undefined;
  const standalone = !controlled && prefetchedData === undefined;
  const { section: fetched, loading: fetchLoading } = usePageSection(sectionId, { enabled: standalone });
  const data = standalone ? fetched : (prefetchedData ?? null);
  const loading = controlled ? loadingProp : standalone ? fetchLoading : false;

  // Use CMS data if available, fallback to props
  const imageAssetId = data?.image_asset_id || propImageAssetId || '';
  const rawHref = data?.button_link_url || propImageHref || '';
  const buttonText = data?.button_text || propButtonText || '';
  const imageAlt = propImageAlt || data?.title || 'Section Image';
  const openInNewTab = data?.open_in_new_tab || false;
  const imageOrder = imagePosition === 'left' ? 'order-1 lg:order-1' : 'order-2 lg:order-2';
  const textOrder = imagePosition === 'left' ? 'order-2 lg:order-2' : 'order-1 lg:order-1';

  // DB convention: no leading slash (e.g. 'recipes', 'location')
  // Strip slash as safety fallback during DB migration
  const hasLink = rawHref && rawHref !== '#';
  const isExternal = rawHref.startsWith('http');
  const navigatePath = (!isExternal && rawHref.startsWith('/')) ? rawHref.substring(1) : rawHref;
  const imageHref = isExternal ? rawHref : `/${navigatePath}`;

  if (loading) {
    // Stessa griglia della card reale (immagine aspect-video + colonna testo, 2 colonne da lg):
    // prenota l'altezza vera (~600px su mobile), non un blocco fisso.
    return (
      <div aria-hidden="true" className="w-full rounded-[var(--radius-card-full)] border border-border bg-surface/60 [padding:var(--space-fluid-l)]">
        <div className={cn(hideImage ? 'flex flex-col' : 'grid grid-cols-1 lg:grid-cols-2 [gap:var(--space-fluid-xl)] items-center')}>
          {!hideImage && <SkeletonBase className="w-full aspect-video rounded-[calc(var(--radius-card-full)-var(--space-fluid-l))]" />}
          <div className="flex flex-col [gap:var(--space-fluid-s)]">
            <SkeletonTitle variant="section" width="w-4/5" className="items-start" />
            <SkeletonText lines={4} align="left" />
            <SkeletonBase className="h-10 w-40 rounded-full mt-2" />
          </div>
        </div>
      </div>
    );
  }

  const imageContent = (
    <>
      <MediaImage
        assetId={imageAssetId}
        className="relative z-20 w-full h-full"
        imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        fallbackAlt={imageAlt}
      />
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500 pointer-events-none z-30" />
    </>
  );

  return (
    <GlassCard variant={glassVariant} className="group overflow-hidden" padding="l" innerClassName="relative" radius={radius}>
      {/* Background Image Overlay (10% transparency) */}
      <div className="absolute inset-0 z-0 opacity-10 bg-black pointer-events-none">
        <MediaImage
          assetId={imageAssetId}
          className="w-full h-full"
          imgClassName="w-full h-full object-cover"
          fallbackAlt=""
        />
      </div>

      <div className={cn(
        "relative z-10",
        hideImage ? "flex flex-col" : "grid grid-cols-1 lg:grid-cols-2 [gap:var(--space-fluid-xl)] items-center"
      )}>
        {/* Immagine */}
        {!hideImage && (
          hasLink ? (
            <RippleLink
              href={imageHref}
              onNavigate={openInNewTab ? undefined : () => onNavigate(navigatePath)}
              target={openInNewTab ? '_blank' : undefined}
              rel={openInNewTab ? 'noopener noreferrer' : undefined}
              className={cn(imageOrder, 'relative rounded-[calc(var(--radius)-var(--glass-padding))] border border-white/10 group-hover:border-white/20 transition-all duration-500 aspect-video bg-surface-2 shadow-sm overflow-hidden')}
            >
              {imageContent}
            </RippleLink>
          ) : (
            <div className={cn(imageOrder, 'relative rounded-[calc(var(--radius)-var(--glass-padding))] border border-white/10 transition-all duration-500 aspect-video bg-surface-2 shadow-sm overflow-hidden')}>
              {imageContent}
            </div>
          )
        )}

        {/* Testo e bottone */}
        <div className={cn(!hideImage && textOrder, 'flex flex-col [gap:var(--space-fluid-s)]')}>
          <SmartHeaderSection
            sectionId={sectionId}
            prefetchedData={data}
            variant="section"
            align="left"
            gradientFrom={gradientFrom || (glassVariant === 'action' ? 'quiz-s' : glassVariant === 'secondary' ? 'allergy' : undefined)}
            gradientTo={gradientTo || (glassVariant === 'action' ? 'primary' : glassVariant === 'secondary' ? 'quiz-p' : undefined)}
            hideTag={true}
            hideSubtitle={hideSubtitle}
          />
          {buttonText && (
            <div className="[padding-top:var(--space-fluid-s)] flex justify-center lg:justify-start">
              <Button
                variant={buttonVariant}
                size={buttonSize}
                icon="arrow_forward"
                iconPosition="right"
                as="a"
                href={imageHref}
                target={openInNewTab ? '_blank' : undefined}
                rel={openInNewTab ? 'noopener noreferrer' : undefined}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (openInNewTab) return;
                  if (e.metaKey || e.ctrlKey) return; // new tab — let browser handle
                  e.preventDefault();
                  onNavigate(navigatePath);
                }}
              >
                {buttonText}
              </Button>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default GlassCardFull;
