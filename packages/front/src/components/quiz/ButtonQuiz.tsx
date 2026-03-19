import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Icon } from '../ui';

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

  const baseStyles = "relative overflow-hidden isolate flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold uppercase tracking-wider text-xs transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-white text-black hover:bg-quiz hover:scale-105 shadow-lg shadow-white/10",
    secondary: "bg-white/10 text-white border border-white/10 hover:bg-white/20",
    outline: "bg-transparent text-white border border-white/20 hover:border-white hover:text-white",
    ghost: "bg-transparent text-white/40 hover:text-white hover:bg-white/5",
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

      <span className="relative z-10 inline-flex items-center gap-2">
        <Icon name={config.icon} className="text-lg" />
        {config.label}
      </span>
    </button>
  );
};

export default ButtonQuiz;
