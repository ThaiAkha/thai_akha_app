/**
 * Base Tailwind Configuration for Thai Akha Kitchen
 *
 * This is the single source of truth for:
 * - Brand colors (cherry, lime, orange, blue, gray, system)
 * - Font family definitions
 * - Custom animations and keyframes
 * - Custom box shadows and timing functions
 *
 * Both admin and front apps import from this file and extend with their own app-specific:
 * - content paths
 * - safelist (different active state colors per app)
 * - plugins
 * - dark mode strategy (if different)
 *
 * @see packages/admin/tailwind.config.js (imports this config)
 * @see packages/front/tailwind.config.js (imports this config)
 */

// ============================================================================
// BASE COLORS (Shared across all apps)
// ============================================================================

const baseColors = {
  // 🔴 Brand Red — Primary brand color (Admin sidebar, front CTA)
  brand: {
    50: '#FBDDE4',
    100: '#FBDDE4',
    200: '#F6BCCB',
    300: '#F09AB2',
    400: '#ED7A93',
    500: '#E54063',
    600: '#C9334F',
    700: '#A82741',
    800: '#861D32',
    900: '#641425',
    950: '#420C18',
  },

  // 🟢 Lime Green — Secondary + action color (Front sidebar active)
  lime: {
    100: '#EEF7D4',
    200: '#E3F2BB',
    300: '#D6EBA8',
    400: '#CDE89A',
    500: '#BAD879',
    600: '#9EBF63',
    700: '#82A64D',
    800: '#65843A',
    900: '#4A6229',
    950: '#2E3D19',
  },

  // 🟠 Orange — Secondary CTA
  orange: {
    300: '#FFBA80',
    400: '#FF9040',
    500: '#FF6D00',
    600: '#E56000',
    700: '#CC5500',
  },

  // 🔵 Blue — Info & Navigation
  blue: {
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
  },

  // 🔴 Magenta — Quiz primary color
  magenta: {
    400: '#E879A0',
    500: '#D6366E',
    600: '#B52A5B',
  },

  // 🟣 Purple — Quiz secondary color
  purple: {
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
  },

  // 🚨 System UI Colors — Functional
  'sys-error': '#EF4444',
  'sys-warning': '#F59E0B',
  'sys-notice': '#EAB308',
  'sys-success': '#22C55E',
  'sys-info': '#3B82F6',
};

// ============================================================================
// BASE FONT FAMILIES (Can be overridden by CSS variables in apps)
// ============================================================================

const baseFontFamily = {
  display: ['Inter', 'Noto Sans Thai', 'sans-serif'],
  sans: ['Roboto', 'Noto Sans Thai', 'sans-serif'],
  accent: ['Inter', 'Noto Sans Thai', 'sans-serif'],
};

// ============================================================================
// CUSTOM BOX SHADOWS (Shared glow effects)
// ============================================================================

const baseBoxShadow = {
  'brand-glow': '0 15px 30px -5px rgba(224, 0, 134, 0.4)',
  'action-glow': '0 15px 30px -5px rgba(152, 201, 60, 0.4)',
  'badge-glow': '0 8px 16px -4px rgba(224, 0, 134, 0.2)',
  'card-hover': '0 0 40px rgba(255, 117, 151, 0.4)',
  'glow-special': '0 0 20px -5px rgba(255, 109, 0, 0.5)',
  'glow-allergy': '0 0 25px -5px rgba(255, 109, 0, 0.5)',

  // 🌟 Glow shadows for CTA buttons
  'glow-cherry': '0 4px 20px rgba(229, 64, 99, 0.40)',
  'glow-cherry-h': '0 8px 36px rgba(229, 64, 99, 0.60)',
  'glow-lime': '0 4px 16px rgba(186, 216, 121, 0.40)',
  'glow-lime-h': '0 8px 28px rgba(186, 216, 121, 0.55)',
  'glow-orange': '0 4px 20px rgba(255, 109, 0, 0.40)',
  'glow-orange-h': '0 8px 36px rgba(255, 109, 0, 0.60)',
  'glow-blue': '0 4px 16px rgba(59, 130, 246, 0.35)',
  'glow-blue-h': '0 8px 28px rgba(59, 130, 246, 0.55)',
};

// ============================================================================
// CUSTOM TRANSITION TIMING (Cinematic effects)
// ============================================================================

const baseTransitionTimingFunction = {
  'cinematic': 'cubic-bezier(0.25, 1, 0.5, 1)',
  'elastic': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',     // Bounce effect for buttons, cards
  'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',          // Color/opacity hover
};

// ============================================================================
// RESPONSIVE BREAKPOINTS (Unified across Admin & Front)
// ============================================================================

const baseBreakpoints = {
  '2xsm': '375px',   // iPhone SE, small phones
  'xsm': '425px',    // Smaller phones
  'sm': '640px',     // Tailwind default
  'md': '768px',     // Tablet
  'lg': '1024px',    // Desktop
  'xl': '1280px',    // Large desktop
  '2xl': '1536px',   // Extra large desktop
  '3xl': '2000px',   // Ultra-wide displays
};

// ============================================================================
// CUSTOM ANIMATIONS
// ============================================================================

const baseAnimation = {
  'fade-slide-down': 'fade-slide-down 0.9s ease-out both',
  'fade-slide-up': 'fade-slide-up 0.9s ease-out both',
  'pulse-slow': 'pulse-slow 10s ease-in-out infinite',
  'flash': 'flash 0.6s ease-out forwards',
  'icon-pulse': 'icon-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  'mic-listening': 'mic-listening 1.5s ease-in-out infinite',
  'shine': 'shine 4s infinite linear',
  'shine-oblique': 'shine-oblique 4s infinite linear',
};

// ============================================================================
// KEYFRAME DEFINITIONS (Paired with animations above)
// ============================================================================

const baseKeyframes = {
  'fade-slide-down': {
    '0%': { opacity: '0', transform: 'translateY(-3rem)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  'fade-slide-up': {
    '0%': { opacity: '0', transform: 'translateY(3rem)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  'pulse-slow': {
    '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
    '50%': { opacity: '0.6', transform: 'scale(1.1)' },
  },
  'flash': {
    '0%': { opacity: '0', transform: 'translateX(-100%) skewX(-15deg)' },
    '50%': { opacity: '1' },
    '100%': { opacity: '0', transform: 'translateX(100%) skewX(-15deg)' },
  },
  'icon-pulse': {
    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
    '50%': { opacity: '0.7', transform: 'scale(0.95)' },
  },
  'mic-listening': {
    '0%': { boxShadow: '0 0 0 0 rgba(227, 31, 51, 0.4)' },
    '70%': { boxShadow: '0 0 0 10px rgba(227, 31, 51, 0)' },
    '100%': { boxShadow: '0 0 0 0 rgba(227, 31, 51, 0)' },
  },
  'shine': {
    '0%': { left: '-100%' },
    '100%': { left: '200%' },
  },
  'shine-oblique': {
    '0%': { left: '-150%' },
    '20%': { left: '150%' },
    '100%': { left: '150%' },
  },
};

// ============================================================================
// EXPORTED BASE THEME EXTENSION
// ============================================================================

/**
 * Base Tailwind theme extension
 * Use this in your app's tailwind.config.js:
 *
 * @example
 * import { getBaseThemeExtension } from '@thaiakha/shared/styles/tailwind.config.base';
 *
 * export default {
 *   ...baseConfig,
 *   theme: {
 *     extend: getBaseThemeExtension()
 *   }
 * }
 *
 * Color palette:
 * - brand: Primary brand red (#E54063) - admin sidebar, buttons, accents
 * - lime: Secondary lime green (#BAD879) - front sidebar active states
 * - orange: Secondary CTA (#FF6D00)
 * - blue: Info & navigation (#3B82F6)
 */
export function getBaseThemeExtension() {
  return {
    colors: baseColors,
    fontFamily: baseFontFamily,
    boxShadow: baseBoxShadow,
    transitionTimingFunction: baseTransitionTimingFunction,
    screens: baseBreakpoints,
    animation: baseAnimation,
    keyframes: baseKeyframes,
  };
}

// ============================================================================
// EXPORTS FOR INDIVIDUAL USE
// ============================================================================

export { baseColors, baseFontFamily, baseBoxShadow, baseTransitionTimingFunction, baseBreakpoints, baseAnimation, baseKeyframes };

// ============================================================================
// TYPE EXPORTS (for TypeScript)
// ============================================================================

export type BaseColors = typeof baseColors;
export type BaseFontFamily = typeof baseFontFamily;
export type BaseBreakpoints = typeof baseBreakpoints;
export type BaseAnimation = typeof baseAnimation;
