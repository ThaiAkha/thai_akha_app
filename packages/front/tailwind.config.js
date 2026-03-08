/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🎨 BRAND IDENTITY (Ora supportano tutti l'opacità!)
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        action: 'rgb(var(--color-action) / <alpha-value>)',
        special: 'rgb(var(--color-special) / <alpha-value>)',
        
        // 🌟 SPECIAL CHANNELS
        allergy: 'rgb(var(--color-allergy) / <alpha-value>)',
        'allergy-secondary': 'rgb(var(--color-allergy-secondary) / <alpha-value>)',
        quiz: 'rgb(var(--color-quiz) / <alpha-value>)',

        // ☀️ LAYERS SEMANTICI
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
      boxShadow: {
        // Ho corretto la sintassi RGBA che aveva spazi misti a virgole
        'brand-glow': '0 15px 30px -5px rgba(224, 0, 134, 0.4)',
        'action-glow': '0 15px 30px -5px rgba(152, 201, 60, 0.4)',
        'badge-glow': '0 8px 16px -4px rgba(224, 0, 134, 0.2)',
        'card-hover': '0 0 40px rgba(255, 117, 151, 0.4)',
        'glow-special': '0 0 20px -5px rgba(255, 109, 0, 0.5)',
        'glow-allergy': '0 0 25px -5px rgba(255, 109, 0, 0.5)',
      },
      transitionTimingFunction: {
        'cinematic': 'var(--ease-cinematic)',
        'elastic': 'var(--ease-elastic)', // Aggiunto per coerenza con CSS
      },
      animation: {
        'fade-slide-down': 'fade-slide-down 0.9s ease-out both',
        'fade-slide-up': 'fade-slide-up 0.9s ease-out both',
        'pulse-slow': 'pulse-slow 10s ease-in-out infinite',
        'flash': 'flash 0.6s ease-out forwards',
        'icon-pulse': 'icon-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'mic-listening': 'mic-listening 1.5s ease-in-out infinite',
        'shine': 'shine 4s infinite linear',
        'shine-oblique': 'shine-oblique 4s infinite linear',
      },
      keyframes: {
        'fade-slide-down': {
          '0%': { opacity: 0, transform: 'translateY(-3rem)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-slide-up': {
          '0%': { opacity: 0, transform: 'translateY(3rem)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%': { opacity: 0.6, transform: 'scale(1.1)' },
        },
        'flash': {
          '0%': { opacity: 0, transform: 'translateX(-100%) skewX(-15deg)' },
          '50%': { opacity: 1 },
          '100%': { opacity: 0, transform: 'translateX(100%) skewX(-15deg)' }
        },
        'icon-pulse': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.7, transform: 'scale(0.95)' },
        },
        'mic-listening': {
          '0%': { boxShadow: '0 0 0 0 rgba(227, 31, 51, 0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(227, 31, 51, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(227, 31, 51, 0)' },
        },
        'shine': {
          '0%': { left: '-100%' },
          '100%': { left: '200%' }
        },
        'shine-oblique': {
           '0%': { left: '-150%' },
           '20%': { left: '150%' },
           '100%': { left: '150%' }
        }
      },
    },
  },
  plugins: [],
};