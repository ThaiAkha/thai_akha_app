import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

interface CaptionProps {
  children: React.ReactNode;
  muted?: boolean;
  className?: string;
}

const Caption: React.FC<CaptionProps> = ({
  children,
  muted = false,
  className,
}) => {
  return (
    <p
      className={cn(
        'text-xs leading-relaxed',
        muted
          ? 'text-muted'
          : 'text-sub',
        className
      )}
    >
      {children}
    </p>
  );
};

export default Caption;
