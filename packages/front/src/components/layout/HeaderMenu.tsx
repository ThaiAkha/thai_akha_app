import React, { useState, useEffect } from 'react';
import Typography from '../ui/Typography';
import { contentService } from '@thaiakha/shared/services'; // ✅ Usa il Service (Cache)
import { HeaderMetadata } from './Header';
import AkhaPixelPattern from '../ui/AkhaPixelPattern';
import { cn } from '@thaiakha/shared/lib/utils';
import { LogoFullLight, LogoFullDark } from '@thaiakha/shared';

interface HeaderMenuProps {
  currentStep?: 1 | 2;
  customSlug?: string;
}

const HeaderMenu: React.FC<HeaderMenuProps> = ({ currentStep, customSlug }) => {
  const [data, setData] = useState<HeaderMetadata | null>(null);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const fetchMenuMeta = async () => {
      try {
        const targetSlug = customSlug || (currentStep === 1 ? 'menu-step-1' : 'menu-step-2');
        const meta = await contentService.getPageMetadata(targetSlug);
        if (meta) setData(meta);
      } catch (e) {
        console.error("Header metadata error kha:", e);
      }
    };
    fetchMenuMeta();
  }, [currentStep, customSlug]);

  // Reactive dark mode: aggiorna il logo quando cambia il tema
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // ✅ FIX: Rimosso il loader/skeleton.
  // Se i dati non ci sono ancora (raro con la cache), rendiamo null per non occupare spazio
  // o un div trasparente con l'altezza esatta per evitare layout shift.
  if (!data) return <div className="min-h-[200px] w-full opacity-0" />;

  return (
    <header className={cn(
      "app-header-layout flex flex-col items-center text-center w-full justify-start",

      // 1. Spaziatura Verticale (Il tuo codice, perfetto)
      "pt-10 md:pt-12 lg:pt-14 pb-12",

      // 2. Transizioni Colore (Per Light/Dark mode)
      "transition-all duration-700",

      // 3. ✨ Altezza Minima (Evita scatti se il titolo è breve)
      "min-h-[200px]"
    )}>

      {/* 1. BRAND LOGO */}
      <div className="mb-4 mx-auto opacity-90 hover:opacity-100 transition-opacity cursor-pointer">
        <img
          src={isDark ? LogoFullDark : LogoFullLight}
          alt="Thai Akha Kitchen"
          className="h-20 md:h-30 object-contain"
        />
      </div>

      {/* 2. TITOLO CENTRATO */}
      <h1 className="flex flex-wrap justify-center gap-x-3 mb-2">
        <Typography
          variant="titleMain"
          color="title"
          as="span"
        >
          {data.titleMain}
        </Typography>
        <Typography
          variant="titleHighlight"
          as="span"
          className="pb-1"
        >
          {data.titleHighlight}
        </Typography>
      </h1>

      <div className="mt-3 mb-5 mx-auto opacity-90 hover:opacity-100 transition-opacity">
        <AkhaPixelPattern variant="line_simple" size={5} speed={40} />
      </div>

      {/* 3. DESCRIZIONE */}
      <Typography
        variant="paragraphL"
        color="sub"
        className="max-w-2xl whitespace-pre-wrap"
      >
        {data.description}
      </Typography>

    </header>
  );
};

export default HeaderMenu;