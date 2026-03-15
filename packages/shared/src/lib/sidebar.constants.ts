/**
 * Sidebar Layout & Styling Constants
 * Single source of truth for sidebar dimensions, spacing, and transitions.
 * Works for both admin and front apps.
 */

export const SIDEBAR_CONSTANTS = {
  // ============================================================================
  // LAYOUT DIMENSIONS
  // ============================================================================
  CLOSED_WIDTH: 'w-[108px]',           // Closed sidebar width
  OPEN_WIDTH: 'w-80',                  // Open sidebar width
  ICON_CONTAINER_WIDTH: 'w-[108px]',   // Fixed icon area width
  ITEM_HEIGHT: 'h-14',                 // Menu item height (56px)

  // ============================================================================
  // BACKGROUND STYLING
  // ============================================================================
  BG_INSET: 'inset-1',                 // Active/hover background inset (1px all sides)
  BG_ROUNDED: 'rounded-xl',             // Background border radius
  HOVER_BG: 'group-hover:bg-gray-100 dark:group-hover:bg-white/5',

  // ============================================================================
  // TYPOGRAPHY
  // ============================================================================
  FONT_DISPLAY: 'font-display',         // Display font family
  FONT_STYLE: 'font-bold tracking-wide', // Text styling

  // ============================================================================
  // COLORS (Inactive state - same for both apps)
  // ============================================================================
  INACTIVE_TEXT: 'text-gray-700 dark:text-gray-300',
  INACTIVE_ICON: 'text-gray-500 dark:text-gray-400',
  HOVER_ICON: 'group-hover:text-gray-700 dark:group-hover:text-gray-300',

  // ============================================================================
  // ICON STYLING
  // ============================================================================
  ICON_SIZE: 'w-6 h-6',                // Icon dimensions
  ICON_ACTIVE_SCALE: 'group-active:scale-95', // Press effect

  // ============================================================================
  // SPACING & GAPS
  // ============================================================================
  SPACING_BETWEEN_ITEMS: 'space-y-1',  // Gap between menu items
  LOGO_MARGIN_BOTTOM: 'mb-8',          // Logo section margin
  FOOTER_MARGIN_TOP: 'mt-auto',        // Footer spacing
  FOOTER_PADDING: 'pt-4',              // Footer top padding
  PADDING_HORIZONTAL: 'px-4',          // Sidebar padding

  // ============================================================================
  // TRANSITIONS
  // ============================================================================
  TRANSITION_STANDARD: 'transition-colors duration-200',
  TRANSITION_EXTENDED: 'transition-all duration-300',
  EASE_CUBIC: 'ease-[cubic-bezier(0.25,1,0.5,1)]',
  EASE_STANDARD: 'ease-[cubic-bezier(0.32,0.72,0,1)]',

  // ============================================================================
  // SIDEBAR CONTAINER STYLING
  // ============================================================================
  SIDEBAR_BASE: `
    fixed top-0 left-0 h-screen z-[99] flex flex-col
    bg-white dark:bg-gray-dark dark:border-gray-800 text-gray-900
    border-r border-gray-200
    transition-all ease-[cubic-bezier(0.32,0.72,0,1)]
  `,

  SIDEBAR_MOBILE_OFFSET: {
    desktop: 'lg:mt-0',    // Desktop: no offset
    mobile: 'mt-16',       // Mobile: space for header
  },

  // ============================================================================
  // LOGO STYLING
  // ============================================================================
  LOGO_SIZE: 'size-10',                // Logo icon dimensions
  LOGO_CONTAINER: 'h-12 flex items-center',

  // ============================================================================
  // LEFT INDICATOR (Active state - INTERNAL to pill)
  // ============================================================================
  LEFT_INDICATOR_BASE: 'absolute left-2 top-1/2 -translate-y-1/2 h-8 w-1 rounded-full z-10',

  // ============================================================================
  // TOOLTIP STYLING (For closed sidebar)
  // ============================================================================
  TOOLTIP: {
    position: 'right',                 // Tooltip position relative to icon
    delay: 'delay-100',                // Tooltip appear delay
    className: 'w-full',               // Tooltip container class
  },

  // ============================================================================
  // ANIMATION TIMING
  // ============================================================================
  SIDEBAR_TRANSITION_DURATION: '800ms', // Sidebar collapse/expand duration (matches actual implementation)
  STAGGER_DELAY: '60ms',               // Mobile menu item stagger delay
};

// ============================================================================
// DERIVED VALUES (Computed from constants)
// ============================================================================

/**
 * Get sidebar width class based on state
 */
export function getSidebarWidthClass(isOpen: boolean): string {
  return isOpen ? SIDEBAR_CONSTANTS.OPEN_WIDTH : SIDEBAR_CONSTANTS.CLOSED_WIDTH;
}

/**
 * Get mobile offset class for sidebar (mt-16 on mobile, lg:mt-0 on desktop)
 */
export function getMobileOffsetClass(isDesktop: boolean): string {
  return isDesktop
    ? SIDEBAR_CONSTANTS.SIDEBAR_MOBILE_OFFSET.desktop
    : SIDEBAR_CONSTANTS.SIDEBAR_MOBILE_OFFSET.mobile;
}

/**
 * Get left indicator class with color
 */
export function getLeftIndicatorClass(color: string): string {
  return `${SIDEBAR_CONSTANTS.LEFT_INDICATOR_BASE} ${color}`;
}

export default SIDEBAR_CONSTANTS;
