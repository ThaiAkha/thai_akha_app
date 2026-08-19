import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

/* -------------------------------------------------------------------------- */
/* 1. CONFIGURAZIONE STILI                                                    */
/* -------------------------------------------------------------------------- */

// relative + overflow-hidden + isolate are required for the flash effect
// pointer-coarse:min-h-11 = 44px di altezza minima sui dispositivi touch (Apple HIG / WCAG 2.5.8),
// qualunque sia la size: su mouse le size restano quelle di sempre.
const BASE_STYLES = "relative overflow-hidden isolate inline-flex items-center justify-center pointer-coarse:min-h-11 rounded-[var(--radius-button)] font-display font-black uppercase tracking-[0.15em] transition-all duration-500 ease-cinematic cursor-pointer active:scale-[0.96] disabled:opacity-40 disabled:pointer-events-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const BUTTON_VARIANTS = {
  // PRIMARY: High Contrast (Black/White or Dark/Light)
  primary: "bg-quiz-p text-white border-t border-white/40 hover:brightness-110 shadow-md active:shadow-inner",

  // BRAND: Identity (Pink) - Main CTA [Source 114]
  brand: "bg-primary text-white border-t border-white/40 hover:brightness-110 shadow-md active:shadow-inner",

  // ACTION: Success/Confirm (Green) [Source 114]
  action: "bg-action text-white border-t border-white/40 hover:brightness-110 shadow-md active:shadow-inner",

  // MINERAL: Glass Effect (Dark Mode Optimized)
  mineral: "bg-white/10 backdrop-blur-2xl border-t border-white/20 text-sub hover:brightness-110 hover:bg-white/10 hover:border-white/30 hover:text-title shadow-action-glow",

  // OUTLINE: Bordo sottile
  outline: "bg-transparent border-2 border-current text-current hover:bg-white/5 hover:text-title",

  // GHOST: Solo testo
  ghost: "bg-transparent text-sub hover:bg-white/5 hover:text-title",

  // NAV: Base (La logica attiva è gestita nel componente)
  nav: "transition-all duration-500 rounded-xl justify-start [padding-inline:var(--space-fluid-m)] hover:bg-white/5 hover:text-title",

  // SOCIAL: Blue Glass (English "Share")
  social: "bg-btn-s/15 border-2 border-btn-s/30 text-btn-s hover:bg-btn-s/25 hover:border-btn-s/50 shadow-glow-blue",

  // QUIZ-S: Purple (Identity)
  'quiz-s': "bg-quiz-s text-white border-t border-white/40 hover:brightness-110 shadow-md active:shadow-inner",

  // QUIZ-S GLASS: Purple Glass (English "Share")
  'quiz-s-glass': "bg-quiz-s/15 border-2 border-quiz-s/30 text-quiz-s hover:bg-quiz-s/25 hover:border-quiz-s/50 shadow-glow-quiz-s",

  // BTN-S: Solid Blue (Normal Standard + Electric Glow)
  'btn-s': "bg-btn-s text-white border-t border-white/40 hover:brightness-110 shadow-md shadow-glow-blue active:shadow-inner",

  // ALLERGY: High Alert (Orange-Red)
  allergy: "bg-allergy text-white border-t border-white/40 hover:brightness-110 shadow-md active:shadow-inner",

  // QUIZ-P: Magenta (Identity)
  'quiz-p': "bg-quiz-p text-white border-t border-white/40 hover:brightness-110 shadow-md active:shadow-inner",
};

const BUTTON_SIZES = {
  xs: "[padding-inline:var(--space-fluid-xs)] [padding-block:var(--space-fluid-2xs)] [gap:var(--space-fluid-2xs)] [font-size:var(--text-fluid-micro)] tracking-[0.1em]",
  sm: "[padding-inline:var(--space-fluid-m)] [padding-block:var(--space-fluid-xs)] [gap:var(--space-fluid-xs)] [font-size:var(--text-fluid-micro)] tracking-[0.15em]",
  md: "[padding-inline:var(--space-fluid-l)] [padding-block:var(--space-fluid-s)] [gap:var(--space-fluid-xs)] [font-size:var(--text-fluid-caption)] tracking-[0.15em]",
  lg: "[padding-inline:var(--space-fluid-xl)] [padding-block:var(--space-fluid-m)] [gap:var(--space-fluid-s)] [font-size:var(--text-fluid-paragraphS)] tracking-[0.2em]"
};


/* -------------------------------------------------------------------------- */
/* 2. TIPI & PROPS                                                            */
/* -------------------------------------------------------------------------- */

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;
export type ButtonSize = keyof typeof BUTTON_SIZES;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isActive?: boolean;
  isPast?: boolean; // Utile per Cooking Classes
  isLoading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right' | 'only';
  iconFilled?: boolean;
  iconColor?: string;
  iconSize?: string;
  as?: React.ElementType; // <-- AGGIUNTA per polimorfismo
  href?: string; // Supporto a link semantico in as='a'
  target?: string;
  rel?: string;
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
    as: Component = 'button',
    target,
    rel,
    href,
    ...props
  }, ref) => {

    const [flashes, setFlashes] = useState<FlashPoint[]>([]);
    const flashIdRef = useRef(0);
    const isFlashEnabled = !disabled && !isLoading;

    // Track mouse for hover glow
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (isFlashEnabled) {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--flash-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
        e.currentTarget.style.setProperty('--flash-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
      }
      onMouseMove?.(e);
    }, [isFlashEnabled, onMouseMove]);

    // Spawn ripple at mouse down for instant feedback (even with Cmd/Ctrl)
    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
      if (isFlashEnabled) {
        const rect = e.currentTarget.getBoundingClientRect();
        const id = ++flashIdRef.current;
        setFlashes(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
        setTimeout(() => setFlashes(prev => prev.filter(f => f.id !== id)), 600);
      }
    }, [isFlashEnabled]);

    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
      // If Cmd/Ctrl is pressed and we have an href, the browser will open the link in a new tab.
      // We return here to avoid calling onClick (which might trigger an SPA navigation in the same tab).
      if ((e.metaKey || e.ctrlKey) && href) {
        return;
      }
      
      // Regular click behavior
      onClick?.(e as React.MouseEvent<HTMLButtonElement>);
    }, [onClick, href]);
    // Logica Navigazione separata per pulizia
    const getNavClasses = () => {
      if (variant !== 'nav') return "";
      if (isActive) return "bg-action/20 text-action shadow-action-glow font-bold hover:bg-action/20";
      if (isPast) return "bg-white/5 text-sub opacity-60 hover:bg-white/10";
      return "bg-transparent text-sub";
    };

    return (
      <Component
        ref={ref}
        disabled={disabled}
        className={cn(
          BASE_STYLES,
          BUTTON_VARIANTS[variant],
          BUTTON_SIZES[size],
          getNavClasses(),
          "brand-btn-animation",
          fullWidth && "w-full",
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        href={href}
        target={target}
        rel={rel}
        style={{
          ...props.style as React.CSSProperties,
          ...((variant === 'social' || variant === 'btn-s') ? {
            '--btn-flash-ripple-color': 'rgb(28, 163, 230)',
            '--btn-flash-ripple-soft': 'rgba(28, 163, 230, 0.6)',
          } : (variant === 'quiz-s' || variant === 'quiz-s-glass') ? {
            '--btn-flash-ripple-color': 'rgb(var(--quiz-s-ch))',
            '--btn-flash-ripple-soft': 'rgba(var(--quiz-s-ch) / 0.6)',
          } : variant === 'quiz-p' ? {
            '--btn-flash-ripple-color': 'rgb(var(--quiz-p-ch))',
            '--btn-flash-ripple-soft': 'rgba(var(--quiz-p-ch) / 0.6)',
          } : variant === 'allergy' ? {
            '--btn-flash-ripple-color': 'rgb(var(--allergy-ch))',
            '--btn-flash-ripple-soft': 'rgba(var(--allergy-ch) / 0.6)',
          } : {})
        } as React.CSSProperties}
        {...props}
      >
        {/* Hover glow (follows mouse via CSS vars) */}
        {/* Standard Luminous Effects */}
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
        <span className="relative z-10 inline-flex items-center justify-center [gap:inherit]">
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
      </Component>
    );
  }
);

Button.displayName = 'Button';
export default Button;
