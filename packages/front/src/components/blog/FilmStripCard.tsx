import React, { useRef, useEffect } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { CultureSection } from '@thaiakha/shared/types';
import { Typography, MediaImage, Button } from '../ui/index';
import './BlogCardGlass.css';

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
  const cardRef = useRef<HTMLDivElement>(null);
  const icon = SECTION_ICONS[section.slug] ?? 'auto_stories';

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
    <article
      ref={cardRef}
      onClick={() => onOpen(section.slug)}
      className={cn(
        'blog-card-glass',
        'group relative flex flex-col md:flex-row cursor-pointer overflow-hidden',
        'border border-border rounded-[2rem] bg-surface',
        'min-h-[260px]',
        'transition-all duration-500 ease-out',
        'hover:-translate-y-1',
        'hover:border-primary/40',
        'hover:shadow-[0_24px_64px_-12px_rgba(227,31,51,0.25)]',
      )}
      style={{
        '--mouse-x': '50%',
        '--mouse-y': '50%',
      } as React.CSSProperties}
    >
      {/* ── Gradient border (whole card, follows mouse) ─────────────────── */}
      <div className="blog-card-glass__border rounded-[2rem]" />

      {/* ── Glass glow (whole card, follows mouse) ───────────────────────── */}
      <div className="blog-card-glass__glow rounded-[2rem]" />

      {/* ── Left: image (~55% on desktop) ───────────────────────────────── */}
      <div className="relative w-full md:w-[55%] min-h-[200px] md:min-h-0 overflow-hidden shrink-0 z-10">
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
            <span className="material-symbols-outlined text-border/40" style={{ fontSize: '3rem' }}>
              {icon}
            </span>
          </div>
        )}
        <div className="hidden md:block absolute inset-y-0 right-0 w-12 bg-gradient-to-r from-transparent to-surface pointer-events-none" />
      </div>

      {/* ── Right: content (~45%) ───────────────────────────────────────── */}
      <div className="blog-card-glass__content flex flex-col justify-between w-full md:w-[45%] p-6 md:p-8 shrink-0 z-10">
        <div className="flex flex-col gap-3">
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
        <div className="flex justify-end mt-4">
          <Button
            variant="brand"
            size="sm"
            icon="arrow_forward"
            onClick={(e) => { e.stopPropagation(); onOpen(section.slug); }}
            className={cn(
              'opacity-0 group-hover:opacity-100',
              'translate-y-2 group-hover:translate-y-0',
              'transition-all duration-300',
            )}
          >
            EXPLORE
          </Button>
        </div>
      </div>
    </article>
  );
};

export default FilmStripCard;
