import React from 'react';
import { AkhaLoader, Typography } from '../ui/index';
import { cn } from '@thaiakha/shared/lib/utils';

interface PageLoaderProps {
  /** Etichetta sotto il fiore: e' la stessa in ogni stato, cosi' niente "appare" tra un loader e l'altro. */
  label?: string;
  className?: string;
}

/**
 * Loader di pagina UNICO del front (2026-09-05).
 *
 * Lo usano App (fallback <Suspense> del chunk lazy e gate profilo) e PageLayout
 * (metadata o dati in arrivo). Sono tre montaggi distinti dell'albero React che
 * si concatenano al primo accesso a una pagina: se il box, il fiore e il testo
 * sono gli stessi, l'occhio non vede il passaggio.
 *
 * - Il box riempie il viewport con `--vh`: sotto `lg` la shell non ha altezza,
 *   quindi un `h-full` collasserebbe e il fiore finirebbe in cima allo schermo.
 * - Nessuna animazione di entrata: un fade-in su un loader che ne sostituisce un
 *   altro e' un blink, non una transizione.
 * - La fase della fioritura vive in un orologio condiviso dentro AkhaPixelPattern:
 *   il loader che subentra riprende dallo stesso numero di pixel accesi.
 */
const PageLoader: React.FC<PageLoaderProps> = ({ label = 'Pick Ingredients...', className }) => (
  <div
    role="status"
    aria-live="polite"
    className={cn(
      'flex-grow w-full flex flex-col items-center justify-center min-h-[calc(var(--vh,1vh)*100)] bg-background',
      className
    )}
  >
    <AkhaLoader variant="bloom" size={10} />
    <Typography variant="microLabel" className="mt-8 text-muted animate-pulse">
      {label}
    </Typography>
  </div>
);

export default PageLoader;
