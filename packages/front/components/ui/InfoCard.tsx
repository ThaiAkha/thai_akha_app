import React, { useState } from 'react';
import { Typography } from './index';
import { cn } from '../../lib/utils';

// 1. DEFINIZIONE DELLE INTERFACCE (Fondamentale!)
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
  index?: number; // Opzionale
  onNavigate: (page: string, topic?: string) => void;
  layout?: 'vertical' | 'horizontal'; // Supporto per il layout mobile/desktop
  aspectRatio?: 'video' | 'square' | 'portrait' | 'auto';
}

const InfoCard: React.FC<InfoCardProps> = ({ 
  card, 
  onNavigate,
  layout = 'vertical' 
}) => {
  const [imgError, setImgError] = useState(false);
  const isHorizontal = layout === 'horizontal';

  return (
    <div
      onClick={() => onNavigate(card.link)}
      className={cn(
        "group relative flex w-full overflow-hidden rounded-[1.5rem] cursor-pointer transition-all duration-500",
        "bg-white border border-slate-200 dark:bg-white/5 dark:backdrop-blur-xl dark:border-white/10",
        "hover:shadow-2xl hover:-translate-y-1",
        
        // 🏗️ FIX MOBILE: flex-row fisso se horizontal, altrimenti colonna
        isHorizontal ? "flex-row h-32 md:h-40" : "flex-col"
      )}
    >
      {/* --- IMAGE SECTION --- */}
      <div className={cn(
        "relative overflow-hidden shrink-0",
        // Se orizzontale, la foto è un quadrato fisso a sinistra
        isHorizontal ? "w-32 md:w-40 h-full" : "w-full aspect-video"
      )}>
        
        {/* 👇 EFFETTO FLASH LIGHT (20% White on Hover) */}
        <div className="absolute inset-0 z-20 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
        
        {/* Overlay scuro di base */}
        <div className="absolute inset-0 z-10 bg-black/10 dark:bg-black/20" />

        {!imgError ? (
          <img
            src={card.image}
            alt={card.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
             <span className="material-symbols-outlined opacity-20">image</span>
          </div>
        )}
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="flex-1 flex flex-col p-4 md:p-6 justify-center min-w-0">
        <Typography 
          variant="h3" 
          className="text-base md:text-xl font-bold truncate text-title group-hover:text-action dark:text-action dark:group-hover:text-white transition-colors"
        >
          {card.title}
        </Typography>

        <Typography 
          variant="body" 
          className="text-xs md:text-sm text-desc opacity-70 line-clamp-2 mt-1"
        >
          {card.desc}
        </Typography>

        {/* Footer Minimal per versione orizzontale */}
        <div className="mt-2 flex items-center text-[9px] font-black tracking-widest text-action opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          EXPLORE <span className="material-symbols-outlined text-xs ml-1">arrow_forward</span>
        </div>
      </div>
    </div>
  );
};
// ... tutto il resto del codice sopra

// 👇 AGGIUNGI QUESTA RIGA ALLA FINE
export default InfoCard;