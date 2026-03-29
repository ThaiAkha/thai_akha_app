import React, { useRef, useEffect } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { CultureSection } from '@thaiakha/shared/types';
import { Typography, Badge, MediaImage, Button, Icon } from '../ui/index';
import './BlogCardGlass.css';
import { SECTION_ICONS } from './sectionIcons';

// ─── Props ─────────────────────────────────────────────────────────────────────

interface BlogCardProps {
  section: CultureSection;
  index: number;
  onOpen: (slug: string) => void;
}

// ─── HeroCard — Compact photo-hero for 3-column grid ──────────────────────────

const HeroCard: React.FC<BlogCardProps> = ({ section, onOpen }) => {
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
        'group relative w-full overflow-hidden cursor-pointer',
        'rounded-[2rem] border border-border',
        'aspect-[4/3]',
        'transition-all duration-500 ease-out',
        'hover:-translate-y-1',
        'hover:border-primary/40',
        'hover:shadow-[0_24px_64px_-12px_rgb(var(--color-primary)/0.25)]',
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

      {/* ── Background image (full bleed) ──────────────────────────────── */}
      {section.primary_image ? (
        <MediaImage
          assetId={section.primary_image}
          showCaption={false}
          fallbackAlt={section.title}
          className="absolute inset-0 z-0"
          imgClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-border/20 flex items-center justify-center">
          <Icon name={icon} size="xl" color="muted" className="opacity-30" />
        </div>
      )}

      {/* ── Gradient overlays ───────────────────────────────────────────── */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

      {/* ── Bottom: title + subtitle + explore ──────────────────────────── */}
      <div className="blog-card-glass__content absolute bottom-0 left-0 right-0 p-4 md:p-5 z-20 flex flex-col gap-1.5">
        <div className="flex flex-col flex-1 gap-1.5">
          <Typography
            variant="h5"
            color="inverse"
            className="leading-tight line-clamp-2 drop-shadow-lg"
          >
            {section.title}
          </Typography>
          <Typography
            variant="caption"
            color="inverse"
            className="opacity-0 group-hover:opacity-60 line-clamp-1 transition-opacity duration-300"
          >
            {section.subtitle}
          </Typography>
        </div>
        <div className="flex justify-end mt-1">
          <Button
            variant="brand"
            size="sm"
            icon="arrow_forward"
            onClick={(e) => { e.stopPropagation(); onOpen(section.slug); }}
            className={cn(
              'opacity-0 group-hover:opacity-100',
              'translate-y-1.5 group-hover:translate-y-0',
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

export default HeroCard;
