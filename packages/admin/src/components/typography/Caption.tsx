import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

interface CaptionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Testo di contorno a 12px (timestamp, note, meta). Sempre `text-sub`: e' il livello
 * piu' tenue che passa AA a questa taglia. La vecchia prop `muted` (text-muted, 4.10 =
 * solo AA-large) e' stata rimossa il 2026-08-28: a 12px non poteva mai essere a norma.
 */
const Caption: React.FC<CaptionProps> = ({ children, className }) => (
  <p className={cn('text-xs leading-relaxed text-sub', className)}>{children}</p>
);

export default Caption;
