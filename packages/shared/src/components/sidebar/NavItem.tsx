/**
 * Sidebar NavItem Component
 * Reusable menu item for both admin and front app sidebars.
 * Uses inline styles to avoid Tailwind JIT compilation issues.
 */

import React, { useState } from 'react';
import { getIcon } from '../../lib/icons';
import { SIDEBAR_CONSTANTS } from '../../lib/sidebar.constants';

export type AccentColorScheme = 'brand' | 'action';

export interface NavItemProps {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isOpen: boolean;
  isDarkMode: boolean;
  badge?: string;
  accentColor?: AccentColorScheme;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  isActive,
  onClick,
  isOpen,
  isDarkMode: _isDarkMode,
  badge,
  accentColor = 'brand',
}) => {
  const IconComponent = getIcon(icon);
  const [isHovered, setIsHovered] = useState(false);

  // Color palette
  const colors = {
    brand: {
      active: 'rgba(239, 68, 68, 0.25)',      // red-500/25
      activeText: '#dc2626',                   // red-600
      inactiveText: '#374151',                 // gray-700
      hover: 'rgba(229, 231, 235, 0.5)',      // gray-100
    },
    action: {
      active: 'rgba(132, 204, 22, 0.25)',     // lime-500/25
      activeText: '#4d7c0f',                   // lime-800 (darker)
      inactiveText: '#374151',                 // gray-700
      hover: 'rgba(229, 231, 235, 0.5)',      // gray-100
    },
  };

  const palette = colors[accentColor as AccentColorScheme];

  // Determine background color
  const getBgColor = () => {
    if (isActive) return palette.active;
    if (isHovered) return palette.hover;
    return 'transparent';
  };

  // Determine text color
  const getTextColor = () => {
    return isActive ? palette.activeText : palette.inactiveText;
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={label}
      className={`
        relative flex items-center w-full ${SIDEBAR_CONSTANTS.ITEM_HEIGHT}
        ${SIDEBAR_CONSTANTS.TRANSITION_STANDARD}
        rounded-xl mx-2 my-0.5 px-2 py-1
      `}
      style={{
        backgroundColor: getBgColor(),
        transition: 'background-color 200ms ease-in-out',
      }}
    >
      {/* ICON CONTAINER */}
      <div
        className={`${SIDEBAR_CONSTANTS.ICON_CONTAINER_WIDTH} shrink-0 flex items-center justify-center`}
      >
        <IconComponent
          className={`
            ${SIDEBAR_CONSTANTS.ICON_SIZE}
            transition-colors duration-200
          `}
          style={{ color: getTextColor() }}
        />
      </div>

      {/* TEXT CONTAINER */}
      <div
        className={`
          flex items-center flex-1 overflow-hidden whitespace-nowrap
          transition-all duration-300 ${SIDEBAR_CONSTANTS.EASE_CUBIC} origin-left
          ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'}
        `}
      >
        <span
          className={`
            ${SIDEBAR_CONSTANTS.FONT_DISPLAY}
            ${SIDEBAR_CONSTANTS.FONT_STYLE}
            ml-1
          `}
          style={{ color: getTextColor() }}
        >
          {label}
        </span>

        {badge && (
          <span
            className={`
              px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ml-3
              transition-colors duration-200
            `}
            style={{
              backgroundColor: isActive ? palette.activeText : '#e5e7eb',
              color: isActive ? 'white' : '#374151',
            }}
          >
            {badge}
          </span>
        )}
      </div>
    </button>
  );
};

export default NavItem;
