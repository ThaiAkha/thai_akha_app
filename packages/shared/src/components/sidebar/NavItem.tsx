/**
 * Sidebar NavItem Component
 * Reusable menu item for both admin and front app sidebars.
 * Supports multiple color schemes (brand for admin, action for front).
 * Parents handle tooltip wrapping when sidebar is closed.
 */

import React from 'react';
import { getIcon } from '../../lib/icons';
import { SIDEBAR_CONSTANTS } from '../../lib/sidebar.constants';
import { SIDEBAR_COLOR_SCHEMES } from '../../lib/colors.constants';

export type AccentColorScheme = 'brand' | 'action';
export type PillVariant = 'filled' | 'outline' | 'subtle';

export interface NavItemProps {
  /** Icon name (must exist in icon library) */
  icon: string;

  /** Display label / menu text */
  label: string;

  /** Is this item the currently active page */
  isActive: boolean;

  /** Click handler for navigation */
  onClick: () => void;

  /** Is the sidebar in open state (for text visibility) */
  isOpen: boolean;

  /** Is dark mode enabled */
  isDarkMode: boolean;

  /** Optional badge text (e.g., "NEW", "BETA") */
  badge?: string;

  /** Optional highlight flag for future use */
  highlight?: boolean;

  /** Color scheme: 'brand' (admin red) or 'action' (front green) */
  accentColor?: AccentColorScheme;

  /** Show background pill on hover state */
  showPillOnHover?: boolean;

  /** Show background pill on active state */
  showPillOnActive?: boolean;

  /** Pill style variant: 'filled' (background), 'outline' (border), 'subtle' (faded) */
  pillVariant?: PillVariant;
}

/**
 * NavItem Component
 * Single menu item for sidebar navigation.
 * Features:
 * - Fixed icon container (w-[108px]) with collapsible text
 * - Active state with background highlight and left border indicator
 * - Hover effects on icons and background
 * - Badge support for labels like "NEW"
 * - Dark mode support
 * - Two color schemes: brand (primary red) and action (lime green)
 */
const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  isActive,
  onClick,
  isOpen,
  isDarkMode: _isDarkMode,
  badge,
  highlight: _highlight,
  accentColor = 'brand',
  showPillOnHover = true,
  showPillOnActive = true,
  pillVariant = 'filled',
}: NavItemProps) => {
  const IconComponent = getIcon(icon);
  const colors = SIDEBAR_COLOR_SCHEMES[accentColor as AccentColorScheme];

  // Determine active pill styling based on pillVariant
  const getActivePillClasses = () => {
    if (!isActive || !showPillOnActive) return '';

    const brandActive = 'bg-brand-500/15 dark:bg-brand-500/25';
    const actionActive = 'bg-lime-500/15 dark:bg-lime-500/25';

    if (pillVariant === 'outline') {
      const brandOutline = 'border border-brand-200 dark:border-brand-800';
      const actionOutline = 'border border-lime-200 dark:border-lime-800';
      return accentColor === 'brand' ? brandOutline : actionOutline;
    }

    if (pillVariant === 'subtle') {
      const brandSubtle = 'bg-brand-50/30 dark:bg-brand-900/20';
      const actionSubtle = 'bg-lime-50/30 dark:bg-lime-900/20';
      return accentColor === 'brand' ? brandSubtle : actionSubtle;
    }

    // Default: 'filled'
    return accentColor === 'brand' ? brandActive : actionActive;
  };

  // Determine hover pill styling
  const getHoverPillClasses = () => {
    if (!showPillOnHover || isActive) return '';
    return 'hover:bg-gray-100 dark:hover:bg-white/5';
  };

  return (
    <button
      onClick={onClick}
      title={label}
      className={`
        relative flex items-center w-full ${SIDEBAR_CONSTANTS.ITEM_HEIGHT}
        ${SIDEBAR_CONSTANTS.TRANSITION_STANDARD}
        rounded-xl
        ${getActivePillClasses()}
        ${getHoverPillClasses()}
      `}
    >

      {/* ICON CONTAINER - Fixed width, always visible */}
      <div
        className={`${SIDEBAR_CONSTANTS.ICON_CONTAINER_WIDTH} shrink-0 flex items-center justify-center`}
      >
        <IconComponent
          className={`
            ${SIDEBAR_CONSTANTS.ICON_SIZE}
            transition-transform duration-300
            ${SIDEBAR_CONSTANTS.ICON_ACTIVE_SCALE}
            ${
              isActive
                ? colors.activeIcon
                : `${SIDEBAR_CONSTANTS.INACTIVE_ICON} ${SIDEBAR_CONSTANTS.HOVER_ICON}`
            }
          `}
        />
      </div>

      {/* TEXT CONTAINER - Appears only when sidebar is open */}
      <div
        className={`
          flex items-center flex-1 overflow-hidden whitespace-nowrap
          transition-all duration-300 ${SIDEBAR_CONSTANTS.EASE_CUBIC} origin-left
          ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'}
        `}
      >
        {/* Label text */}
        <span
          className={`
            ${SIDEBAR_CONSTANTS.FONT_DISPLAY}
            ${SIDEBAR_CONSTANTS.FONT_STYLE}
            ${isActive ? colors.activeText : SIDEBAR_CONSTANTS.INACTIVE_TEXT}
            ml-1
          `}
        >
          {label}
        </span>

        {/* Optional badge */}
        {badge && (
          <span
            className={`
              px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ml-3
              transition-colors duration-200
              ${
                isActive
                  ? `${colors.badgeBg} text-white shadow-sm`
                  : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300'
              }
            `}
          >
            {badge}
          </span>
        )}
      </div>
    </button>
  );
};

export default NavItem;
