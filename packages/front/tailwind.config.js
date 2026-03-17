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
    // ========== FRONT SIDEBAR COLORS (action = lime) ==========
    // Pill active states
    'bg-lime-500/20',
    'dark:bg-lime-500/20',
    // Pill hover state
    'hover:bg-lime-500/10',
    'dark:hover:bg-lime-500/10',
    // Active text & icon
    'text-lime-700',
    'dark:text-lime-400',
    // Badge & indicator
    'bg-lime-700',
    // ========== SIDEBAR ICON PADDING ==========
    'pl-5',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
