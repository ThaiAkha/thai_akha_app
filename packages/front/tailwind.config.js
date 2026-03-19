/**
 * Front App Tailwind Configuration
 *
 * Theme tokens (colors, fonts, animations, shadows, breakpoints)
 * are defined in packages/shared/src/styles/theme.css via @theme.
 *
 * This file only handles:
 * - darkMode strategy
 * - content paths
 * - safelist (dynamic class names not detectable by JIT)
 * - front-specific semantic colors (mapped from CSS variables in tokens.css)
 * - plugins
 */

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // ========== SIDEBAR BACKGROUND ==========
    'dark:bg-gray-dark',
    // ========== FRONT SIDEBAR COLORS (action scale) ==========
    // Pill active states
    'bg-action-500/20',
    'dark:bg-action-500/20',
    // Pill hover state
    'hover:bg-action-500/10',
    'dark:hover:bg-action-500/10',
    // Active text & icon
    'text-action-700',
    'dark:text-action-400',
    // Badge & indicator
    'bg-action-700',
    // ========== SIDEBAR ICON PADDING ==========
    'pl-5',
  ],
};
