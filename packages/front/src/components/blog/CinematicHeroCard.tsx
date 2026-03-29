import React, { useRef, useEffect } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { CultureSection } from '@thaiakha/shared/types';
import { Typography, Badge, MediaImage, Icon, AkhaQuote } from '../ui/index';
import './BlogCardGlass.css';
import { SECTION_ICONS } from './sectionIcons';

// ─── Props ─────────────────────────────────────────────────────────────────────
interface BlogCardProps {
  section: CultureSection;
  index: number;
  onOpen: (slug: string) => void;
}

// ─── CinematicHeroCard — Full-width 16:9 hero with overlay ─────────────────────
const CinematicHeroCard: React.FC<BlogCardProps> = ({ section, onOpen }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const icon = SECTION_ICONS[section.slug] ?? 'auto_stories';
  const categoryLabel = section.category ?? 'Culture & History';

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
        'aspect-video min-h-[280px] flex flex-col',
        'rounded-[2rem] border border-border',
        'transition-all duration-500 ease-out',
        'hover:-translate-y-1.5',
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

      {/* ── Background image ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-[2rem]">
        {section.primary_image ? (
          <MediaImage
            assetId={section.primary_image}
            showCaption={false}
            fallbackAlt={section.title}
            className="w-full h-full"
            imgClassName="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-surface flex items-center justify-center">
            <Icon name={icon} size="lg" color="muted" className="opacity-20" />
          </div>
        )}
        <div className="absolute inset-0 card-gradient-overlay opacity-80 group-hover:opacity-95 transition-opacity duration-500" />
      </div>

      {/* ── Overlay content ───────────────────────────────────────────────── */}
      <div className="blog-card-glass__content relative z-10 flex flex-col justify-between h-full p-6 md:p-8">

        {/* Header: category badge + audio badge */}
        <div className="flex justify-between items-start">
          <Badge variant="mineral" color="action" size="sm" icon={icon}>
            <Typography variant="microLabel" as="span" className="inherit drop-shadow-sm">
              {categoryLabel}
            </Typography>
          </Badge>

          {section.audio_asset_id && (
            <Badge variant="solid" color="primary" size="xs" icon="volume_up" pulse>
              Audio Story
            </Badge>
          )}
        </div>

        {/* Body: title + subtitle + quote + accent line */}
        <div className="flex flex-col gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-cinematic">
          <Typography
            variant="h3"
            color="inverse"
            className="line-clamp-2 drop-shadow-md"
          >
            {section.title}
          </Typography>

          <Typography
            variant="paragraphM"
            color="inverse"
            className="opacity-0 group-hover:opacity-90 line-clamp-2 transition-opacity duration-500 delay-100 font-light"
          >
            {section.subtitle}
          </Typography>

          {section.quote && (
            <AkhaQuote variant="main" align="left" className="mt-3 max-w-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-150">
              {section.quote}
            </AkhaQuote>
          )}

          <div className="w-0 group-hover:w-24 h-1 bg-action rounded-full mt-3 transition-all duration-700 ease-cinematic opacity-0 group-hover:opacity-100" />
        </div>

      </div>
    </article>
  );
};

export default CinematicHeroCard;
