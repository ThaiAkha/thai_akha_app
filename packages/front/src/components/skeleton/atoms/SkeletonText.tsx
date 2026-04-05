import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: string;
  height?: string;
  align?: 'left' | 'center';
  className?: string;
}

/**
 * Skeleton placeholder for text paragraphs.
 * Renders N lines with the last line shorter for a natural "text ending" effect.
 */
export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 2,
  lastLineWidth = 'w-5/6',
  height = 'h-4',
  align = 'center',
  className,
}) => {
  return (
    <div
      className={cn(
        'w-full max-w-2xl flex flex-col [gap:var(--space-fluid-2xs)]',
        align === 'center' && 'items-center',
        className
      )}
      aria-hidden="true"
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-surface-2 rounded',
            height,
            i === lines - 1 && lines > 1 ? lastLineWidth : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

export default SkeletonText;
