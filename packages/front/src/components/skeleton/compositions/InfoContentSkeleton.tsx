import React from 'react';
import { SkeletonBase } from '../atoms';

interface InfoContentSkeletonProps {
  /** Numero di blocchi-sezione fittizi (default 5). */
  blocks?: number;
}

/**
 * InfoContentSkeleton — loading per il contenuto delle pagine info (FAQ / legale):
 * una lista di card-sezione (titolo + righe di testo). Riflette il layout reale
 * (card rounded-2xl border) → nessun layout shift.
 */
export const InfoContentSkeleton: React.FC<InfoContentSkeletonProps> = ({ blocks = 5 }) => (
  <div className="flex flex-col [gap:var(--space-fluid-m)] w-full">
    {Array.from({ length: blocks }).map((_, i) => (
      <div
        key={i}
        className="flex flex-col [gap:var(--space-fluid-s)] [padding:var(--space-fluid-m)] rounded-2xl border border-border/50"
      >
        <SkeletonBase className="h-5 w-1/2 rounded-full" />
        <SkeletonBase className="h-3.5 w-full rounded-full" />
        <SkeletonBase className="h-3.5 w-11/12 rounded-full" />
        <SkeletonBase className="h-3.5 w-4/5 rounded-full" />
      </div>
    ))}
  </div>
);

export default InfoContentSkeleton;
