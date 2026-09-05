import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

interface CinematicBackgroundProps {
  isLoaded: boolean;
  /**
   * Marcatore "questa pagina ha una cover": decide se le luci si accendono
   * (le pagine senza cover non le hanno mai avute). NON viene piu' scaricato.
   */
  imageUrl: string;
  showPatterns?: boolean;
}

const CinematicBackground: React.FC<CinematicBackgroundProps> = ({
  isLoaded,
  imageUrl,
}) => {
  // Qui c'era un preload `new Image()` piu' un layer con la foto in
  // `backgroundImage`. Il layer stava a `opacity-0` in TUTTI e due i rami e in
  // TUTTI e due i temi: invisibile per costruzione, nonostante il commento
  // promettesse 0.08 in chiaro e 0.12 in scuro. Il download avveniva lo stesso, e
  // due volte per pagina (prima og-default.jpg del fallback, poi la cover vera),
  // e soprattutto le luci qui sotto aspettavano il suo `onload` per comparire.
  // Rimosso il 2026-09-05: stesso sfondo a schermo, senza scaricare niente e
  // senza aspettare. Se un giorno la texture si vuole davvero, torna come <img
  // loading="lazy"> con una opacita' diversa da zero.
  const show = isLoaded && Boolean(imageUrl);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-background transition-colors duration-1000">

      {/* 2. DYNAMIC CINEMATIC BLOBS - LUCE PRIMARIA (Top-Left)
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

      {/* 3. DYNAMIC CINEMATIC BLOBS - LUCE SECONDARIA (Bottom-Right)
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


    </div>
  );
};

export default CinematicBackground;