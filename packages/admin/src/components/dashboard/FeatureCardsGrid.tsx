import React from 'react';
import FeatureCard from './FeatureCard';

/**
 * Home card as returned by contentService.getHomeCards (home_cards row + resolved cover +
 * translated title/description/link_label). Legacy aliases (card_title, page_slug, ...) are no
 * longer produced by the service but the fallback chains below still read them.
 */
export interface HomeCard {
  id: number | string;
  role?: string | null;
  card_type?: string | null;
  title?: string | null;
  description?: string | null;
  link_label?: string | null;
  image_url?: string | null;
  icon_name?: string | null;
  target_path?: string | null;
  variant?: string | null;
  // Legacy aliases
  card_title?: string | null;
  card_description?: string | null;
  card_image?: string | null;
  page_slug?: string | null;
  slug?: string | null;
  card_slug?: string | null;
  cta_label?: string | null;
}

interface FeatureCardsGridProps {
  cards: HomeCard[];
}

const FeatureCardsGrid: React.FC<FeatureCardsGridProps> = ({ cards }) => {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-8 mb-8">
      {cards.map((card) => (
        <FeatureCard
          key={card.id}
          title={card.title || card.card_title || ''}
          description={card.description || card.card_description || ''}
          imageUrl={card.image_url || card.card_image || undefined}
          icon={card.icon_name ?? undefined}
          path={card.target_path || card.page_slug ? `/${card.target_path || card.page_slug}` : '#'}
          linkLabel={card.link_label ?? undefined}
        />
      ))}
    </div>
  );
};

export default FeatureCardsGrid;
