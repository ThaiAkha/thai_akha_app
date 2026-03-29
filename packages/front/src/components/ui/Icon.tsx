import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { getIcon, type IconName } from '@thaiakha/shared/lib/icons';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type IconVariant = 'default' | 'soft' | 'solid' | 'outline';
export type IconColor = 'default' | 'primary' | 'action' | 'allergy' | 'muted' | 'sub' | 'inverse';

export interface IconProps {
  name: string | IconName;
  size?: IconSize;
  variant?: IconVariant;
  color?: IconColor;
  className?: string;
  strokeWidth?: number;
}

// Mappatura precisa per icona e padding del box (quando c'è un background)
const SIZE_MAP: Record<IconSize, { icon: string; box: string; text: string }> = {
  xs: { icon: 'size-3.5', box: 'p-1', text: 'text-[10px]' },
  sm: { icon: 'size-4', box: 'p-1.5', text: 'text-xs' },
  md: { icon: 'size-5', box: 'p-2', text: 'text-base' },
  lg: { icon: 'size-6', box: 'p-2.5', text: 'text-xl' },
  xl: { icon: 'size-8', box: 'p-3', text: 'text-2xl' },
  '2xl': { icon: 'size-10', box: 'p-4', text: 'text-4xl' },
};

// Mappatura dei token semantici v4 e degli stati di hover
const STYLE_MAP: Record<IconVariant, Record<IconColor, string>> = {
  default: {
    default: 'text-desc hover:text-title',
    primary: 'text-primary-500 dark:text-primary-400',
    action: 'text-action hover:brightness-110',
    allergy: 'text-allergy',
    muted: 'text-muted hover:text-sub',
    sub: 'text-sub hover:text-title',
    inverse: 'text-inverse',
  },
  soft: {
    default: 'bg-surface-2 text-desc hover:bg-border',
    primary: 'bg-primary/10 text-primary-500 dark:text-primary-400 hover:bg-primary/20',
    action: 'bg-action/10 text-action hover:bg-action/20',
    allergy: 'bg-allergy/10 text-allergy hover:bg-allergy/20',
    muted: 'bg-surface-2 text-muted hover:text-sub',
    sub: 'bg-surface-2 text-sub hover:bg-border',
    inverse: 'bg-white/10 text-inverse hover:bg-white/20',
  },
  solid: {
    default: 'bg-desc text-inverse hover:opacity-90',
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    action: 'bg-action text-white hover:brightness-110',
    allergy: 'bg-allergy text-white hover:opacity-90',
    muted: 'bg-muted text-inverse hover:opacity-90',
    sub: 'bg-sub text-inverse hover:opacity-90',
    inverse: 'bg-inverse text-title hover:opacity-90',
  },
  outline: {
    default: 'border border-border text-desc hover:bg-surface-2',
    primary: 'border border-primary-500/30 text-primary-500 dark:text-primary-400 hover:bg-primary/10',
    action: 'border border-action/30 text-action hover:bg-action/10',
    allergy: 'border border-allergy/30 text-allergy hover:bg-allergy/10',
    muted: 'border border-border-2 text-muted hover:text-sub',
    sub: 'border border-border-2 text-sub hover:bg-surface-2',
    inverse: 'border border-white/20 text-inverse hover:bg-white/10',
  }
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  variant = 'default',
  color = 'default',
  className,
  strokeWidth = 2
}) => {
  const isEmoji = name && /\p{Extended_Pictographic}/u.test(name as string);

  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;
  const variantColorClass = STYLE_MAP[variant][color] || STYLE_MAP.default.default;
  const isBgVariant = variant !== 'default';

  // Base layout per l'involucro dell'icona
  const baseLayout = cn(
    "inline-flex items-center justify-center shrink-0 transition-colors duration-200",
    isBgVariant && "rounded-lg", // Aggiunge arrotondamento se c'è uno sfondo/bordo
    isBgVariant && sizeConfig.box // Applica il padding solo se è una variante con box
  );

  // Render per Emoji
  if (isEmoji) {
    return (
      <span
        className={cn(baseLayout, variantColorClass, sizeConfig.text, className)}
        role="img"
        aria-label="icon"
      >
        {name}
      </span>
    );
  }

  // Render per Icona Lucide/Material
  const IconComponent = getIcon(name as IconName);

  return (
    <span className={cn(baseLayout, variantColorClass, className)}>
      <IconComponent
        className={cn(sizeConfig.icon)}
        strokeWidth={strokeWidth}
      />
    </span>
  );
};

export default Icon;
