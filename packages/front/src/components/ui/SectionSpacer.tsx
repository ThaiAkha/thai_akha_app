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

