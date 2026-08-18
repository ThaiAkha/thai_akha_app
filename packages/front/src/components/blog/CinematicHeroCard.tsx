import React, { useRef, useEffect } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { CultureSection, ContentCategoryDB } from '@thaiakha/shared/types';
import { Typography, Badge, RippleLink } from '../ui/index';
import { t } from '../../i18n';
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
  const cardRef = useRef<HTMLAnchorElement>(null);
  const catObj = categories?.find(c => c.id === section.category?.id);
  const categoryLabel = catObj?.tab_label 
    ?? catObj?.title 
    ?? section.category?.title
    ?? t('blog:cultureHistory');

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
    <RippleLink
      ref={cardRef}
      href={`/history/${section.slug}`}
      onNavigate={() => onOpen(section.slug)}
      className={cn(
        'blog-card-glass',
        'group relative w-full flex flex-col',
        'rounded-[3rem] border-2 border-border/30 bg-surface',
        'transition-all duration-500 ease-out',
        'md:hover:-translate-y-1.5',
        'md:hover:border-secondary',
        'md:hover:shadow-[0_24px_64_rgb(var(--color-secondary)/0.25)]',
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
      <div className="relative w-full aspect-video shrink-0 overflow-hidden">
        {section.cover_data?.image_url ? (
          <img
            src={section.cover_data.image_url}
            alt={section.cover_data.alt_text || section.title}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out md:group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-border/10" />
        )}
        <div className="absolute inset-0 card-gradient-overlay opacity-80 md:group-hover:opacity-95 transition-opacity duration-500" />
        
        {/* Cherry vignette al hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-transparent to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Badge categoria + quote sull'immagine */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between [padding:var(--space-fluid-xl)]">
          <div className="flex items-start justify-between">
            {onCategoryClick && section.category?.id ? (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onCategoryClick(section.category!.id);
                }}
                className="md:hover:scale-105 active:scale-95 transition-transform"
              >
                <Badge variant="mineral" size="md" className="cursor-pointer md:hover:border-secondary/60 md:hover:text-secondary">
                  {categoryLabel}
                </Badge>
              </button>
            ) : (
              <Badge variant="mineral" size="md">
                {categoryLabel}
              </Badge>
            )}
            {section.featured && (
              <Badge variant="mineral" size="md" icon="star" className="text-allergy border-allergy/60">{t('history:featuredBadge')}</Badge>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center justify-end text-center [padding-bottom:var(--space-fluid-xl)]">
            {/* Desktop-only bottom-aligned title overlay */}
            <div className="hidden md:flex flex-col items-center [gap:var(--space-fluid-2xs)] max-w-2xl px-6">
              <Typography 
                variant="titleMain" 
                color="white" 
                className="![line-height:1] drop-shadow-2xl [text-shadow:0_4px_12px_rgba(0,0,0,0.6)]"
              >
                {section.title}
              </Typography>
              {section.subtitle && (
                <Typography 
                  variant="paragraphM" 
                  color="white" 
                  className="opacity-90 font-medium drop-shadow-lg"
                >
                  {section.subtitle}
                </Typography>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-only title block below image */}
      <div className="flex md:hidden flex-col items-center [padding:var(--space-fluid-m)] [gap:var(--space-fluid-2xs)] text-center">
        <Typography variant="h3" color="title" className="font-bold">
          {section.title}
        </Typography>
        {section.subtitle && (
          <Typography variant="paragraphM" color="sub">
            {section.subtitle}
          </Typography>
        )}
      </div>
    </RippleLink>
  );
};

export default CinematicHeroCard;
