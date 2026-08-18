import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Icon } from '../Icon';

export interface BadgeProps {
  variant?: 'solid' | 'outline' | 'mineral' | 'mineral-accent' | 'brand' | 'allergy' | 'diet';
  size?: 'xs' | 'sm' | 'md';
  color?: 'primary' | 'secondary' | 'action' | string;
  children: React.ReactNode;
  className?: string;
  icon?: string;
  pulse?: boolean;
  active?: boolean;
  style?: React.CSSProperties;
}

// 🛡️ MAPPE AGGIUNTE SOLO PER LA VARIANTE MINERAL
const MINERAL_TEXT: Record<string, string> = {
  'primary': 'text-primary-400',
  'action': 'text-action-700',
  'quiz-p': 'text-quiz-p-400',
  'quiz-s': 'text-quiz-s-400',
  'btn-p': 'text-btn-p',
  'btn-s': 'text-btn-s',
  'secondary': 'text-secondary',
  'allergy': 'text-allergy',
};

const MINERAL_BORDER: Record<string, string> = {
  'primary': 'border-primary-400/80',
  'action': 'border-action-700/80',
  'quiz-p': 'border-quiz-p-400/80',
  'quiz-s': 'border-quiz-s-400/80',
  'btn-p': 'border-btn-p/80',
  'btn-s': 'border-btn-s/80',
  'secondary': 'border-secondary/90',
  'allergy': 'border-allergy/80',
};

const Badge: React.FC<BadgeProps> = ({
  variant = 'solid',
  size = 'md',
  color = 'action',
  children,
  className,
  icon,
  pulse = false,
  style,
}) => {
  // Dimensioni fluid — token clamp da tokens.css :root (NO text-* Tailwind)
  const sizeStyles = {
    xs: "[font-size:var(--text-fluid-micro)] [padding-inline:var(--space-fluid-m)] [padding-block:var(--space-fluid-2xs)] [gap:var(--space-fluid-2xs)] font-bold uppercase tracking-wider",
    sm: "[font-size:var(--text-fluid-caption)] [padding-inline:var(--space-fluid-m)] [padding-block:var(--space-fluid-2xs)] [gap:var(--space-fluid-xs)] font-bold uppercase tracking-widest",
    md: "[font-size:var(--text-fluid-caption)] md:[font-size:var(--text-fluid-accent)] [padding-inline:var(--space-fluid-m)] md:[padding-inline:var(--space-fluid-l)] [padding-block:var(--space-fluid-2xs)] [gap:var(--space-fluid-xs)] md:[gap:var(--space-fluid-s)] font-bold uppercase tracking-widest",
  };

  // Mappe colori solidi originali (intatte)
  const colorStyles: Record<string, { bg: string; text: string }> = {
    primary: { bg: "bg-gradient-to-br from-primary-700/90 via-primary-500/90 to-primary-700/90", text: "text-white" },
    secondary: { bg: "bg-gradient-to-br from-secondary-700/90 via-secondary-500/90 to-secondary-700/90", text: "text-white" },
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
      "border-t border-white/40 rounded-full relative overflow-hidden group",
    ),
    'brand': cn(
      "bg-gradient-to-br from-primary-700/90 via-primary-500/90 to-primary-700/90 text-white",
      "border-t border-white/40 rounded-full relative overflow-hidden group",
    ),
    // ✨ VARIANTE MINERAL CON EFFETTO VETRO RIPRISTINATO
    'mineral': cn(
      "rounded-full border-1",
      "backdrop-blur-md bg-white/80 dark:bg-black/80", // Forza il vero Glassmorphism bypassando i Token di sistema
      mineralBorderClass,
      mineralTextClass
    ),
  };

  return (
    <span
      className={cn(
        baseStyles,
        variants[variant] || variants.solid,
        sizeStyles[size],
        className
      )}
      style={style}
    >
      {icon && !pulse && (
        <Icon
          name={icon}
          size="sm"
          className="transition-transform duration-500 group-hover:scale-110"
        />
      )}
      <span className="inline-block mr-[-0.2em]">
        {children}
      </span>
    </span>
  );
};

export default Badge;
