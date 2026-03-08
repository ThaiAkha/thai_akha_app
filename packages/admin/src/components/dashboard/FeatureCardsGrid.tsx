import React from 'react';
import FeatureCard from './FeatureCard';

interface FeatureCardsGridProps {
  cards: any[];
}

const FeatureCardsGrid: React.FC<FeatureCardsGridProps> = ({ cards }) => {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
      {cards.map((card: any) => (
        <FeatureCard
          key={card.id}
          title={card.title || card.card_title}
          description={card.description || card.card_description}
          imageUrl={card.image_url || card.card_image}
          icon={card.icon_name}
          path={card.target_path || card.page_slug ? `/${card.target_path || card.page_slug}` : '#'}
          linkLabel={card.link_label}
        />
      ))}
    </div>
  );
};

export default FeatureCardsGrid;
