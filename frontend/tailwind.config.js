/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0ecff',
          200: '#b9d5ff',
          300: '#7cb5ff',
          400: '#388eff',
          500: '#0b66fe',
          600: '#004ee6',
          700: '#003dbb',
          800: '#043497',
          900: '#0a2e76',
          950: '#071c4c',
        },
        slate: {
          850: '#151f32',
          950: '#0b1120'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
        'glow': '0 0 20px -2px rgba(11, 102, 254, 0.35)',
      }
    },
  },
  plugins: [],
}
