import React from 'react';
import { cn } from '../../lib/utils';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface HeadingProps {
  level?: HeadingLevel;
  children: React.ReactNode;
  className?: string;
}

const HEADING_STYLES: Record<HeadingLevel, string> = {
  h1: 'text-4xl font-bold leading-tight tracking-tight',
  h2: 'text-3xl font-bold leading-snug tracking-tight',
  h3: 'text-2xl font-bold leading-relaxed tracking-tight',
  h4: 'text-lg font-bold leading-normal',
  h5: 'text-base font-semibold leading-normal',
  h6: 'text-sm font-semibold leading-normal',
};

const Heading: React.FC<HeadingProps> = ({
  level = 'h1',
  children,
  className,
}) => {
  const Tag = level;
  const baseClasses = cn(
    HEADING_STYLES[level],
    'text-gray-900 dark:text-white',
    className
  );

  return React.createElement(Tag, { className: baseClasses }, children);
};

export default Heading;
