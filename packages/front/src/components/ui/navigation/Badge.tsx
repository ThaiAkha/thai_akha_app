import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Icon } from '../Icon';
import Typography from '../Typography';

/**
 * Badge Component - System 4.8 Cinematic Edition
 * Refactored for high-end B2C experience with light-layering and micro-interactions.
 */

export interface BadgeProps {
  variant?: 'solid' | 'outline' | 'mineral' | 'mineral-accent' | 'brand' | 'allergy' | 'diet';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'action';
  children: React.ReactNode;
  className?: string;
  icon?: string;
  pulse?: boolean;
  active?: boolean;
  onClick?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'solid',
  size = 'md',
  color = 'action',
  children,
  className,
  icon,
  pulse = false,
  active = false,
  onClick,
}) => {

  const sizeStyles = {
    xs: "px-3 pt-3 pb-2.5 text-[8px] gap-2",
    sm: "px-3 pt-3 pb-2.5 text-[9px] gap-2",
    md: "px-4 pt-3 pb-2.5 text-[10px] gap-3",
    lg: "px-6 pt-3 pb-3.5 text-[11px] gap-3",
  };

  const colorStyles = {
    primary: {
      bg: "bg-gradient-to-br from-primary-700/90 via-primary-500/90 to-primary-700/90",
      text: "text-white"
    },
    secondary: {
      bg: "bg-gradient-to-br from-secondary-700/90 via-secondary-500/90 to-secondary-700/90",
      text: "text-black"
    },
    action: {
      bg: "bg-gradient-to-br from-action-700/90 via-action-500/90 to-action-700/90",
      text: "text-white"
    }
  };

  const selectedColor = colorStyles[color] || colorStyles.action;

  // Base styles con ease-cinematic per transizioni ultra-fluide
  const baseStyles = "inline-flex items-center justify-center gap-3 transition-all duration-700 select-none ease-cinematic";

  const variants = {
    // Versione Solid: Gradiente, ombra morbida e bordo di luce superiore
    'solid': cn(
      selectedColor.bg,
      selectedColor.text,
      "shadow-brand-glow",
      "border-t border-white/40 rounded-full relative overflow-hidden group",
    ),
    // Versione Brand (Cherry): Look premium con ombre pesanti per risaltare sulla Home
    'brand': cn(
      "bg-gradient-to-br from-primary-700/90 via-primary-500/90 to-primary-700/90 text-white",
      "shadow-brand-glow",
      "border-t border-white/40 rounded-full relative overflow-hidden group",
    ),

    // Versione Outline: Più sottile e trasparente per non appesantire il design
    'outline': 'bg-transparent border border-current/30 text-current rounded-full hover:bg-current/5',

    // Versione Mineral (Vetro): Riflessi dinamici e forte sfocatura sfondo per sezioni Hero
    'mineral': cn(
      "bg-white/10 backdrop-blur-xl border border-white/20 shadow-glass",
      "text-white rounded-full transition-all duration-700",
      "hover:border-white/40 hover:bg-white/20 glass-shine relative overflow-hidden group"
    ),

    // Versione Mineral Accent (Vetro): Per badge informativi con font accent (ALL CAPS spaced)
    'mineral-accent': cn(
      "bg-white/30 backdrop-blur-xl border border-action/40 shadow-glass",
      "text-white dark:text-white rounded-full transition-all duration-700",
      "hover:border-action/60 hover:bg-action/30 glass-shine relative overflow-hidden group",
      "font-black uppercase tracking-wider"
    ),

    // Versione Allergy: Feedback visivo di sicurezza migliorato con effetto Glow quando attivo
    'allergy': cn(
      "rounded-xl border transition-all duration-500",
      "items-center active:brightness-[2] active:scale-95",
      active
        ? "bg-allergy/10 dark:bg-allergy/30 border-allergy text-allergy dark:text-white shadow-glow-allergy glass-shine backdrop-blur-md"
        : "bg-allergy/10 dark:bg-allergy/15 border-allergy/40 text-allergy/90 dark:text-white/80 hover:text-allergy hover:dark:text-white hover:border-allergy hover:dark:bg-allergy/30"
    ),

    // Versione Diet: Identica ad Allergy ma con token action (verde)
    'diet': cn(
      "rounded-xl border transition-all duration-500",
      "items-center active:brightness-[2] active:scale-95",
      active
        ? "bg-action/10 dark:bg-action/30 border-action text-action dark:text-white shadow-[0_0_15px_-3px_rgba(152,201,60,0.5)] glass-shine backdrop-blur-md"
        : "bg-action/10 dark:bg-action/15 border-action/40 text-action/90 dark:text-white/80 hover:text-action hover:dark:text-white hover:border-action hover:dark:bg-action/20"
    )
  };

  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      onClick={onClick}
      className={cn(
        baseStyles,
        variants[variant],
        sizeStyles[size],
        onClick && "cursor-pointer active:scale-95 hover:-translate-y-0.5",
        className
      )}
    >
      {/* Icona Standard con scale al hover */}
      {icon && !pulse && (
        <Icon
          name={icon}
          size="sm"
          className="transition-transform duration-500 group-hover:scale-110"
        />
      )}

      {/* Cinematic Pulse: Bagliore soffuso (halo) invece di un semplice ping */}
      {pulse && (
        <span className="relative flex items-center justify-center mr-1.5">
          <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-current opacity-20"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current shadow-[0_0_10px_currentColor]"></span>
        </span>
      )}

      <Typography
        variant={variant === 'mineral-accent' ? 'accent' : 'badge'}
        color="inherit"
        className={variant === 'mineral-accent' ? "leading-none whitespace-nowrap" : "leading-none pt-0.5 whitespace-nowrap"}
      >
        {children}
      </Typography>
    </Component>
  );
};

export default Badge;