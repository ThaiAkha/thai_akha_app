
import { useEffect } from 'react';

/**
 * Hook per risolvere il problema dell'altezza 100vh sui browser mobile kha.
 * Imposta la variabile CSS --vh basata sull'altezza reale dell'area visibile.
 */
export const useViewportHeight = () => {
  useEffect(() => {
    const updateVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Esegui all'avvio
    updateVH();

    // Aggiungi listener per resize e rotazione
    window.addEventListener('resize', updateVH);
    window.addEventListener('orientationchange', updateVH);

    return () => {
      window.removeEventListener('resize', updateVH);
      window.removeEventListener('orientationchange', updateVH);
    };
  }, []);
};
