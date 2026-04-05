import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

interface SkeletonTitleProps {
  /** hero → h-12 md:h-16 | section → h-10 md:h-12 | sub → h-6 */
  variant?: 'hero' | 'section' | 'sub';
  width?: string;
  className?: string;
}

const HEIGHT: Record<NonNullable<SkeletonTitleProps['variant']>, string> = {
  hero: 'h-12 md:h-16',
  section: 'h-10 md:h-12',
  sub: 'h-6',
};

/**
 * Skeleton placeholder for titles.
 * Heights mirror HeaderSection variant sizes so layout shift is minimal.
 */
export const SkeletonTitle: React.FC<SkeletonTitleProps> = ({
  variant = 'section',
  width = 'w-3/4 max-w-lg',
  className,
}) => {
  return (
    <div
      className={cn('bg-surface-2 rounded-lg', HEIGHT[variant], width, className)}
      aria-hidden="true"
    />
  );
};

export default SkeletonTitle;
