/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['Inter', 'Noto Sans Thai', 'sans-serif'],
                sans: ['Roboto', 'Noto Sans Thai', 'sans-serif'],
                accent: ['Inter', 'Noto Sans Thai', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
