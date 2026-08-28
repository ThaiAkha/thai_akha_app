import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

/** Fixed admin type scale (rem-based, no fluid clamp). Single source of truth. */
type HeadingLevel = 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type HeadingColor = 'default' | 'onDark' | 'brand' | 'muted';

interface HeadingProps {
  level?: HeadingLevel;
  /** Color intent. All variants are fully light + dark aware. */
  color?: HeadingColor;
  children: React.ReactNode;
  className?: string;
}

const HEADING_STYLES: Record<HeadingLevel, string> = {
  display: 'text-5xl font-black leading-tight tracking-tight', // 48px — hero titles
  h1: 'text-4xl font-bold leading-tight tracking-tight',       // 36px
  h2: 'text-3xl font-bold leading-snug tracking-tight',        // 30px
  h3: 'text-2xl font-bold leading-relaxed tracking-tight',     // 24px
  h4: 'text-xl font-bold leading-normal',                      // 20px (was 18 — closes 24→18 gap)
  h5: 'text-base font-semibold leading-normal',                // 16px
  h6: 'text-sm font-semibold leading-normal',                  // 14px
};

const HEADING_COLORS: Record<HeadingColor, string> = {
  default: 'text-title',
  onDark: 'text-white',                       // for dark surfaces (banners) — same in both modes
  brand: 'text-primary-600 dark:text-primary-400',
  muted: 'text-sub',
};

/** `display` is the visual hero size; it renders as a semantic <h1>. */
const TAG_BY_LEVEL: Record<HeadingLevel, keyof React.JSX.IntrinsicElements> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
};

const Heading: React.FC<HeadingProps> = ({
  level = 'h1',
  color = 'default',
  children,
  className,
}) => {
  const Tag = TAG_BY_LEVEL[level];
  const baseClasses = cn(
    HEADING_STYLES[level],
    HEADING_COLORS[color],
    className
  );

  return React.createElement(Tag, { className: baseClasses }, children);
};

export default Heading;
