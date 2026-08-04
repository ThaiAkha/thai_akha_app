import React, { useEffect, useState } from 'react';
import { contentMetadataService } from '@thaiakha/shared/services';
import HeaderSection from './HeaderSection';

interface InfoPageHeroProps {
  slug: string;
  fallbackIcon?: string;
  fallbackTitle?: string;
  fallbackHighlight?: string;
  accentColor?: string;
  dividerTheme?: import('../divider/AkhaPixelPattern').AkhaTheme;
  /** Gradiente del title highlight (forwarded a HeaderSection). Default = brand. */
  gradientFrom?: string;
  gradientTo?: string;
}

interface PageMeta {
  titleMain?: string;
  titleHighlight?: string;
  imageUrl?: string;
  description?: string;
}

const InfoPageHero: React.FC<InfoPageHeroProps> = ({
  slug,
  fallbackTitle = '',
  fallbackHighlight = '',
  accentColor = 'primary',
  dividerTheme = 'akha',
  gradientFrom,
  gradientTo,
}) => {
  const [meta, setMeta] = useState<PageMeta | null>(null);

  useEffect(() => {
    contentMetadataService.getPageMetadata(slug).then(data => {
      if (data) setMeta(data as PageMeta);
    });
  }, [slug]);

  const title = meta?.titleMain || fallbackTitle;
  const highlight = meta?.titleHighlight || fallbackHighlight;

  return (
    <div className="flex flex-col items-center [gap:var(--space-fluid-m)] w-full">

      {/* ── Hero Image ── */}
      {meta?.imageUrl && (
        <div className="w-full rounded-3xl overflow-hidden aspect-[16/6]" style={{ marginTop: 'var(--space-fluid-l)' }}>
          <img
            src={meta.imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            fetchPriority="high"
          />
        </div>
      )}

      <HeaderSection
        variant="hero"
        align="center"
        title={title}
        highlight={highlight}
        description={meta?.description}
        dividerTheme={dividerTheme}
        gradientFrom={gradientFrom}
        gradientTo={gradientTo}
      />

    </div>
  );
};

export default InfoPageHero;

