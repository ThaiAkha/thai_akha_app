import React, { useState, useEffect } from 'react';
import Typography from '../ui/Typography';
import { contentService } from '../../services/contentService'; // ✅ Usa il Service (Cache)
import { HeaderMetadata } from './Header';
import AkhaPixelPattern from '../ui/AkhaPixelPattern';
import { cn } from '../../lib/utils';

interface HeaderMenuProps {
  currentStep?: 1 | 2;
  customSlug?: string;
}

const HeaderMenu: React.FC<HeaderMenuProps> = ({ currentStep, customSlug }) => {
  const [data, setData] = useState<HeaderMetadata | null>(null);

  useEffect(() => {
    const fetchMenuMeta = async () => {
      try {
        const targetSlug = customSlug || (currentStep === 1 ? 'menu-step-1' : 'menu-step-2');
        
        // ✅ FIX: Usa contentService invece di Supabase diretto.
        // Questo sfrutta la cache generata dal PageLayout per un render istantaneo.
        const meta = await contentService.getPageMetadata(targetSlug);

        if (meta) {
          setData(meta);
        }
      } catch (e) {
        console.error("Header metadata error kha:", e);
      }
    };
    fetchMenuMeta();
  }, [currentStep, customSlug]);

  // ✅ FIX: Rimosso il loader/skeleton.
  // Se i dati non ci sono ancora (raro con la cache), rendiamo null per non occupare spazio
  // o un div trasparente con l'altezza esatta per evitare layout shift.
  if (!data) return <div className="min-h-[200px] w-full opacity-0" />;

  return (
      <header className={cn(
        "app-header-layout flex flex-col items-center text-center w-full justify-start",
        
        // 1. Spaziatura Verticale (Il tuo codice, perfetto)
        "pt-12 md:pt-14 lg:pt-16 pb-12",
        
        // 2. Transizioni Colore (Per Light/Dark mode)
        "transition-all duration-700",

        // 3. ✨ Altezza Minima (Evita scatti se il titolo è breve)
        "min-h-[200px]" 
      )}>
      
      {/* 1. DECORATIVE LINE (Logo) */}
      <div className="mb-4 mx-auto opacity-90 hover:opacity-100 transition-opacity">
        <AkhaPixelPattern variant="logo" size={4} speed={40}/>
      </div>

      {/* 2. TITOLO CENTRATO */}
      <h1 className="font-display font-black leading-[0.9] tracking-tighter flex flex-wrap justify-center gap-x-3 drop-shadow-2xl mb-2">
        <span className="uppercase text-title text-4xl md:text-5xl lg:text-6xl">
          {data.titleMain}
        </span>
        <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary pb-2 -mb-2 block md:inline-block text-4xl md:text-5xl lg:text-6xl">
          {data.titleHighlight}
        </span>
      </h1>
 
      <div className="mt-3 mb-5 mx-auto opacity-90 hover:opacity-100 transition-opacity">
        <AkhaPixelPattern variant="line_simple" size={4} speed={40}/>
      </div>

      {/* 3. DESCRIZIONE */}
      <Typography 
        variant="paragraphL" 
        className="max-w-2xl text-desc opacity-90 leading-relaxed text-sm md:text-lg lg:text-xl font-medium whitespace-pre-wrap"
      >
        {data.description}
      </Typography>

    </header>
  );
};

export default HeaderMenu;