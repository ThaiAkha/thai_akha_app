import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

interface SkeletonBaseProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'rounded';
}

/**
 * Base atomic component for all skeleton loading states.
 * Provides the shimmer/pulse animation and basic shaping.
 */
export const SkeletonBase: React.FC<SkeletonBaseProps> = ({ 
  className, 
  variant = 'rounded' // Default to rounded since Akha design uses heavy rounding
}) => {
  const variantClasses = {
    rectangular: 'rounded-none',
    circular: 'rounded-full',
    rounded: 'rounded-[2rem]', // Matching the 2rem/2.5rem theme
  };

  return (
    <div 
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-white/5',
        variantClasses[variant],
        className
      )}
      aria-hidden="true"
    />
  );
};

export default SkeletonBase;
