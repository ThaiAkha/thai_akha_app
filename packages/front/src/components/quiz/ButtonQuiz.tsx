import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Icon, Typography } from '../ui';

export interface QuizButtonConfig {
  label: string;
  icon: string;
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
}

interface ButtonQuizProps {
  config: QuizButtonConfig;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

interface FlashPoint { id: number; x: number; y: number; }

const NO_FLASH_VARIANTS = new Set(['ghost', 'outline']);

const ButtonQuiz: React.FC<ButtonQuizProps> = ({ config, onClick, disabled, className = "", fullWidth = false }) => {

  const baseStyles = cn(
    "relative overflow-hidden isolate flex items-center justify-center transition-all duration-300",
    "active:scale-[0.97] disabled:opacity-30 disabled:pointer-events-none select-none",
    "rounded-full border antialiased",
    "[padding-inline:var(--space-fluid-m)] [padding-block:var(--space-fluid-s)]",
    "[gap:var(--space-fluid-2xs)]"
  );

  const variants = {
    primary: "bg-surface text-title border-border hover:bg-quiz hover:text-color-inverse hover:border-quiz hover:scale-105 shadow-theme-lg hover:shadow-brand-glow/30",
    secondary: "bg-white/5 text-color-inverse border-white/10 hover:bg-white/10 hover:border-white/20",
    outline: "bg-transparent text-color-inverse border-white/20 hover:border-white",
    ghost: "bg-transparent text-muted hover:text-color-inverse hover:bg-white/5 border-transparent",
  };

  const [flashes, setFlashes] = useState<FlashPoint[]>([]);
  const flashIdRef = useRef(0);
  const isFlashEnabled = !NO_FLASH_VARIANTS.has(config.variant) && !disabled;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (isFlashEnabled) {
      const rect = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty('--flash-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
      e.currentTarget.style.setProperty('--flash-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
    }
  }, [isFlashEnabled]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (isFlashEnabled) {
      const rect = e.currentTarget.getBoundingClientRect();
      const id = ++flashIdRef.current;
      setFlashes(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
      setTimeout(() => setFlashes(prev => prev.filter(f => f.id !== id)), 600);
    }
    onClick?.();
  }, [isFlashEnabled, onClick]);

  return (
    <button
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      disabled={disabled}
      className={cn(baseStyles, variants[config.variant], fullWidth && 'w-full', className)}
    >
      {isFlashEnabled && <span className="btn-flash-glow" aria-hidden="true" />}
      {flashes.map(f => (
        <span
          key={f.id}
          className="btn-flash-ripple"
          style={{ top: f.y, left: f.x } as React.CSSProperties}
          aria-hidden="true"
        />
      ))}

      <span className="relative z-10 inline-flex items-center [gap:var(--space-fluid-xs)]">
        <Icon name={config.icon} className="[font-size:1.25em]" />
        <Typography 
          variant="badge" 
          as="span" 
          className="font-black uppercase tracking-widest [font-size:var(--text-fluid-caption)]"
        >
          {config.label}
        </Typography>
      </span>
    </button>
  );
};

export default ButtonQuiz;
