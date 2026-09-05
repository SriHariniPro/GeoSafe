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
        navy: {
          950: '#060b13',
          900: '#0a1120',
          850: '#0f182e',
          800: '#14213d',
          700: '#1d2d50',
          600: '#2c3e66',
        },
        risk: {
          low: '#10b981',      # Emerald green
          medium: '#f59e0b',   # Amber yellow
          high: '#f97316',     # Vibrant orange
          critical: '#ef4444', # Crimson red
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
