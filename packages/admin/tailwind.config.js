/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // 🔴 Cherry Red — Brand primary (Admin)
                cherry: {
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
                // 🟢 Lime Green — Admin secondary + action color (Front sidebar active)
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
                // 🎨 Brand colors
                brand: {
                    50: '#FBDDE4',
                    100: '#FBDDE4',
                    500: '#E54063',
                    600: '#C9334F',
                },
            },
            fontFamily: {
                display: ['Inter', 'Noto Sans Thai', 'sans-serif'],
                sans: ['Roboto', 'Noto Sans Thai', 'sans-serif'],
                accent: ['Inter', 'Noto Sans Thai', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
