import React from 'react';
import { SkeletonBase, SkeletonText, SkeletonTitle } from '../atoms';
import { cn } from '@thaiakha/shared/lib/utils';

/**
 * HomeCardSkeleton - scheletro di UNA card Explore della home, con la stessa
 * struttura dell'InfoCard reale (immagine + titolo + descrizione + stats + bottone):
 * cosi' l'altezza prenotata e' quella vera e il passaggio skeleton → card non salta.
 * - vertical: immagine aspect-video sopra, testo sotto (card 0-2)
 * - horizontal: immagine w-32 md:w-48 a sinistra, testo a destra (card 3-4)
 */
export const HomeCardSkeleton: React.FC<{ layout?: 'vertical' | 'horizontal'; className?: string }> = ({ layout = 'vertical', className }) => {
  const horizontal = layout === 'horizontal';
  return (
    <div
      aria-hidden="true"
      className={cn(
        'w-full flex overflow-hidden rounded-[2rem] bg-surface border-2 border-border',
        horizontal ? 'flex-row min-h-[140px]' : 'flex-col',
        className,
      )}
    >
      <SkeletonBase className={cn('shrink-0 rounded-none', horizontal ? 'w-32 md:w-48 self-stretch' : 'w-full aspect-video')} />
      <div className="flex-1 min-w-0 flex flex-col [padding:var(--space-fluid-m)] [gap:var(--space-fluid-xs)]">
        <SkeletonTitle variant="sub" width="w-3/4" className="items-start" />
        <SkeletonText lines={horizontal ? 2 : 3} align="left" height="h-3" />
        <div className="mt-auto flex items-end justify-between [gap:var(--space-fluid-s)] pt-2">
          <SkeletonText lines={1} align="left" height="h-3" className="max-w-[40%]" />
          <SkeletonBase className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
};

/**
 * HomeGridSkeleton
 *
 * Skeleton per la griglia Explore della Home Page: STESSA griglia e stessi col-span
 * della griglia vera (3 card verticali + 2 orizzontali; su mobile le orizzontali
 * occupano 2 colonne). Usato durante il fetch di useFrontHomeCards.
 */
export const HomeGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-6 [gap:var(--space-fluid-m)]">
    {[0, 1, 2].map((i) => (
      <div key={i} className="col-span-1 md:col-span-2">
        <HomeCardSkeleton layout="vertical" />
      </div>
    ))}
    {[3, 4].map((i) => (
      <div key={i} className="col-span-2 md:col-span-3">
        <HomeCardSkeleton layout="horizontal" />
      </div>
    ))}
  </div>
);

export default HomeGridSkeleton;
