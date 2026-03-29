import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Icon } from '../Icon';

export interface BadgeProps {
  variant?: 'solid' | 'outline' | 'mineral' | 'mineral-accent' | 'brand' | 'allergy' | 'diet';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'action' | string;
  children: React.ReactNode;
  className?: string;
  icon?: string;
  pulse?: boolean;
  active?: boolean;
  onClick?: () => void;
}

// 🛡️ MAPPE AGGIUNTE SOLO PER LA VARIANTE MINERAL
const MINERAL_TEXT: Record<string, string> = {
  'primary': 'text-primary',
  'action': 'text-action',
  'quiz-p': 'text-quiz-p',
  'quiz-s': 'text-quiz-s',
  'btn-p': 'text-btn-p',
  'btn-s': 'text-btn-s',
  'secondary': 'text-secondary',
  'allergy': 'text-allergy',
};

const MINERAL_BORDER: Record<string, string> = {
  'primary': 'border-primary/40',
  'action': 'border-action/40',
  'quiz-p': 'border-quiz-p/40',
  'quiz-s': 'border-quiz-s/40',
  'btn-p': 'border-btn-p/40',
  'btn-s': 'border-btn-s/40',
  'secondary': 'border-secondary/40',
  'allergy': 'border-allergy/40',
};

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
  // Dimensioni e font originali (intatti)
  const sizeStyles = {
    xs: "px-4 pt-1 pb-0.5 text-[10px] gap-1 md:text-xs gap-1.5 font-bold uppercase tracking-wider",
    sm: "px-5 pt-2 pb-1.5 text-xs gap-2 font-bold uppercase tracking-widest",
    md: "px-6 pt-2.5 pb-2 text-sm gap-2.5 font-bold uppercase tracking-[0.2em]",
    lg: "px-7 pt-3 pb-2.5 text-base gap-3 font-bold uppercase tracking-[0.25em]",
  };

  // Mappe colori solidi originali (intatte)
  const colorStyles: Record<string, { bg: string; text: string }> = {
    primary: { bg: "bg-gradient-to-br from-primary-700/90 via-primary-500/90 to-primary-700/90", text: "text-white" },
    secondary: { bg: "bg-gradient-to-br from-secondary-700/90 via-secondary-500/90 to-secondary-700/90", text: "text-black" },
    action: { bg: "bg-gradient-to-br from-action-700/90 via-action-500/90 to-action-700/90", text: "text-white" }
  };

  const selectedColor = colorStyles[color as string] || colorStyles.action;

  // Stili base originali (intatti)
  const baseStyles = "inline-flex items-center justify-center gap-3 transition-all duration-700 select-none ease-cinematic";

  // Estrazione classi per la variante Mineral
  const mineralTextClass = MINERAL_TEXT[color as string] || 'text-action';
  const mineralBorderClass = MINERAL_BORDER[color as string] || 'border-action/40';

  const variants: Record<string, string> = {
    'solid': cn(
      selectedColor.bg, selectedColor.text,
      "shadow-brand-glow",
      "border-t border-white/40 rounded-full relative overflow-hidden group",
    ),
    'brand': cn(
      "bg-gradient-to-br from-primary-700/90 via-primary-500/90 to-primary-700/90 text-white",
      "shadow-brand-glow",
      "border-t border-white/40 rounded-full relative overflow-hidden group",
    ),
    // ✨ VARIANTE MINERAL CON EFFETTO VETRO RIPRISTINATO
    'mineral': cn(
      "rounded-full border-2 shadow-sm",
      "backdrop-blur-md bg-white/60 dark:bg-black/30", // Forza il vero Glassmorphism bypassando i Token di sistema
      mineralBorderClass,
      mineralTextClass
    ),
  };

  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      onClick={onClick}
      className={cn(
        baseStyles,
        variants[variant] || variants.solid,
        sizeStyles[size],
        onClick && "cursor-pointer active:scale-95 hover:-translate-y-0.5",
        className
      )}
    >
      {icon && !pulse && (
        <Icon
          name={icon}
          size="sm"
          className="transition-transform duration-500 group-hover:scale-110"
        />
      )}
      {children}
    </Component>
  );
};

export default Badge;
