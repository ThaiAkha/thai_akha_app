/**
 * Thai Akha Kitchen — Centralized Color System
 * Source: docs/COLOR_SYSTEM.md (v1.0, March 2026)
 *
 * Single source of truth for all color tokens across admin & front apps.
 * Import from @thaiakha/shared/lib/colors instead of hardcoding Tailwind classes.
 */

// ============================================================================
// PRIMARY COLORS (Brand Identity)
// ============================================================================

export const COLORS = {
  // 🔴 Cherry Red — Brand primary (Front App CTA)
  cherry: {
    100: '#FBDDE4',
    200: '#F6BCCB',
    300: '#F09AB2',
    400: '#ED7A93',
    500: '#E54063', // Primary CTA button
    600: '#C9334F', // Hover
    700: '#A82741', // Pressed
    800: '#861D32',
    900: '#641425',
    950: '#420C18',
  },

  // 🟢 Lime Green — Admin primary + action color (Front sidebar active)
  lime: {
    100: '#EEF7D4',
    200: '#E3F2BB',
    300: '#D6EBA8',
    400: '#CDE89A',
    500: '#BAD879', // Admin button primary
    600: '#9EBF63', // Hover
    700: '#82A64D', // Pressed/Active
    800: '#65843A',
    900: '#4A6229',
    950: '#2E3D19',
  },

  // 🟠 Orange — Secondary CTA (Front App)
  orange: {
    300: '#FFBA80',
    400: '#FF9040',
    500: '#FF6D00', // Secondary CTA (Acquista, Book Fast)
    600: '#E56000', // Hover
    700: '#CC5500',
  },

  // 🔵 Blue — Info & Navigation
  blue: {
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Info button, links
    600: '#2563EB', // Hover
  },

  // 🎨 Quiz Colors
  magenta: {
    400: '#E879A0',
    500: '#D6366E', // Quiz primary
    600: '#B52A5B',
  },

  purple: {
    400: '#A78BFA',
    500: '#8B5CF6', // Quiz secondary
    600: '#7C3AED',
  },

  // ⚪ System Grays (Neutral scale)
  gray: {
    25: '#F6FCFC',   // Background light
    50: '#E6ECEC',   // Surface secondary light
    100: '#D6DCDC',  // Border light, input bg
    200: '#C2C8C8',  // Border standard
    300: '#AEB4B4',  // Divisors
    400: '#9AA0A0',  // Decorative only
    500: '#868C8C',  // Icons neutral
    600: '#727878',  // Text secondary
    700: '#5E6464',  // Text body (dark surface)
    800: '#4A504F',  // Text body (light surface)
    900: '#222827',  // Surface dark mode
    950: '#121311',  // Background dark mode
  },

  // 🚨 System UI Colors (Functional)
  system: {
    error: '#EF4444',    // Errors, delete
    warning: '#F59E0B',  // Warnings (amber, not orange)
    notice: '#EAB308',   // Notifications
    success: '#22C55E',  // Success, verified
    info: '#3B82F6',     // Information
  },
};

// ============================================================================
// SEMANTIC TOKENS (Use these in components, not raw values)
// ============================================================================

/**
 * Light mode semantic colors
 * Apply in components without worrying about dark mode switching
 */
export const SEMANTIC_TOKENS_LIGHT = {
  // Background & Surface
  background: COLORS.gray[25],      // Page background
  surface: '#FFFFFF',               // Cards, modals, inputs
  surfaceSecondary: COLORS.gray[50],

  // Borders
  border: COLORS.gray[100],         // Light border
  borderStrong: COLORS.gray[200],   // Standard border

  // Text
  textTitle: COLORS.gray[950],      // Titles, H1-H3
  textBody: COLORS.gray[800],       // Body text
  textSubtle: COLORS.gray[600],     // Secondary text
  textMuted: COLORS.gray[400],      // Decorative only
};

/**
 * Dark mode semantic colors
 * Automatically applied when body.dark class is set
 */
export const SEMANTIC_TOKENS_DARK = {
  // Background & Surface
  background: COLORS.gray[950],     // Page background
  surface: COLORS.gray[900],        // Cards, modals, inputs
  surfaceSecondary: '#1a1f1e',

  // Borders
  border: COLORS.gray[800],         // Light border
  borderStrong: COLORS.gray[700],   // Standard border

  // Text
  textTitle: COLORS.gray[25],       // Titles, H1-H3
  textBody: COLORS.gray[100],       // Body text
  textSubtle: COLORS.gray[400],     // Secondary text
  textMuted: COLORS.gray[600],      // Decorative only
};

// ============================================================================
// SIDEBAR COLORS (For NavItem component)
// ============================================================================

/**
 * Color schemes for sidebar menu items
 * - 'brand': Admin app (cherry red)
 * - 'action': Front app (lime green / action color)
 */
export const SIDEBAR_COLOR_SCHEMES = {
  brand: {
    // Active state styling
    activeBg: 'bg-cherry-500/10 dark:bg-cherry-500/20',
    activeText: 'text-cherry-600 dark:text-cherry-400',
    activeIcon: 'text-cherry-600 dark:text-cherry-400',
    badgeBg: 'bg-cherry-600',
    indicator: 'bg-cherry-600',

    // Hex values for non-Tailwind use
    hex: {
      activeBg: COLORS.cherry[100],
      activeText: COLORS.cherry[600],
      icon: COLORS.cherry[600],
      indicator: COLORS.cherry[600],
    }
  },

  action: {
    // Active state styling
    activeBg: 'bg-lime-500/10 dark:bg-lime-500/20',
    activeText: 'text-lime-700 dark:text-lime-400',
    activeIcon: 'text-lime-700 dark:text-lime-400',
    badgeBg: 'bg-lime-700',
    indicator: 'bg-lime-700',

    // Hex values for non-Tailwind use
    hex: {
      activeBg: COLORS.lime[100],
      activeText: COLORS.lime[700],
      icon: COLORS.lime[700],
      indicator: COLORS.lime[700],
    }
  }
};

// ============================================================================
// BUTTON STYLES (For CTA hierarchy)
// ============================================================================

export const BUTTON_COLORS = {
  primary: {
    light: COLORS.cherry[500],      // Front: Cherry
    dark: COLORS.lime[500],         // Admin: Lime
  },
  secondary: {
    light: COLORS.orange[500],      // Front: Orange
  },
  info: {
    light: COLORS.blue[500],        // All: Blue
  },
};

// ============================================================================
// GRADIENTS
// ============================================================================

export const GRADIENTS = {
  sunset: `linear-gradient(135deg, ${COLORS.orange[500]}, ${COLORS.cherry[500]})`,
  nightBlue: `linear-gradient(135deg, ${COLORS.blue[500]}, ${COLORS.purple[500]})`,
  quizChat: `linear-gradient(135deg, ${COLORS.purple[500]}, ${COLORS.magenta[500]})`,
};

// ============================================================================
// SHADOW / GLOW EFFECTS
// ============================================================================

export const GLOW_SHADOWS = {
  cherry: '0 4px 20px rgba(229, 64, 99, 0.40)',
  cherryHeavy: '0 8px 36px rgba(229, 64, 99, 0.60)',

  lime: '0 4px 16px rgba(186, 216, 121, 0.40)',
  limeHeavy: '0 8px 28px rgba(186, 216, 121, 0.55)',

  orange: '0 4px 20px rgba(255, 109, 0, 0.40)',
  orangeHeavy: '0 8px 36px rgba(255, 109, 0, 0.60)',

  blue: '0 4px 16px rgba(59, 130, 246, 0.35)',
  blueHeavy: '0 8px 28px rgba(59, 130, 246, 0.55)',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get semantic color value based on light/dark mode
 * Use in component logic when you need hex values instead of Tailwind classes
 */
export function getSemanticColor(
  token: keyof typeof SEMANTIC_TOKENS_LIGHT,
  isDarkMode: boolean
): string {
  if (isDarkMode) {
    return SEMANTIC_TOKENS_DARK[token];
  }
  return SEMANTIC_TOKENS_LIGHT[token];
}

/**
 * Get sidebar color scheme for NavItem component
 */
export function getSidebarColorScheme(
  scheme: 'brand' | 'action'
) {
  return SIDEBAR_COLOR_SCHEMES[scheme];
}

/**
 * Convert hex color to RGB for use in CSS variables
 */
export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
  }
  return '0 0 0';
}

// ============================================================================
// EXPORTS
// ============================================================================

export default COLORS;
