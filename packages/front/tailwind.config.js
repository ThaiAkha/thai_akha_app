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
 */

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // ========== FRONT SIDEBAR COLORS (action scale) ==========
    'bg-action-500/20',
    'hover:bg-action-500/10',
    'text-action-700',
    'bg-action-700',
    // ========== SIDEBAR ICON PADDING ==========
    'pl-5',
  ],
};
