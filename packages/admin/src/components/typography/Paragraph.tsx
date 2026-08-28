import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

type ParagraphSize = 'lg' | 'base' | 'sm' | 'xs';
type ParagraphColor = 'primary' | 'secondary' | 'muted' | 'onDark';

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
  primary: 'text-body',
  secondary: 'text-sub',
  muted: 'text-sub',
  onDark: 'text-white/70',  // for dark surfaces (banners) — same in both modes
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
