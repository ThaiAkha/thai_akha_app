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
    "px-4 py-2",
    "[gap:var(--space-fluid-2xs)]"
  );

  const variants = {
    primary: "bg-primary text-white border-primary/50 hover:bg-primary/80 hover:scale-105 shadow-glow-cherry hover:shadow-glow-cherry-h",
    secondary: "bg-white/5 text-white border-white/20 hover:bg-white/10 hover:border-white/40",
    outline: "bg-transparent text-white border-white/30 hover:border-white hover:bg-white/5",
    ghost: "bg-transparent text-muted hover:text-white hover:bg-white/5 border-transparent",
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

      <span className="relative z-10 inline-flex items-center gap-1.5">
        <Icon name={config.icon} size="sm" />
        <Typography
          variant="microLabel"
          as="span"
          className="font-black uppercase tracking-widest"
        >
          {config.label}
        </Typography>
      </span>
    </button>
  );
};

export default ButtonQuiz;
