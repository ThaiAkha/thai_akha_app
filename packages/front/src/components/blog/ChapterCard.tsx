import React, { useRef, useEffect } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { CultureSection } from '@thaiakha/shared/types';
import { Typography, MediaImage, Button, Badge, Icon } from '../ui/index';
import './BlogCardGlass.css';
import { SECTION_ICONS } from './sectionIcons';

// ─── Props ─────────────────────────────────────────────────────────────────────

interface BlogCardProps {
  section: CultureSection;
  index: number;
  onOpen: (slug: string) => void;
}

// ─── ChapterCard — Editorial style ─────────────────────────────────────────────

const ChapterCard: React.FC<BlogCardProps> = ({ section, onOpen }) => {
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
        'group relative flex flex-col overflow-hidden cursor-pointer',
        'rounded-[2rem] border border-border bg-surface',
        'transition-all duration-500 ease-out',
        'hover:-translate-y-2',
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

      {/* ── Image zone ──────────────────────────────────────────────────── */}
      <div className="relative w-full aspect-video overflow-hidden shrink-0 z-10">
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
            <Icon name={icon} size="xl" color="muted" className="opacity-40 transition-transform duration-500 group-hover:scale-110" />
          </div>
        )}
      </div>

      {/* ── Thin accent line ────────────────────────────────────────────── */}
      <div className="h-px w-full bg-border group-hover:bg-primary/30 transition-colors duration-500 z-10" />

      {/* ── Text content ────────────────────────────────────────────────── */}
      <div className="blog-card-glass__content flex flex-col flex-1 p-5 md:p-6 gap-3">
        <Typography
          variant="h6"
          color="title"
          className="leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2"
        >
          {section.title}
        </Typography>

        <Typography
          variant="body"
          color="sub"
          className="line-clamp-2 opacity-70 leading-relaxed"
        >
          {section.subtitle}
        </Typography>

        <div className="mt-auto pt-3 flex justify-end">
          <Button
            variant="brand"
            size="sm"
            icon="arrow_forward"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(section.slug);
            }}
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

export default ChapterCard;
