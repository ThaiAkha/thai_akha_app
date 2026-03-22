import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { CultureSection } from '@thaiakha/shared/types';
import { Typography, MediaImage } from '../ui/index';
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

// ─── ChapterCard — Editorial style ─────────────────────────────────────────────

const ChapterCard: React.FC<BlogCardProps> = ({ section, index, onOpen }) => {
  const icon = SECTION_ICONS[section.slug] ?? 'auto_stories';
  const chapterNum = String(section.display_order + 1).padStart(2, '0');

  return (
    <article
      onClick={() => onOpen(section.slug)}
      className={cn(
        'group relative flex flex-col overflow-hidden cursor-pointer',
        'rounded-[2rem] border border-border bg-surface',
        'transition-all duration-500 ease-out',
        'hover:-translate-y-2',
        'hover:border-primary/40',
        'hover:shadow-[0_24px_64px_-12px_rgba(227,31,51,0.25)]',
      )}
    >
      {/* ── Image zone ──────────────────────────────────────────────────── */}
      <div className="relative w-full aspect-video overflow-hidden shrink-0">
        {/* Cherry glow flash on hover */}
        <div className="absolute inset-0 z-20 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {section.primary_image ? (
          <MediaImage
            assetId={section.primary_image}
            showCaption={false}
            fallbackAlt={section.title}
            className="absolute inset-0"
            imgClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-border/20 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-border/40 transition-transform duration-500 group-hover:scale-110"
              style={{ fontSize: '2.5rem' }}
            >
              {icon}
            </span>
          </div>
        )}

        {/* Large ghost chapter number centered in image */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <span className="font-mono font-black text-6xl text-white/15 select-none">
            {chapterNum}
          </span>
        </div>
      </div>

      {/* ── Thin accent line ────────────────────────────────────────────── */}
      <div className="h-px w-full bg-border group-hover:bg-primary/30 transition-colors duration-500" />

      {/* ── Text content ────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-5 md:p-6 gap-3">
        {/* Category row */}
        <div className="flex items-center gap-1.5">
          <span
            className="material-symbols-outlined text-action/70 transition-opacity duration-300 group-hover:opacity-100"
            style={{ fontSize: '14px' }}
          >
            {icon}
          </span>
          <Typography variant="microLabel" color="muted" className="tracking-widest">
            Culture &amp; History
          </Typography>
        </div>

        {/* Title */}
        <Typography
          variant="h6"
          color="title"
          className="leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2"
        >
          {section.title}
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="body"
          color="sub"
          className="line-clamp-2 opacity-70 leading-relaxed"
        >
          {section.subtitle}
        </Typography>

        {/* Bottom row: audio + explore CTA */}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <AudioPlayButton
            assetId={`culture-audio-${section.slug}`}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
          <Typography
            as="div"
            variant="microLabel"
            color="action"
            className={cn(
              'flex items-center gap-1',
              'opacity-0 group-hover:opacity-100',
              'translate-y-2 group-hover:translate-y-0',
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

export default ChapterCard;
