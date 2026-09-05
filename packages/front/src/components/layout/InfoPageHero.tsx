import React from 'react';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import HeaderSection from './HeaderSection';
import { SkeletonBase, SkeletonHeader } from '../skeleton';

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
  dividerTheme = 'akha',
  gradientFrom,
  gradientTo,
}) => {
  // Data layer (#86): stessa query/cache degli altri lettori di site_metadata per slug.
  const { metadata, loading } = usePageMetadata(slug);
  const meta = metadata as PageMeta | null;

  const title = meta?.titleMain || fallbackTitle;
  const highlight = meta?.titleHighlight || fallbackHighlight;

  // Prima il layout teneva fermo tutto finche' questa riga non arrivava; ora i figli
  // montano subito, quindi l'attesa la mostra qui chi la sta aspettando, con la
  // stessa forma dell'immagine e del titolo che prenderanno il suo posto.
  if (loading) {
    return (
      <div className="flex flex-col items-center [gap:var(--space-fluid-m)] w-full">
        <SkeletonBase className="w-full aspect-[16/6] rounded-3xl [margin-top:var(--space-fluid-l)]" />
        <SkeletonHeader variant="hero" align="center" />
      </div>
    );
  }

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

