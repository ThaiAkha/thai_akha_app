import React from 'react';
import { Header } from '../layout';
import { NewsMetadata } from '../../hooks/useNewsFeed';

interface HeroBannerProps {
  metadata: NewsMetadata;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ metadata }) => {
  return (
    <div className="relative w-full overflow-hidden flex flex-col justify-center min-h-[50vh] lg:min-h-[60vh] bg-background">
      {/* Immagine di sfondo */}
      {metadata.hero_image_url && (
        <div className="absolute inset-0 w-full h-full">
          <img
            src={metadata.hero_image_url}
            alt={metadata.header_title_main || "News Hero"}
            className="w-full h-full object-cover"
          />
          {/* Overlay gradiente cinematico */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent dark:from-background dark:via-background/70 dark:to-transparent/20" />
        </div>
      )}

      {/* Contenuto in primo piano */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8 lg:py-12">
        <Header 
          data={{
            titleMain: metadata.header_title_main,
            titleHighlight: metadata.header_title_highlight,
            description: metadata.page_description,
            badge: metadata.header_badge,
            icon: 'newspaper' // Icona dedicata alle news
          }}
        />
      </div>
    </div>
  );
};
