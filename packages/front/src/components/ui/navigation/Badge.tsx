import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Icon } from '../Icon';

/**
 * Badge Component - System 4.8 Cinematic Edition
 * Refactored for high-end B2C experience with light-layering and micro-interactions.
 */

export interface BadgeProps {
  variant?: 'solid' | 'outline' | 'mineral' | 'brand' | 'allergy';
  children: React.ReactNode;
  className?: string;
  icon?: string;
  pulse?: boolean;
  active?: boolean;
  onClick?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'solid',
  children,
  className,
  icon,
  pulse = false,
  active = false,
  onClick,
}) => {

  // Base styles con ease-cinematic per transizioni ultra-fluide
  const baseStyles = "inline-flex items-center justify-center gap-2 transition-all duration-700 select-none ease-cinematic";

  const variants = {
    // Versione Action (Lime): Gradiente, ombra morbida e bordo di luce superiore
    solid: cn(
      "bg-gradient-to-br from-action to-action-700 text-white",
      "shadow-[0_8px_20px_-6px_rgba(152,201,60,0.5)]",
      "border-t border-white/30 px-6 pt-3 pb-3.5 rounded-full",
      "text-sm font-accent font-black uppercase tracking-[0.2em] relative overflow-hidden group"
    ),

    // Versione Brand (Cherry): Look premium con ombre pesanti per risaltare sulla Home
    brand: cn(
      "bg-gradient-to-br from-primary to-secondary text-white",
      "shadow-brand-glow border-t border-white/50 px-6 pt-3 pb-3.5 rounded-full",
      "text-sm font-accent font-black uppercase tracking-[0.2em] relative overflow-hidden group"
    ),

    // Versione Outline: Più sottile e trasparente per non appesantire il design
    outline: 'bg-transparent border border-current/30 text-current px-4 py-1 rounded-full text-[10px] font-accent font-black uppercase tracking-[0.15em] hover:bg-current/5',

    // Versione Mineral (Vetro): Riflessi dinamici e forte sfocatura sfondo per sezioni Hero
    mineral: cn(
      "bg-white/10 backdrop-blur-xl border border-white/20 shadow-glass",
      "text-white px-6 pt-3 pb-3.5 rounded-full transition-all duration-700",
      "hover:border-white/40 hover:bg-white/20 glass-shine",
      "text-sm font-accent font-black uppercase tracking-[0.2em] relative overflow-hidden group"
    ),

    // Versione Allergy: Feedback visivo di sicurezza migliorato con effetto Glow quando attivo
    allergy: cn(
      "px-3 py-2 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest border transition-all duration-500",
      active
        ? "bg-allergy/30 border-allergy text-white shadow-glow-allergy glass-shine backdrop-blur-md"
        : "bg-allergy/15 border-allergy/20 text-white/60 hover:text-white/80 hover:border-allergy/40 hover:bg-allergy/20"
    )
  };

  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      onClick={onClick}
      className={cn(
        baseStyles,
        variants[variant],
        onClick && "cursor-pointer active:scale-95 hover:-translate-y-0.5",
        className
      )}
    >
      {/* Icona Standard con scale al hover */}
      {icon && !pulse && (
        <Icon
          name={icon}
          size="xs"
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

      <span className="leading-none">{children}</span>
    </Component>
  );
};

export default Badge;