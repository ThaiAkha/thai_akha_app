import React, { useRef, useEffect } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { CultureSection } from '@thaiakha/shared/types';
import { Typography, Icon, RippleLink, AkhaPixelPattern } from '../ui/index';
import { t } from '../../i18n';
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
  const cardRef = useRef<HTMLAnchorElement>(null);
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
    <RippleLink
      ref={cardRef}
      href={`/history/${section.slug}`}
      onNavigate={() => onOpen(section.slug)}
      className={cn(
        'blog-card-glass',
        'group relative w-full overflow-hidden',
        'rounded-[2rem] border-2 border-border/30',
        'aspect-[4/3] md:aspect-square',
        'transition-all duration-500 ease-out',
        'md:hover:-translate-y-1',
        'md:hover:border-secondary',
        'md:hover:shadow-[0_24px_64px_-12px_rgb(var(--color-secondary)/0.25)]',
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
      {section.cover_data?.image_url ? (
        <img
          src={section.cover_data.image_url}
          alt={section.cover_data.alt_text || section.title}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 z-0 w-full h-full object-cover transition-transform duration-700"
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-border/20 flex items-center justify-center">
          <Icon name={icon} size="xl" color="muted" className="opacity-30" />
        </div>
      )}

      {/* ── Overlay and Content ─────────────────────────────────────────── */}
      <div className={cn(
        "absolute inset-x-0 bottom-0 z-20",
        "flex flex-col",
        "transition-transform duration-500 ease-out",
        "translate-y-0 md:translate-y-[calc(100%-var(--space-fluid-l)*3.2)] md:group-hover:translate-y-0"
      )}>
        {/* Black Multiply Background (#000000 80% multiply) */}
        <div className="absolute inset-0 bg-[#000000]/80 mix-blend-multiply pointer-events-none" />
        
        <div className="relative blog-card-glass__content [padding:var(--space-fluid-m)] flex flex-col [gap:var(--space-fluid-xs)]">
          <Typography
            variant="h4"
            as="h3"
            className="text-white md:group-hover:text-action transition-colors duration-300 leading-tight line-clamp-2"
          >
            {section.title}
          </Typography>
          
          <div className={cn(
            "grid transition-[grid-template-rows] duration-500 ease-out",
            "grid-rows-[1fr] md:grid-rows-[0fr] md:group-hover:grid-rows-[1fr]"
          )}>
            <div className="overflow-hidden flex flex-col [gap:var(--space-fluid-xs)] [margin-top:var(--space-fluid-2xs)]">
              <AkhaPixelPattern variant="line_simple_medium" size={6} opacity={0.9} />
              <Typography
                variant="paragraphS"
                className="text-white/80 line-clamp-2"
              >
                {section.subtitle}
              </Typography>
            </div>
          </div>

          <div className={cn(
            'flex items-center [gap:var(--space-fluid-2xs)] text-action [margin-top:var(--space-fluid-2xs)]',
            'opacity-100 md:opacity-0 md:group-hover:opacity-100',
            'translate-y-0 md:translate-y-4 md:group-hover:translate-y-0',
            'transition-all duration-500 delay-100',
          )}>
            <Typography variant="microLabel" className="uppercase">{t('blog:explore')}</Typography>
            <Icon name="arrow_forward" size="sm" />
          </div>
        </div>
      </div>
    </RippleLink>
  );
};

export default ChapterCard;
