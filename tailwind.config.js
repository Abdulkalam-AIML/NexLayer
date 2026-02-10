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
        nex: {
          black: '#000000',
          dark: '#030303',
          purple: '#A855F7',
          neon: '#D946EF',
          cyan: '#06B6D4',
          white: '#FFFFFF',
          gray: '#94A3B8',
        }
      },
      // Triggering style rebuild for all ports
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(168, 85, 247, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.6), 0 0 10px rgba(168, 85, 247, 0.4)' },
        }
      }
    },
  },
  plugins: [],
}
