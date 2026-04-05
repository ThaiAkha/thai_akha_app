import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

interface SkeletonDividerProps {
  width?: string;
  className?: string;
}

/**
 * Skeleton placeholder for decorative dividers (e.g. AkhaPixelPattern line).
 */
export const SkeletonDivider: React.FC<SkeletonDividerProps> = ({
  width = 'w-16',
  className,
}) => {
  return (
    <div
      className={cn(
        'h-1 bg-surface-2 rounded-full',
        '[margin-top:var(--space-fluid-xs)] [margin-bottom:var(--space-fluid-m)]',
        width,
        className
      )}
      aria-hidden="true"
    />
  );
};

export default SkeletonDivider;
