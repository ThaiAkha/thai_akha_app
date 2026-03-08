import React from 'react';
import { cn } from '../../lib/utils';

/* -------------------------------------------------------------------------- */
/* 1. CONFIGURAZIONE STILI                                                    */
/* -------------------------------------------------------------------------- */

// Stili Base: Font Display + Cinematic Ease [Source 64]
const BASE_STYLES = "inline-flex items-center justify-center gap-3 rounded-2xl font-display font-black uppercase tracking-[0.15em] transition-all duration-500 ease-cinematic active:scale-[0.96] disabled:opacity-40 disabled:pointer-events-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const BUTTON_VARIANTS = {
  // PRIMARY: High Contrast (Black/White or Dark/Light)
  primary: "bg-title text-surface hover:shadow-lg hover:-translate-y-0.5",

  // BRAND: Identity (Pink) - Main CTA [Source 114]
  brand: "bg-primary text-white shadow-brand-glow border-t border-white/20 hover:brightness-110 hover:shadow-lg",

  // ACTION: Success/Confirm (Green) [Source 114]
  action: "bg-action text-white shadow-action-glow border-t border-white/20 hover:brightness-110 hover:shadow-lg",

  // MINERAL: Glass Effect (Dark Mode Optimized)
  mineral: "bg-white/5 backdrop-blur-2xl border border-white/10 text-desc hover:bg-white/10 hover:border-white/30 hover:text-title shadow-xl shadow-black/20",

  // OUTLINE: Bordo sottile
  outline: "bg-transparent border-2 border-current text-current hover:bg-white/5 hover:text-title",

  // GHOST: Solo testo
  ghost: "bg-transparent text-desc hover:bg-white/5 hover:text-title",

  // SECONDARY: Grigio neutro
  secondary: "bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-white/20",

  // PILL: Arrotondato estremo
  pill: "bg-white/5 rounded-full border border-white/5 px-6 hover:border-white/20",

  // NAV: Base (La logica attiva è gestita nel componente)
  nav: "transition-all duration-500 rounded-xl justify-start px-4 hover:bg-white/5 hover:text-title",
};

const BUTTON_SIZES = {
  xs: "px-3 py-1 text-[9px] tracking-[0.1em]",
  sm: "px-4 py-2 text-[10px] tracking-[0.15em]",
  md: "px-6 py-3 text-xs tracking-[0.15em]",
  lg: "px-8 py-4 text-sm tracking-[0.2em]",
  xl: "px-10 py-5 text-base tracking-[0.25em]"
};

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
    ...props 
  }, ref) => {

    // Logica Navigazione separata per pulizia [Source 70]
    const getNavClasses = () => {
      if (variant !== 'nav') return "";
      
      // ACTIVE STATE: Green + Glow
      if (isActive) return "bg-action/20 text-action shadow-action-glow font-bold hover:bg-action/20";
      
      // PAST STATE: Opacity reduced
      if (isPast) return "bg-white/5 text-desc opacity-60 hover:bg-white/10";
      
      // DEFAULT NAV
      return "bg-transparent text-desc";
    };

    return (
      <button
        ref={ref}
        className={cn(
          BASE_STYLES,
          BUTTON_VARIANTS[variant],
          BUTTON_SIZES[size],
          getNavClasses(), // Applica stili dinamici Nav
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {/* Left Icon */}
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

            {/* Content */}
            {iconPosition !== 'only' && (
              <span className="relative z-10">{children}</span>
            )}

            {/* Right Icon */}
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
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;