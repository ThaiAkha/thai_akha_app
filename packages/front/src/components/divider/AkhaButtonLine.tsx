import React from 'react';
import AkhaPixelPattern, { type AkhaPixelSize } from './AkhaPixelPattern';
import Button, { ButtonVariant } from '../ui/navigation/Button';
import { cn } from '@thaiakha/shared/lib/utils';

import { AkhaTheme } from './AkhaPixelPattern';
import { PatternName } from '@thaiakha/shared';

// ─── Props ───────────────────────────────────────────────────────────────────

interface AkhaButtonLineProps {
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  /** When provided, renders as <a> — Cmd+click opens in new tab natively */
  href?: string;
  icon?: string;
  iconPosition?: 'left' | 'right' | 'only';
  className?: string;
  theme?: AkhaTheme;
  variant?: PatternName;
  size?: AkhaPixelSize;
  animate?: boolean;
  buttonVariant?: ButtonVariant;
  buttonSize?: 'xs' | 'sm' | 'md' | 'lg';
}

// ─── Component ───────────────────────────────────────────────────────────────

const AkhaButtonLine: React.FC<AkhaButtonLineProps> = ({
  label,
  onClick,
  href,
  icon = 'arrow_forward',
  iconPosition = 'right',
  className,
  theme = 'kitchen',
  variant = 'line_simple_medium',
  size = 10,
  animate = true,
  buttonVariant = 'btn-s',
  buttonSize = 'md',
}) => {

  return (
    <div className={cn(
      'flex justify-center items-center [gap:var(--space-fluid-l)] [padding-block:var(--space-fluid-m)] overflow-hidden w-full',
      className
    )}>
      {/* Left line (mirrored) — shrinks and clips before button does */}
      <div className="flex-1 flex justify-end overflow-hidden min-w-0 opacity-80">
        <AkhaPixelPattern
          variant={variant}
          size={size}
          theme={theme}
          expandFromCenter
          animateInView={animate}
          className="scale-x-[-1] shrink-0"
        />
      </div>

      <div className="shrink-0">
        <Button
          variant={buttonVariant}
          size={buttonSize}
          icon={icon}
          iconPosition={iconPosition}
          as={href ? 'a' : 'button'}
          href={href}
          onClick={onClick}
        >
          {label}
        </Button>
      </div>

      {/* Right line — shrinks and clips before button does */}
      <div className="flex-1 overflow-hidden min-w-0 opacity-80">
        <AkhaPixelPattern
          variant={variant}
          size={size}
          theme={theme}
          expandFromCenter
          animateInView={animate}
          className="shrink-0"
        />
      </div>
    </div>
  );
};

export default AkhaButtonLine;
