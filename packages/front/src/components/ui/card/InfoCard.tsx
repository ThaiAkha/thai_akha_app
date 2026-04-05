import React, { useState } from 'react';
import { Typography, Icon, MediaImage, Button } from '../index';
import { cn } from '@thaiakha/shared/lib/utils';

// ── Tipi ──────────────────────────────────────────────────────────────────────

export interface CardItem {
  id?: string | number;
  title: string;
  desc: string;
  link: string;
  image: string;
  icon?: string;
}

export interface InfoCardProps {
  card: CardItem;
  index?: number;
  onNavigate: (page: string, topic?: string) => void;
  layout?: 'vertical' | 'horizontal';
  aspectRatio?: 'video' | 'square' | 'portrait' | 'auto';
}

// ── Componente ────────────────────────────────────────────────────────────────

const InfoCard: React.FC<InfoCardProps> = ({
  card,
  onNavigate,
  layout = 'vertical',
}) => {
  const [imgError, setImgError] = useState(false);
  const isHorizontal = layout === 'horizontal';

  return (
    <div
      onClick={(e) => {
        if (card.link.startsWith('http')) {
          e.stopPropagation();
          window.open(card.link, '_blank', 'noopener,noreferrer');
        } else {
          onNavigate(card.link);
        }
      }}
      className={cn(
        'group relative flex w-full overflow-hidden cursor-pointer',
        'rounded-[2rem]',
        'bg-surface border-2 border-border',
        'transition-all duration-500 ease-in-out',
        'hover:shadow-theme-xl hover:-translate-y-1',
        isHorizontal ? 'flex-row min-h-[140px]' : 'flex-col',
      )}
    >
      {/* ── Immagine ─────────────────────────────────────────────────────── */}
      <div
        className={cn(
          'relative overflow-hidden shrink-0',
          isHorizontal ? 'w-32 md:w-44 self-stretch' : 'w-full aspect-video',
        )}
      >
        {/* Flash hover */}
        <div className="absolute inset-0 z-20 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-[0.12] pointer-events-none" />
        {/* Overlay base */}
        <div className="absolute inset-0 z-10 bg-black/10 dark:bg-black/20 pointer-events-none" />

        {card.image && !imgError ? (
          <MediaImage
            url={card.image}
            fallbackAlt={card.title}
            showCaption={false}
            className="absolute inset-0"
            imgClassName="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-surface-2 flex items-center justify-center">
            <Icon name="image" size="md" className="text-muted opacity-30" />
          </div>
        )}

        {/* ── CTA overlay ── */}
        <div
          className={cn(
            'absolute z-30',
            'translate-y-0 opacity-100',
            'lg:translate-y-4 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100',
            'transition-all duration-300 ease-out',
            isHorizontal
              ? 'inset-0 flex items-center justify-center'
              : 'bottom-0 right-0',
          )}
        >
          <div className={cn(!isHorizontal && "[padding:var(--space-fluid-s)]")}>
            <Button
              variant="brand"
              size="xs"
              icon="arrow_forward"
              iconPosition="right"
            >
              Explore
            </Button>
          </div>
        </div>
      </div>

      {/* ── Contenuto ────────────────────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col justify-center min-w-0 overflow-hidden [padding:var(--space-fluid-m)]"
      >
        {/* Titolo */}
        <Typography
          variant="h4"
          color="title"
          className="truncate group-hover:text-action transition-colors duration-300"
        >
          {card.title}
        </Typography>

        {/* Descrizione */}
        <Typography
          variant="paragraphS"
          color="sub"
          className={cn(
            'mt-[var(--space-fluid-2xs)]',
            isHorizontal ? 'line-clamp-2' : 'line-clamp-3',
          )}
        >
          {card.desc}
        </Typography>
      </div>
    </div>
  );
};

export default InfoCard;