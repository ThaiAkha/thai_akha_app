import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

// Maps user-facing size aliases → CSS token names from tokens.css
const SPACE_TOKEN: Record<string, string> = {
  '2xs': '--space-fluid-2xs',
  xs:   '--space-fluid-xs',
  s:    '--space-fluid-s',
  m:    '--space-fluid-m',
  l:    '--space-fluid-l',
  xl:   '--space-fluid-xl',
  '2xl':'--space-fluid-2xl',
  '3xl':'--space-fluid-3xl',
};

type SpaceSize = keyof typeof SPACE_TOKEN;
type PaddingSize = 'none' | SpaceSize;

// ─────────────────────────────────────────────────────────────────────────────
// Spacer
// ─────────────────────────────────────────────────────────────────────────────

interface SpacerProps {
  /** Axis of the space. Default: 'vertical' */
  direction?: 'vertical' | 'horizontal';
  /** Size token. Default: 'm' */
  size?: SpaceSize;
  className?: string;
  /** Hide from assistive tech. Default: true */
  ariaHidden?: boolean;
}

/**
 * Pure whitespace block using fluid space tokens.
 * The tokens are responsive by nature (clamp()), so no need for mobile/desktop props.
 * For custom responsive overrides, pass className with breakpoints.
 *
 * @example
 * <Spacer size="xl" />
 * <Spacer direction="horizontal" size="s" />
 * <Spacer size="2xs" className="md:h-[var(--space-fluid-s)]" /> // custom responsive
 */
export function Spacer({
  direction = 'vertical',
  size = 'm',
  className,
  ariaHidden = true,
}: SpacerProps) {
  const token = SPACE_TOKEN[size];
  const style: React.CSSProperties =
    direction === 'vertical'
      ? { height: `var(${token})`, width: '100%', flexShrink: 0 }
      : { width: `var(${token})`, height: 0, flexShrink: 0, display: 'inline-block' };

  return (
    <div
      aria-hidden={ariaHidden || undefined}
      style={style}
      className={cn(className)}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SectionContainer
// ─────────────────────────────────────────────────────────────────────────────

interface SectionContainerProps {
  /** Uniform padding size. Default: 'l' */
  padding?: PaddingSize;
  /** Apply padding only to top */
  paddingTop?: boolean;
  /** Apply padding only to bottom */
  paddingBottom?: boolean;
  className?: string;
  children: React.ReactNode;
  /** Root element tag. Default: 'div' */
  as?: keyof React.JSX.IntrinsicElements;
  /** When false (default), centers content with max-width. When true, removes constraints. */
  fullWidth?: boolean;
}

/**
 * Wrapper that applies consistent vertical (or directional) padding
 * using fluid space tokens.
 *
 * @example
 * <SectionContainer padding="xl">…</SectionContainer>
 * <SectionContainer paddingTop padding="l">…</SectionContainer>
 * <SectionContainer fullWidth>…</SectionContainer> // spans entire viewport width
 */
export function SectionContainer({
  padding = 'l',
  paddingTop,
  paddingBottom,
  className,
  children,
  as: Tag = 'div',
  fullWidth = false,
}: SectionContainerProps) {
  const style: React.CSSProperties = {};

  if (padding !== 'none') {
    const token = `var(${SPACE_TOKEN[padding]})`;
    if (paddingTop && paddingBottom) {
      style.paddingTop = token;
      style.paddingBottom = token;
    } else if (paddingTop) {
      style.paddingTop = token;
    } else if (paddingBottom) {
      style.paddingBottom = token;
    } else {
      style.padding = token;
    }
  }

  return (
    <Tag
      style={style}
      className={cn(
        !fullWidth && 'max-w-screen-xl mx-auto w-full',
        className
      )}
    >
      {children}
    </Tag>
  );
}
