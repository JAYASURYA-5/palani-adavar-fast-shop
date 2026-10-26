/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#d97706', // Premium Gold / Amber accent
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
          950: '#260e02',
        },
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#8b5cf6',
          500: '#7c3aed', // Premium Violet / Deep Purple accent
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3b1679',
          950: '#220b4d',
        },
        darkBg: '#0d0b1a',
        darkCard: '#160f2e',
        darkBorder: '#2a1f4e',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.06)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
