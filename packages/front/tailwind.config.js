/**
 * Front App Tailwind Configuration
 *
 * Extends base theme from shared package with front-specific:
 * - darkMode explicit configuration
 * - content paths
 * - safelist (lime green active states)
 * - semantic color variables (primary, secondary, action, etc.)
 * - plugins
 */

import { getBaseThemeExtension } from '@thaiakha/shared';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
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
    'pl-7',
  ],
  theme: {
    extend: {
      ...getBaseThemeExtension(),
      colors: {
        // ========== SEMANTIC COLORS (Front-specific) ==========
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        action: 'rgb(var(--color-action) / <alpha-value>)',
        special: 'rgb(var(--color-special) / <alpha-value>)',

        // 🌟 SPECIAL CHANNELS
        allergy: 'rgb(var(--color-allergy) / <alpha-value>)',
        'allergy-secondary': 'rgb(var(--color-allergy-secondary) / <alpha-value>)',
        quiz: 'rgb(var(--color-quiz) / <alpha-value>)',

        // ☀️ SEMANTIC LAYERS
        background: 'rgb(var(--color-background) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        title: 'rgb(var(--color-title) / <alpha-value>)',
        desc: 'rgb(var(--color-desc) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
        accent: ['var(--font-accent)'],
      },
    },
  },
  plugins: [],
};
