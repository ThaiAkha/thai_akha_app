import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { SkeletonTitle } from '../atoms/SkeletonTitle';
import { SkeletonText } from '../atoms/SkeletonText';
import { SkeletonDivider } from '../atoms/SkeletonDivider';

interface SkeletonHeaderProps {
  variant?: 'hero' | 'section' | 'sub';
  align?: 'left' | 'center' | 'right';
  hideTitle?: boolean;
  hideSubtitle?: boolean;
  hideDivider?: boolean;
  hideDescription?: boolean;
  className?: string;
}

const ALIGNMENT: Record<NonNullable<SkeletonHeaderProps['align']>, string> = {
  left: 'items-start',
  center: 'items-center',
  right: 'items-end',
};

/**
 * Reusable skeleton for HeaderSection / SmartHeaderSection loading state.
 * Composed from SkeletonTitle, SkeletonDivider, SkeletonText atoms.
 */
export const SkeletonHeader: React.FC<SkeletonHeaderProps> = ({
  variant = 'section',
  align = 'center',
  hideTitle,
  hideSubtitle,
  hideDivider,
  hideDescription,
  className,
}) => {
  const alignClass = ALIGNMENT[align];
  const textAlign = align === 'center' ? 'center' : 'left';

  return (
    <div
      className={cn(
        'w-full mx-auto flex flex-col animate-pulse opacity-70',
        '[gap:var(--space-fluid-s)]',
        '[padding-top:var(--space-fluid-s)] [padding-bottom:var(--space-fluid-s)]',
        alignClass,
        className
      )}
      aria-hidden="true"
    >
      {/* Subtitle badge placeholder */}
      {!hideSubtitle && (
        <div className="h-6 w-24 bg-surface-2 rounded-full [margin-bottom:var(--space-fluid-2xs)]" />
      )}

      {/* Title placeholder */}
      {!hideTitle && (
        <SkeletonTitle variant={variant === 'sub' ? 'sub' : variant} />
      )}

      {/* Divider placeholder */}
      {!hideDivider && <SkeletonDivider />}

      {/* Description placeholder */}
      {!hideDescription && (
        <SkeletonText lines={2} align={textAlign} />
      )}
    </div>
  );
};

export default SkeletonHeader;
