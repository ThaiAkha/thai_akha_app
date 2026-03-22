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

// ─── HeroCard — Compact photo-hero for 3-column grid ──────────────────────────

const HeroCard: React.FC<BlogCardProps> = ({ section, index, onOpen }) => {
  const icon = SECTION_ICONS[section.slug] ?? 'auto_stories';
  const chapterNum = String(index + 1).padStart(2, '0');
  const categoryLabel = section.category ?? 'Culture';

  return (
    <article
      onClick={() => onOpen(section.slug)}
      className={cn(
        'group relative w-full overflow-hidden cursor-pointer',
        'rounded-[2rem] border border-border',
        'aspect-[4/3]',
        'transition-all duration-500 ease-out',
        'hover:-translate-y-1',
        'hover:border-primary/40',
        'hover:shadow-[0_24px_64px_-12px_rgba(227,31,51,0.25)]',
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
            style={{ fontSize: '3rem' }}
          >
            {icon}
          </span>
        </div>
      )}

      {/* ── Gradient overlays ───────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* ── Top row: badge + chapter number ────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
        <Badge
          variant="mineral"
          className="text-white border-white/20 bg-black/30 backdrop-blur-sm text-[9px] tracking-widest gap-1"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>{icon}</span>
          {categoryLabel}
        </Badge>

        <span className="font-mono font-black text-3xl text-white/10 select-none leading-none">
          {chapterNum}
        </span>
      </div>

      {/* ── Bottom overlay: title + audio + explore ─────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-10 flex flex-col gap-1.5">
        <Typography
          variant="h5"
          color="title"
          className="text-white leading-tight line-clamp-2 drop-shadow-lg"
        >
          {section.title}
        </Typography>

        <Typography
          variant="caption"
          color="sub"
          className="text-white/60 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          {section.subtitle}
        </Typography>

        {/* Actions row */}
        <div className="flex items-center justify-between mt-1">
          <AudioPlayButton
            assetId={section.audio_asset_id ?? undefined}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-white/25 bg-black/30 text-white hover:bg-black/50 h-7 text-[10px]"
          />

          <Typography
            as="div"
            variant="microLabel"
            color="action"
            className={cn(
              'flex items-center gap-1 text-white/75',
              'opacity-0 group-hover:opacity-100',
              'translate-y-1.5 group-hover:translate-y-0',
              'transition-all duration-300',
            )}
          >
            EXPLORE
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </Typography>
        </div>
      </div>
    </article>
  );
};

export default HeroCard;
