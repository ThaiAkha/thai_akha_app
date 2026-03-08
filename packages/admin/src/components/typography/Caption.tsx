import React from 'react';
import { cn } from '../../lib/utils';

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
          ? 'text-gray-400 dark:text-gray-500'
          : 'text-gray-500 dark:text-gray-400',
        className
      )}
    >
      {children}
    </p>
  );
};

export default Caption;
