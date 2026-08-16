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
    // ========== SIDEBAR WIDTHS (used via JS constants — must be safelisted) ==========
    // ========== FOOTER GROUPS (Information, Settings, Login) ==========
    // All footer buttons use a gray base with quiz-p colored icons
    'bg-gray-25', 'bg-gray-50', 'border-gray-200', 'hover:bg-gray-100', 'hover:border-gray-300', 'bg-gray-100',
    'bg-white', 'hover:bg-gray-50',
    'dark:bg-gray-950', 'dark:bg-gray-900', 'dark:border-gray-800', 'dark:hover:bg-gray-800', 'dark:bg-gray-800', 'dark:border-gray-700', 'dark:hover:bg-gray-900',
    'text-quiz-p-700', 'dark:text-quiz-p-400',
  ],
};
