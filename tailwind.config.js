/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        microsoft: {
          blue: '#0078D4',
          'blue-hover': '#106EBE',
          'blue-light': '#00BCF2',
          dark: '#0F1419',
          card: '#1B1F23',
          border: '#252A2E',
        }
      },
      fontFamily: {
        'segoe': ['Segoe UI', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      animation: {
        'microsoft-pulse': 'microsoftPulse 2s ease-in-out infinite',
        'microsoft-float': 'microsoftFloat 6s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};