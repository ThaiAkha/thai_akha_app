import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

/* -------------------------------------------------------------------------- */
/* 1. CONFIGURAZIONE STILI                                                    */
/* -------------------------------------------------------------------------- */

// relative + overflow-hidden + isolate are required for the flash effect
const BASE_STYLES = "relative overflow-hidden isolate inline-flex items-center justify-center [gap:var(--space-fluid-s)] rounded-3xl font-display font-black uppercase tracking-[0.15em] transition-all duration-500 ease-cinematic cursor-pointer active:scale-[0.96] disabled:opacity-40 disabled:pointer-events-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const BUTTON_VARIANTS = {
  // PRIMARY: High Contrast (Black/White or Dark/Light)
  primary: "bg-quiz-p text-white border-t border-white/40 hover:brightness-110",

  // BRAND: Identity (Pink) - Main CTA [Source 114]
  brand: "bg-primary text-white border-t border-white/40 hover:brightness-110",

  // ACTION: Success/Confirm (Green) [Source 114]
  action: "bg-action text-white border-t border-white/40 hover:brightness-110",

  // MINERAL: Glass Effect (Dark Mode Optimized)
  mineral: "bg-white/10 backdrop-blur-2xl border-t border-white/20 text-sub hover:brightness-110 hover:bg-white/10 hover:border-white/30 hover:text-title shadow-action-glow",

  // OUTLINE: Bordo sottile
  outline: "bg-transparent border-2 border-current text-current hover:bg-white/5 hover:text-title",

  // GHOST: Solo testo
  ghost: "bg-transparent text-sub hover:bg-white/5 hover:text-title",

  // NAV: Base (La logica attiva è gestita nel componente)
  nav: "transition-all duration-500 rounded-xl justify-start [padding-inline:var(--space-fluid-m)] hover:bg-white/5 hover:text-title",

  // SOCIAL: Blue Glass (English "Share")
  social: "bg-btn-s/10 border-2 border-btn-s/20 text-btn-s hover:bg-btn-s/20 hover:border-btn-s/40 shadow-glow-blue",
};

const BUTTON_SIZES = {
  xs: "[padding-inline:var(--space-fluid-s)] [padding-block:var(--space-fluid-2xs)] [font-size:var(--text-fluid-micro)] tracking-[0.1em]",
  sm: "[padding-inline:var(--space-fluid-m)] [padding-block:var(--space-fluid-xs)] [font-size:var(--text-fluid-micro)] tracking-[0.15em]",
  md: "[padding-inline:var(--space-fluid-l)] [padding-block:var(--space-fluid-s)] [font-size:var(--text-fluid-caption)] tracking-[0.15em]",
  lg: "[padding-inline:var(--space-fluid-xl)] [padding-block:var(--space-fluid-m)] [font-size:var(--text-fluid-paragraphS)] tracking-[0.2em]"
};

// Variants where flash is disabled (no solid background or interactive nav)
const NO_FLASH_VARIANTS = new Set(['ghost', 'nav']);

/* -------------------------------------------------------------------------- */
/* 2. TIPI & PROPS                                                            */
/* -------------------------------------------------------------------------- */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: keyof typeof BUTTON_SIZES;
  fullWidth?: boolean;
  isActive?: boolean;
  isPast?: boolean; // Utile per Cooking Classes
  isLoading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right' | 'only';
  iconFilled?: boolean;
  iconColor?: string;
  iconSize?: string;
}

/* -------------------------------------------------------------------------- */
/* 3. COMPONENTE                                                              */
/* -------------------------------------------------------------------------- */

interface FlashPoint { id: number; x: number; y: number; }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    fullWidth,
    isActive,
    isPast,
    isLoading,
    icon,
    iconPosition = 'left',
    iconFilled,
    iconColor,
    iconSize,
    children,
    onClick,
    onMouseMove,
    disabled,
    ...props
  }, ref) => {

    const [flashes, setFlashes] = useState<FlashPoint[]>([]);
    const flashIdRef = useRef(0);
    const isFlashEnabled = !NO_FLASH_VARIANTS.has(variant) && !disabled && !isLoading;

    // Track mouse for hover glow
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (isFlashEnabled) {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--flash-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
        e.currentTarget.style.setProperty('--flash-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
      }
      onMouseMove?.(e);
    }, [isFlashEnabled, onMouseMove]);

    // Spawn ripple at click coordinates
    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (isFlashEnabled) {
        const rect = e.currentTarget.getBoundingClientRect();
        const id = ++flashIdRef.current;
        setFlashes(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
        setTimeout(() => setFlashes(prev => prev.filter(f => f.id !== id)), 600);
      }
      onClick?.(e);
    }, [isFlashEnabled, onClick]);

    // Logica Navigazione separata per pulizia
    const getNavClasses = () => {
      if (variant !== 'nav') return "";
      if (isActive) return "bg-action/20 text-action shadow-action-glow font-bold hover:bg-action/20";
      if (isPast) return "bg-white/5 text-sub opacity-60 hover:bg-white/10";
      return "bg-transparent text-sub";
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          BASE_STYLES,
          BUTTON_VARIANTS[variant],
          BUTTON_SIZES[size],
          getNavClasses(),
          fullWidth && "w-full",
          className
        )}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        style={{
          ...props.style as React.CSSProperties,
          ...(variant === 'social' ? {
            '--btn-flash-glow-color': 'rgba(28, 163, 230, 0.4)',
            '--btn-flash-ripple-color': 'var(--color-btn-s-300)',
            '--btn-flash-ripple-soft': 'rgba(28, 163, 230, 0.6)',
          } : {})
        } as React.CSSProperties}
        {...props}
      >
        {/* Hover glow (follows mouse via CSS vars) */}
        {isFlashEnabled && <span className="btn-flash-glow" aria-hidden="true" />}

        {/* Click ripples */}
        {flashes.map(f => (
          <span
            key={f.id}
            className="btn-flash-ripple"
            style={{ top: f.y, left: f.x } as React.CSSProperties}
            aria-hidden="true"
          />
        ))}

        {/* Content — always above flash (z-10) */}
        <span className="relative z-10 inline-flex items-center justify-center [gap:var(--space-fluid-s)]">
          {isLoading ? (
            <span className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {icon && (iconPosition === 'left' || iconPosition === 'only') && (
                <span
                  className="material-symbols-outlined transition-transform duration-500"
                  style={{
                    fontVariationSettings: iconFilled ? "'FILL' 1" : "'FILL' 0",
                    fontSize: iconSize || '1.4em',
                    color: iconColor
                  }}
                >
                  {icon}
                </span>
              )}

              {iconPosition !== 'only' && (variant === 'social' && !children ? 'Share' : children)}

              {icon && iconPosition === 'right' && (
                <span
                  className="material-symbols-outlined transition-transform duration-500 group-hover:translate-x-1"
                  style={{
                    fontVariationSettings: iconFilled ? "'FILL' 1" : "'FILL' 0",
                    fontSize: iconSize || '1.4em',
                    color: iconColor
                  }}
                >
                  {icon}
                </span>
              )}
            </>
          )}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
