/**
 * Sidebar Action Button Component
 * Reusable action button for sidebar footer (Language, Auth, etc.)
 * Follows same visual pattern as NavItem for consistency.
 */

import React from 'react';
import { getIcon } from '../../lib/icons';
import { SIDEBAR_CONSTANTS } from '../../lib/sidebar.constants';

export interface ActionButtonProps {
  /** Icon name (must exist in icon library) */
  icon: string;

  /** Display label / button text */
  label: string;

  /** Click handler for the action */
  onClick: () => void;

  /** Is the sidebar in open state (for text visibility) */
  isOpen: boolean;

  /** Tooltip text shown on hover */
  title?: string;
}

/**
 * ActionButton Component
 * Footer action button (Language, Sign In/Out, etc.)
 * Features:
 * - Fixed icon container (w-[108px]) with collapsible text
 * - Hover background state
 * - Consistent styling with NavItem
 * - Perfect icon centering in closed sidebar
 */
const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onClick,
  isOpen,
  title,
}: ActionButtonProps) => {
  const IconComponent = getIcon(icon);

  return (
    <button
      onClick={onClick}
      title={title || label}
      className={`
        relative flex items-center w-full ${SIDEBAR_CONSTANTS.ITEM_HEIGHT}
        ${SIDEBAR_CONSTANTS.TRANSITION_STANDARD} group
      `}
    >
      {/* BACKGROUND - Hover state */}
      <div
        className={`
          absolute ${SIDEBAR_CONSTANTS.BG_INSET} ${SIDEBAR_CONSTANTS.BG_ROUNDED}
          ${SIDEBAR_CONSTANTS.TRANSITION_STANDARD}
          ${SIDEBAR_CONSTANTS.HOVER_BG}
        `}
      />

      {/* ICON CONTAINER - Fixed width, always visible, left-aligned */}
      <div
        className={`${SIDEBAR_CONSTANTS.ICON_CONTAINER_WIDTH} shrink-0 flex items-center justify-start pl-5 z-10`}
      >
        <IconComponent className={`${SIDEBAR_CONSTANTS.ICON_SIZE} text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300`} />
      </div>

      {/* TEXT CONTAINER - Appears when sidebar is open */}
      <div
        className={`flex items-center flex-1 overflow-hidden whitespace-nowrap z-10 ${SIDEBAR_CONSTANTS.TRANSITION_EXTENDED} origin-left ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'
          }`}
      >
        <span className="font-display font-bold tracking-wide text-gray-700 dark:text-gray-300">
          {label}
        </span>
      </div>
    </button>
  );
};

export default ActionButton;
