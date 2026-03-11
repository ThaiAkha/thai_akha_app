import React from 'react';
import { Typography, Badge } from '../ui/index';

// ✅ 1. EXPORT INTERFACCIA (Top Level)
// Deve stare qui per essere importata da PageLayout senza errori circolari.
export interface HeaderMetadata {
  titleMain: string;
  titleHighlight?: string;
  description?: string;
  badge?: string;
  icon?: string;
  imageUrl?: string;
}

interface HeaderProps {
  data?: HeaderMetadata;
}

const Header: React.FC<HeaderProps> = ({ data }) => {
  if (!data) return null;

  return (
    // ✅ 2. CONTAINER STATICO
    // Rimosso 'animate-fade-slide-down'. L'animazione è ora gestita dal padre (PageLayout).
    <header className="w-full max-w-[85rem] mx-auto flex flex-col items-start pb-6">

      {/* BADGE SECTION */}
      <div className="mb-4">
        <Badge 
          variant="mineral" 
          icon={data.icon || 'restaurant'} 
          pulse={true} // Attiva l'animazione pulsante sull'icona interna
          className="pointer-events-none"
        >
          {data.badge}
        </Badge>
      </div>

      {/* TITLE BLOCK */}
      <div className="mb-0">
        {/* ✅ 3. FIX TIPOGRAFIA
            Uso <h1> come wrapper semantico invece di annidare Typography dentro Typography.
            Questo risolve l'errore TypeScript e migliora la SEO. 
        */}
        <h1 className="drop-shadow-2xl">
          
          <Typography 
            variant="titleMain" 
            as="span" 
            className="block"
          >
            {data.titleMain}
          </Typography>
          
          <Typography 
            variant="titleHighlight" 
            as="span" 
            // Gradiente Brand 4.8 (Pink -> Lime)
            className="block mt-1 md:mt-0 pb-1 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"
          >
            {data.titleHighlight}
          </Typography>

        </h1>
      </div>

        {/* DECORATIVE LINE: Responsive Thickness & Spacing */}
        <div className="
          bg-gradient-to-r from-action to-transparent rounded-full opacity-80 ml-1
          
          w-24 md:w-32 lg:w-40           /* LARGHEZZA: Mobile -> Tablet -> Desktop */
          h-1 md:h-11 lg:h-1            /* SPESSORE: 4px -> 6px -> 8px */
          mt-2 md:mt-3 lg:mt-3           /* SPAZIO SOPRA */
          mb-3 md:mb-4 lg:mb-4          /* SPAZIO SOTTO */
        " />
        
      {/* DESCRIPTION */}
      <div className="w-full max-w-3xl">
        <Typography variant="paragraphM">
          {data.description}
        </Typography>
      </div>

    </header>
  );
};

export default Header;