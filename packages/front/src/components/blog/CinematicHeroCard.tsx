import React, { useRef, useEffect } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { CultureSection } from '@thaiakha/shared/types';
import { Typography, Badge, MediaImage, AkhaPixelPattern, Button, AudioPlayer, AkhaPixelLine, AkhaQuote } from '../ui/index';
import { HeaderSection } from '../layout';

// ─── Section icon map ───────────────────────────────────────────────────────────

const SECTION_ICONS: Record<string, string> = {
  'hill-tribes-overview': 'landscape',
  'historical-roots': 'history_edu',
  'akha-zang': 'menu_book',
  'traditional-dress': 'diamond',
  'swing-festival': 'celebration',
  'featured-recipes': 'restaurant_menu',
  'thai-akha-fusion': 'merge',
  'foragers-pantry': 'forest',
  'spirit-gate': 'temple_buddhist',
  'music-folklore': 'music_note',
  'coffee-culture': 'coffee',
  'communal-dining': 'groups',
  'religion-beliefs': 'self_improvement',
  'spice-philosophy': 'local_fire_department',
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface BlogCardProps {
  section: CultureSection;
  index: number;
  onOpen: (slug: string) => void;
}

// ─── CinematicHeroCard — Full-width 21:9 hero with overlay ─────────────────────

const CinematicHeroCard: React.FC<BlogCardProps> = ({ section, onOpen }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const icon = SECTION_ICONS[section.slug] ?? 'auto_stories';
  const categoryLabel = section.category ?? 'Culture & History';

  // Mouse tracking for gradient border
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    };

    const handleMouseLeave = () => {
      card.style.setProperty('--mouse-x', '50%');
      card.style.setProperty('--mouse-y', '50%');
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <>
      <article
        ref={cardRef}
        onClick={() => onOpen(section.slug)}
        className={cn(
          'group relative w-full overflow-hidden cursor-pointer',
          'rounded-[2rem] border-2 border-action/20 hover:border-action/80',
          'aspect-[16/9] min-h-[280px]',
          'transition-all duration-500 ease-out',
          'bg-white/5 backdrop-blur-lg shadow-lg shadow-action/5 hover:shadow-action/15',
        )}
        style={{
          '--mouse-x': '50%',
          '--mouse-y': '50%',
        } as React.CSSProperties}
      >
        {/* ── Gradient border (follows mouse) ────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-[2rem] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            padding: '-2px',
            background: `radial-gradient(
              circle at var(--mouse-x) var(--mouse-y),
              rgba(152, 201, 60, 1) 0%,
              rgba(152, 201, 60, 0.6) 20%,
              transparent 60%
            )`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            boxShadow: 'inset 0 0 30px rgba(152, 201, 60, 0.3)',
          } as React.CSSProperties}
        />

        {/* ── Glass overlay (visible effect) ────────────────────────────────── */}
        <div className="absolute inset-0 rounded-[2rem] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
          background: `radial-gradient(
            circle at var(--mouse-x) var(--mouse-y),
            rgba(152, 201, 60, 0.15) 0%,
            transparent 60%
          )`,
        }} />
        {/* ── Background image (full bleed) ──────────────────────────────── */}
        {section.primary_image ? (
          <MediaImage
            assetId={section.primary_image}
            showCaption={false}
            fallbackAlt={section.title}
            className="absolute inset-0"
            imgClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 object-bottom"
          />
        ) : (
          <div className="absolute inset-0 bg-border/20 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-border/30"
              style={{ fontSize: '4rem' }}
            >
              {icon}
            </span>
          </div>
        )}

        {/* ── Gradient overlays ───────────────────────────────────────────── */}
        {/* Base dark gradient (always) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 pointer-events-none" />
        {/* Cherry vignette on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* ── Top row: badge left + chapter number right ──────────────────── */}
        <div className="absolute top-5 left-5 right-5 flex items-start justify-between z-10">
          <Badge variant="mineral-accent" icon={icon}>
            {categoryLabel}
          </Badge>
        </div>

        {/* ── Bottom: quote ──────────────────────────────────────────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10 flex flex-col gap-3">
          {(section.seo_title || section.quote || section.subtitle) && (
            <AkhaQuote variant="main" className="max-w-3xl">
              {section.seo_title || section.quote || section.subtitle}
            </AkhaQuote>
          )}
        </div>
      </article>

      {/* ── External block: Audio player + Explore button (below photo card) ────────────── */}
      {section.audio_asset_id && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4 px-6 md:px-8 mt-12">
          <AudioPlayer
            assetId={section.audio_asset_id}
            hideTranscript={true}
          />
          <Button
            variant="brand"
            size="md"
            icon="arrow_forward"
            onClick={() => onOpen(section.slug)}
            className="whitespace-nowrap"
          >
            EXPLORE
          </Button>
        </div>
      )}

      {/* ── HeaderSection: Title + Description ────────────────────────────────────── */}
      <div className="mt-12 md:mt-16 mb-12 px-4 md:px-8 max-w-6xl mx-auto w-full">
        <HeaderSection
          variant="section"
          align="center"
          title={section.title}
          subtitle={section.subtitle}
        />
      </div>

      {/* ── Divider ────────────────────────────────────────────────────────────────── */}
      <div className="px-4 md:px-8 mb-12 max-w-6xl mx-auto w-full">
        <AkhaPixelLine opacity={0.3} />
      </div>
    </>
  );
};

export default CinematicHeroCard;
