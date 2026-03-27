import React, { useState, useEffect } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

interface CinematicBackgroundProps {
  isLoaded: boolean;
  imageUrl: string;
  showPatterns?: boolean;
}

const CinematicBackground: React.FC<CinematicBackgroundProps> = ({
  isLoaded,
  imageUrl,
  showPatterns = false
}) => {
  const [imgReady, setImgReady] = useState(false);

  // 1. GESTIONE PRELOAD IMMAGINE
  // Carica l'immagine in memoria per evitare il "pop" visivo e gestire la transizione blur.
  useEffect(() => {
    setImgReady(false);
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setImgReady(true);
  }, [imageUrl]);

  const show = isLoaded && imgReady;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-white dark:bg-[#0a0a0a] transition-colors duration-1000">

      {/* 2. TEXTURE FOTOGRAFICA (STATICA)
          - Rimossa ogni logica di parallasse per una stabilità visiva totale.
          - Light Mode: Opacity 0.08 + mix-blend-luminosity per un bianco "seta".
          - Dark Mode: Opacity 0.12 + mix-blend-overlay per profondità senza grigiore.
      */}
      <div
        className={cn(
          "absolute inset-0 bg-cover bg-center transition-all duration-[1.5s] ease-out",
          "mix-blend-luminosity dark:mix-blend-overlay",
          show
            ? "opacity-[0.08] dark:opacity-[0.12] scale-100 blur-0"
            : "opacity-0 scale-105 blur-xl"
        )}
        style={{ backgroundImage: `url('${imageUrl}')` }}
      />

      {/* 3. DYNAMIC CINEMATIC BLOBS - LUCE PRIMARIA (Top-Left)
          Preso spunto dal vecchio file: movimento d'ingresso laterale e blur profondo.
      */}
      <div
        className={cn(
          "absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full blur-[120px] transition-all duration-[1200ms] ease-cinematic",
          "bg-action/10 dark:bg-primary/10 animate-pulse-slow",
          show
            ? "opacity-100 translate-x-0 translate-y-0"
            : "opacity-0 -translate-x-20 -translate-y-10"
        )}
      />

      {/* 4. DYNAMIC CINEMATIC BLOBS - LUCE SECONDARIA (Bottom-Right)
          - Light: Action Green (Sottile)
          - Dark: Secondary Lime (Accento Acido)
      */}
      <div
        className={cn(
          "absolute bottom-[-15%] right-[-10%] w-[65%] h-[65%] rounded-full blur-[150px] transition-all duration-[1200ms] ease-cinematic",
          "bg-action/5 dark:bg-secondary/5 animate-pulse-slow",
          show
            ? "opacity-100 translate-x-0 translate-y-0"
            : "opacity-0 translate-x-20 translate-y-10"
        )}
        style={{ transitionDelay: '300ms' }}
      />

      {/* 5. VIGNETTE DI PROTEZIONE
          Garantisce che il centro della pagina sia sempre Bianco/Dark puro per la leggibilità.
      */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,white_95%,white_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_30%,#0a0a0a_95%,#0a0a0a_100%)] opacity-40" />

    </div>
  );
};

export default CinematicBackground;