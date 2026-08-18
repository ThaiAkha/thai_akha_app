import React from 'react';
import { useFrontHomeCards } from '../../../hooks/useFrontHomeCards';
import InfoCard from './InfoCard';
import { SkeletonBase } from '../../skeleton/atoms';
import { cn } from '@thaiakha/shared/lib/utils';

interface SmartHomeCardProps {
  cardId: string;
  onNavigate: (page: string, topic?: string) => void;
  layout?: 'vertical' | 'horizontal';
  aspectRatio?: 'video' | 'square' | 'portrait' | 'auto';
  className?: string;
  showDivider?: boolean;
  titleVariant?: "h1" | "h2" | "h3" | "h4" | "h5" | "display1" | "display2";
  buttonSize?: "xs" | "sm" | "md" | "lg";
  buttonVariant?: any; // any to avoid importing ButtonVariant if not necessary
}

const SmartHomeCard: React.FC<SmartHomeCardProps> = ({
  cardId,
  onNavigate,
  layout = 'vertical',
  aspectRatio = 'video',
  className,
  showDivider = false,
  titleVariant,
  buttonSize,
  buttonVariant
}) => {
  const { cards, loading } = useFrontHomeCards([cardId]);

  if (loading) {
    const loadingAspect = aspectRatio === 'video' ? 'aspect-video' : 
                          aspectRatio === 'square' ? 'aspect-square' : 
                          aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-video';
                          
    return (
      <div className={cn(
        "w-full rounded-[2rem] overflow-hidden bg-surface-2 animate-pulse",
        layout === 'horizontal' ? 'aspect-video md:aspect-auto md:h-40' : loadingAspect,
        className
      )}>
        <SkeletonBase className="w-full h-full" />
      </div>
    );
  }

  const cardData = cards.find(c => c.card_id === cardId);

  if (!cardData) return null;

  // Map database data to InfoCard format
  const mappedCard = {
    id: cardData.card_id ?? undefined,
    title: cardData.title,
    desc: cardData.description,
    link: cardData.target_path.startsWith('/') ? cardData.target_path.substring(1) : cardData.target_path,
    image: (Array.isArray(cardData.cover_data) ? cardData.cover_data[0]?.image_url : cardData.cover_data?.image_url) || '',
    stats: [
      // Ternario, non `&&`: con extra_1 = "" il corto-circuito restituirebbe la
      // stringa vuota (non null) e passerebbe il filtro NonNullable qui sotto.
      cardData.extra_1
        ? {
            label: cardData.suffix_extra_1 || undefined,
            value: cardData.extra_1,
            color: 'action' as const,
          }
        : null,
      cardData.extra_2
        ? {
            label: cardData.suffix_extra_2 || undefined,
            value: cardData.extra_2,
            color: 'gray' as const,
          }
        : null
    ].filter((s): s is NonNullable<typeof s> => !!s)
  };

  return (
    <div className={className}>
      <InfoCard
        card={mappedCard}
        layout={layout}
        aspectRatio={aspectRatio}
        onNavigate={onNavigate}
        showDivider={showDivider}
        titleVariant={titleVariant}
        linkLabel={cardData.link_label || undefined}
        buttonSize={buttonSize}
        buttonVariant={buttonVariant}
      />
    </div>
  );
};

export default SmartHomeCard;
