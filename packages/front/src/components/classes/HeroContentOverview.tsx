import React from 'react';
import { Card, MediaImage } from '../ui';
import { SmartHeaderSection } from '../layout/SmartHeaderSection';
import AudioPlayer from '../modal/AudioPlayer';
import type { PageSectionData } from '../../hooks/usePageSections';

// ─── Props ────────────────────────────────────────────────────────────────────
interface HeroContentOverviewProps {
  imageUrl?: string;
  imageAssetId?: string;
  /** Optional audio asset below the inclusion cards */
  audioAssetId?: string;
  /** Section ID for the text content */
  sectionId?: string;
  /** Prefetched data to avoid extra roundtrips */
  prefetchedData?: PageSectionData | null;
  /** Content overrides for dynamic management at call-site */
  title?: string;
  subtitle?: string;
  description?: string;
  highlight?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const HeroContentOverview: React.FC<HeroContentOverviewProps> = ({
  imageUrl,
  imageAssetId,
  audioAssetId,
  sectionId = 'class-01',
  prefetchedData,
  title,
  subtitle,
  description,
  highlight,
}) => {
  return (
    <div className="flex flex-col [gap:var(--space-fluid-m)]">

      {/* ── Hero Card ──────────────────────────────────────────────────────── */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 min-h-[500px] flex">
        <Card variant="glass" padding="none" className="w-full flex flex-col lg:flex-row group overflow-hidden">

          {/* Image */}
          <div className="w-full lg:w-5/12 relative h-64 md:h-96 lg:h-full overflow-hidden shrink-0">
            <MediaImage
              url={imageUrl}
              assetId={imageAssetId}
              fallbackAlt="Overview"
              showCaption={false}
              imgClassName="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700 z-10" />
          </div>

          {/* Right column — header + audio */}
          <div
            className="w-full lg:w-7/12 flex flex-col justify-center"
            style={{ padding: 'var(--space-fluid-xl)', gap: 'var(--space-fluid-m)' }}
          >
            <SmartHeaderSection
              sectionId={sectionId}
              prefetchedData={prefetchedData}
              variant="hero-1"
              align="left"
              hideSubtitle={!subtitle && !prefetchedData?.subtitle}
              fallbackTitle={title}
              fallbackSubtitle={subtitle}
              fallbackDescription={description}
              fallbackHighlight={highlight}
              className="mb-0"
            />
            {audioAssetId && (
              <AudioPlayer assetId={audioAssetId} className="w-full" hideTranscript />
            )}
          </div>
        </Card>
      </div>

    </div>
  );
};

export default HeroContentOverview;
