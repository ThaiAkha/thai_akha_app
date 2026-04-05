import React, { useRef, useEffect } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { CultureSection, ContentCategoryDB } from '@thaiakha/shared/types';
import { Typography, Badge, MediaImage, AkhaQuote } from '../ui/index';
import './BlogCardGlass.css';

// ─── Props ─────────────────────────────────────────────────────────────────────
interface BlogCardProps {
  section: CultureSection;
  index: number;
  onOpen: (slug: string) => void;
  categories?: ContentCategoryDB[];
  onCategoryClick?: (categoryId: string) => void;
}

// ─── CinematicHeroCard — Full-width 16:9 hero with overlay ─────────────────────
const CinematicHeroCard: React.FC<BlogCardProps> = ({ section, onOpen, categories, onCategoryClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const catObj = categories?.find(c => c.id === section.category_id);
  const categoryLabel = catObj?.tab_label 
    ?? catObj?.title 
    ?? section.category
    ?? 'Culture & History';

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
        'group relative w-full cursor-pointer flex flex-col',
        'rounded-[3rem] border-4 border-border bg-surface',
        'transition-all duration-500 ease-out',
        'hover:-translate-y-1.5',
        'hover:border-primary/60',
        'hover:shadow-[0_24px_64px_-12px_rgb(var(--color-primary)/0.25)]',
        'overflow-hidden',
      )}
      style={{
        '--mouse-x': '50%',
        '--mouse-y': '50%',
      } as React.CSSProperties}
    >
      {/* ── Gradient border + glow (follow mouse) ───────────────────────── */}
      <div className="blog-card-glass__border rounded-[3rem]" />
      <div className="blog-card-glass__glow rounded-[3rem]" />

      {/* ── Hero image ───────────────────────────────────────────────────── */}
      <div className="relative w-full aspect-video min-h-[240px] shrink-0 overflow-hidden">
        {section.primary_image ? (
          <MediaImage
            assetId={section.primary_image}
            showCaption={false}
            fallbackAlt={section.title}
            className="absolute inset-0 w-full h-full"
            imgClassName="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-border/10" />
        )}
        <div className="absolute inset-0 card-gradient-overlay opacity-80 group-hover:opacity-95 transition-opacity duration-500" />
        {/* Cherry vignette al hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Badge categoria + quote sull'immagine */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between [padding:var(--space-fluid-m)]">
          <div className="flex items-start justify-between">
            {onCategoryClick && section.category_id ? (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onCategoryClick(section.category_id!);
                }}
                className="hover:scale-105 active:scale-95 transition-transform"
              >
                <Badge variant="mineral" size="md" className="cursor-pointer hover:border-action/60 hover:text-action">
                  {categoryLabel}
                </Badge>
              </button>
            ) : (
              <Badge variant="mineral" size="md">
                {categoryLabel}
              </Badge>
            )}
            {section.featured && (
              <Badge variant="mineral" size="md" icon="star" className="text-allergy border-allergy/60">Featured</Badge>
            )}
          </div>
          {section.quote && (
            <AkhaQuote variant="main" align="left" className="max-w-xl">
              {section.quote}
            </AkhaQuote>
          )}
        </div>
      </div>

    </article>
  );
};

export default CinematicHeroCard;
