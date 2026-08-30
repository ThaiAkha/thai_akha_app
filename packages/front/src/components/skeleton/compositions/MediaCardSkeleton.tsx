import React from 'react';
import { SkeletonBase } from '../atoms';

interface MediaCardSkeletonProps {
  /** Proporzione dell'immagine: le card "reasons" sono 16/9, le NewsCard video. */
  aspect?: 'video' | '16/9';
  /** Righe di testo sotto il titolo. */
  lines?: number;
  className?: string;
}

/**
 * Card immagine + testo, fedele alle card reali (reasons di ClassOverview, NewsCard).
 *
 * Prima queste due liste usavano skeleton inline: le reasons un solo blocco
 * `aspect-[16/9]` senza la parte di testo, le news un `h-64` fisso piu' basso della
 * NewsCard vera. In entrambi i casi il contenuto saltava all'arrivo dei dati.
 */
export const MediaCardSkeleton: React.FC<MediaCardSkeletonProps> = ({
  aspect = '16/9',
  lines = 2,
  className,
}) => (
  <div className={`rounded-xl border border-border/40 bg-surface-2 overflow-hidden flex flex-col h-full ${className ?? ''}`}>
    <SkeletonBase
      className={aspect === 'video' ? 'aspect-video w-full rounded-none' : 'aspect-[16/9] w-full rounded-none'}
      variant="rectangular"
    />
    <div className="[padding:var(--space-fluid-m)] flex flex-col [gap:var(--space-fluid-xs)]">
      <SkeletonBase className="h-5 w-3/4 rounded-full" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase key={i} className={`h-4 rounded-full ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  </div>
);
