/**
 * 🎨 UNIVERSAL ICON COMPONENT - Smart Two-Mode System
 *
 * Render Lucide icons by name (string) in two modes:
 * 1. RAW MODE: Bare SVG icon (default) - for inline use
 * 2. STYLED MODE: Icon in styled container - for buttons/cards
 *
 * Compatible with database-driven UIs, dynamic menus, hardcoded components
 *
 * @example
 * // Raw mode (bare SVG)
 * <Icon name="Package" size={24} className="text-brand-500" />
 *
 * // Styled mode (with background + effects)
 * <Icon name="Home" variant="compact" />
 * <Icon name="Package" variant="regular" />
 * <Icon name="Settings" variant="large" />
 *
 * // With fallback
 * <Icon name={metadata?.icon} fallback="AlertCircle" />
 */

import React from 'react';
import { getIcon, type IconName } from '../../lib/iconRegistry';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';

// ============================================================================
// VARIANT STYLES (for styled mode)
// ============================================================================

const VARIANTS: Record<string, { container: string; icon: string }> = {
  compact: {
    container: 'w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white',
    icon: 'w-5 h-5'
  },
  regular: {
    container: 'w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white',
    icon: 'w-6 h-6'
  },
  large: {
    container: 'w-16 h-16 rounded-3xl bg-brand-50 dark:bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white',
    icon: 'w-8 h-8'
  }
};

// ============================================================================
// MAIN ICON COMPONENT
// ============================================================================

export interface IconProps {
  /** Icon name as string (e.g., "Home", "Package") */
  name: string | IconName | undefined | null;

  /**
   * Rendering mode
   * - undefined/null: RAW mode (bare SVG)
   * - 'compact'|'regular'|'large': STYLED mode (in container)
   */
  variant?: 'compact' | 'regular' | 'large';

  /** Size shorthand for RAW mode (pixels) - e.g., 24 or "24px" */
  size?: number | string;

  /** Fallback icon name if main icon not found (default: AlertCircle) */
  fallback?: IconName;

  /** Custom className (RAW: applied to SVG | STYLED: applied to container) */
  className?: string;

  /** Custom className for icon SVG in STYLED mode */
  iconClassName?: string;

  /** Stroke width (default: 2) */
  strokeWidth?: number;

  /** Additional SVG props */
  [key: string]: any;
}

const Icon: React.FC<IconProps> = ({
  name,
  variant,
  size,
  fallback = 'AlertCircle',
  className,
  iconClassName,
  strokeWidth = 2,
  ...svgProps
}) => {
  // Get icon component from registry
  const IconComponent = getIcon(name, getIcon(fallback));

  if (!IconComponent) return null;

  // ===== STYLED MODE: Icon in container with variant styles =====
  if (variant) {
    const variantClasses = VARIANTS[variant] || VARIANTS.compact;
    return (
      <div className={cn(variantClasses.container, className)}>
        <IconComponent
          className={cn(variantClasses.icon, iconClassName)}
          strokeWidth={strokeWidth}
        />
      </div>
    );
  }

  // ===== RAW MODE: Bare SVG icon =====
  const iconClassName_raw = cn(
    size ? `w-[${size}px] h-[${size}px]` : '',
    className
  );

  return (
    <IconComponent
      className={iconClassName_raw}
      strokeWidth={strokeWidth}
      {...svgProps}
    />
  );
};

export default Icon;

// ============================================================================
// UTILITY: DynamicIcon (for compatibility with old code)
// ============================================================================

/**
 * Alternative component that accepts icon as component OR string
 * @deprecated Use Icon component directly - it handles both modes
 */
export const DynamicIcon: React.FC<{
  icon: LucideIcon | string;
  className?: string;
  size?: number;
  variant?: 'compact' | 'regular' | 'large';
  strokeWidth?: number;
}> = ({ icon, className, size, variant, strokeWidth = 2 }) => {
  // If already a component, render as raw icon
  if (typeof icon !== 'string') {
    const IconComponent = icon as LucideIcon;
    return (
      <IconComponent
        className={className}
        strokeWidth={strokeWidth}
      />
    );
  }

  // Otherwise use Icon component
  return (
    <Icon
      name={icon}
      variant={variant}
      className={className}
      size={size}
      strokeWidth={strokeWidth}
    />
  );
};
