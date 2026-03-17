/**
 * Admin App Tailwind Configuration
 *
 * Theme tokens (colors, fonts, animations, shadows, breakpoints)
 * are defined in packages/shared/src/styles/theme.css via @theme.
 *
 * This file only handles:
 * - content paths
 * - safelist (dynamic class names not detectable by JIT)
 * - plugins
 */

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "../shared/src/**/*.{js,ts,jsx,tsx}",
    ],
    safelist: [
        // ========== SIDEBAR BACKGROUND ==========
        'dark:bg-gray-dark',
        // ========== ADMIN SIDEBAR COLORS (brand red) ==========
        // Pill active states
        'bg-brand-500/20',
        'dark:bg-brand-500/20',
        // Pill hover state
        'hover:bg-brand-500/10',
        'dark:hover:bg-brand-500/10',
        // Active text & icon
        'text-brand-600',
        'dark:text-brand-400',
        // Badge & indicator
        'bg-brand-600',
        // ========== SIDEBAR ICON PADDING ==========
        'pl-5',
    ],
    plugins: [],
}
