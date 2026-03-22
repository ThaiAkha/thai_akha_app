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

// ─── HorizontalCard — 2-column photo-left / content-right ──────────────────────

const FilmStripCard: React.FC<BlogCardProps> = ({ section, onOpen }) => {
  const icon = SECTION_ICONS[section.slug] ?? 'auto_stories';
  const categoryLabel = section.category ?? 'Culture';

  return (
    <article
      onClick={() => onOpen(section.slug)}
      className={cn(
        'group relative flex flex-col md:flex-row cursor-pointer overflow-hidden',
        'border border-border rounded-[2rem] bg-surface',
        'min-h-[260px]',
        'transition-all duration-500 ease-out',
        'hover:-translate-y-1',
        'hover:border-primary/40',
        'hover:shadow-[0_24px_64px_-12px_rgba(227,31,51,0.25)]',
      )}
    >
      {/* ── Left: image (~55% on desktop, full height on mobile) ────────── */}
      <div className="relative w-full md:w-[55%] min-h-[200px] md:min-h-0 overflow-hidden shrink-0">
        {section.primary_image ? (
          <MediaImage
            assetId={section.primary_image}
            showCaption={false}
            fallbackAlt={section.title}
            className="absolute inset-0"
            imgClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-border/20 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-border/40"
              style={{ fontSize: '3rem' }}
            >
              {icon}
            </span>
          </div>
        )}

        {/* Gradient overlay so edge blends into content panel */}
        <div className="hidden md:block absolute inset-y-0 right-0 w-12 bg-gradient-to-r from-transparent to-surface pointer-events-none" />

        {/* Cherry hover tint */}
        <div className="absolute inset-0 bg-primary/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Audio button pinned bottom-left */}
        <div className="absolute bottom-4 left-4 z-10">
          <AudioPlayButton
            assetId={section.audio_asset_id ?? undefined}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        </div>
      </div>

      {/* ── Right: content (~45%) ────────────────────────────────────────── */}
      <div className="flex flex-col justify-between w-full md:w-[45%] p-6 md:p-8 shrink-0">
        {/* Top: badge + divider + title + subtitle */}
        <div className="flex flex-col gap-3">
          <Badge
            variant="mineral"
            className="w-fit text-primary border-primary/30 bg-primary/5 text-[10px] tracking-widest gap-1.5"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>{icon}</span>
            {categoryLabel}
          </Badge>

          <div className="h-px w-8 bg-primary/50" />

          <Typography
            variant="h4"
            color="title"
            className="leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-3"
          >
            {section.title}
          </Typography>

          <Typography
            variant="body"
            color="sub"
            className="line-clamp-3 opacity-70 leading-relaxed"
          >
            {section.subtitle}
          </Typography>
        </div>

        {/* Bottom: explore CTA */}
        <Typography
          as="div"
          variant="microLabel"
          color="action"
          className={cn(
            'flex items-center gap-1 mt-4',
            'opacity-0 group-hover:opacity-100',
            'translate-y-2 group-hover:translate-y-0',
            'transition-all duration-300',
          )}
        >
          EXPLORE
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </Typography>
      </div>
    </article>
  );
};

export default FilmStripCard;
