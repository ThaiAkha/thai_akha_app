import React from 'react';
import { cn } from '../../lib/utils';

type ParagraphSize = 'lg' | 'base' | 'sm' | 'xs';
type ParagraphColor = 'primary' | 'secondary' | 'muted';

interface ParagraphProps {
  size?: ParagraphSize;
  color?: ParagraphColor;
  children: React.ReactNode;
  className?: string;
}

const PARAGRAPH_SIZE_STYLES: Record<ParagraphSize, string> = {
  lg: 'text-lg leading-loose',
  base: 'text-base leading-relaxed',
  sm: 'text-sm leading-relaxed',
  xs: 'text-xs leading-relaxed',
};

const PARAGRAPH_COLOR_STYLES: Record<ParagraphColor, string> = {
  primary: 'text-gray-700 dark:text-gray-200',
  secondary: 'text-gray-600 dark:text-gray-300',
  muted: 'text-gray-500 dark:text-gray-400',
};

const Paragraph: React.FC<ParagraphProps> = ({
  size = 'base',
  color = 'primary',
  children,
  className,
}) => {
  const baseClasses = cn(
    PARAGRAPH_SIZE_STYLES[size],
    PARAGRAPH_COLOR_STYLES[color],
    className
  );

  return <p className={baseClasses}>{children}</p>;
};

export default Paragraph;
