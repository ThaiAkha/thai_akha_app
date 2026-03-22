import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { CultureSection } from '@thaiakha/shared/types';
import { Typography, Badge, MediaImage } from '../ui/index';
import AudioPlayButton from './AudioPlayButton';

// ─── Section icon map ───────────────────────────────────────────────────────────

const SECTION_ICONS: Record<string, string> = {
  'hill-tribes-overview': 'landscape',
  'historical-roots':     'history_edu',
  'akha-zang':            'menu_book',
  'traditional-dress':    'diamond',
  'swing-festival':       'celebration',
  'featured-recipes':     'restaurant_menu',
  'thai-akha-fusion':     'merge',
  'foragers-pantry':      'forest',
  'spirit-gate':          'temple_buddhist',
  'music-folklore':       'music_note',
  'coffee-culture':       'coffee',
  'communal-dining':      'groups',
  'religion-beliefs':     'self_improvement',
  'spice-philosophy':     'local_fire_department',
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface BlogCardProps {
  section: CultureSection;
  index: number;
  onOpen: (slug: string) => void;
}

// ─── CinematicHeroCard — Full-width 21:9 hero with overlay ─────────────────────

const CinematicHeroCard: React.FC<BlogCardProps> = ({ section, onOpen }) => {
  const icon = SECTION_ICONS[section.slug] ?? 'auto_stories';
  const chapterNum = String(section.display_order + 1).padStart(2, '0');
  const categoryLabel = section.category ?? 'Culture & History';

  return (
    <article
      onClick={() => onOpen(section.slug)}
      className={cn(
        'group relative w-full overflow-hidden cursor-pointer',
        'rounded-[2rem] border border-border',
        'aspect-[21/9] min-h-[280px]',
        'transition-all duration-500 ease-out',
        'hover:border-primary/40',
        'hover:shadow-[0_32px_80px_-16px_rgba(227,31,51,0.30)]',
      )}
    >
      {/* ── Background image (full bleed) ──────────────────────────────── */}
      {section.primary_image ? (
        <MediaImage
          assetId={section.primary_image}
          showCaption={false}
          fallbackAlt={section.title}
          className="absolute inset-0"
          imgClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
        <Badge
          variant="mineral"
          className="text-white border-white/20 bg-black/30 backdrop-blur-sm text-[10px] tracking-widest gap-1.5"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{icon}</span>
          {categoryLabel}
        </Badge>

        <span className="font-mono font-black text-5xl text-white/10 select-none leading-none">
          {chapterNum}
        </span>
      </div>

      {/* ── Bottom: quote + actions ──────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10 flex flex-col gap-3">
        {(section.quote || section.subtitle) && (
          <blockquote className="border-l-2 border-white/40 pl-4 max-w-xl">
            <Typography
              variant="paragraphM"
              className="text-white/85 italic leading-relaxed line-clamp-2 drop-shadow-md"
            >
              "{section.quote || section.subtitle}"
            </Typography>
          </blockquote>
        )}

        {/* Actions row */}
        <div className="flex items-center justify-between mt-1">
          <AudioPlayButton
            assetId={section.audio_asset_id ?? undefined}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-white/25 bg-black/30 text-white hover:bg-black/50"
          />

          <Typography
            as="div"
            variant="microLabel"
            color="action"
            className={cn(
              'flex items-center gap-1.5 text-white/80',
              'opacity-0 group-hover:opacity-100',
              'translate-y-2 group-hover:translate-y-0',
              'transition-all duration-300',
            )}
          >
            EXPLORE
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Typography>
        </div>
      </div>
    </article>
  );
};

export default CinematicHeroCard;
