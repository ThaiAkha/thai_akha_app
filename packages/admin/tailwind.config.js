/**
 * Admin App Tailwind Configuration
 *
 * Extends base theme from shared package with admin-specific:
 * - content paths
 * - safelist (cherry red active states)
 * - plugins
 */

import { getBaseThemeExtension } from '@thaiakha/shared';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "../shared/src/**/*.{js,ts,jsx,tsx}",
    ],
    safelist: [
        // ========== ADMIN SIDEBAR COLORS (brand red) ==========
        // Active background
        'bg-brand-500/10',
        'dark:bg-brand-500/20',
        // Active text & icon
        'text-brand-600',
        'dark:text-brand-400',
        // Badge & indicator
        'bg-brand-600',
    ],
    theme: {
        extend: getBaseThemeExtension(),
    },
    plugins: [],
}
