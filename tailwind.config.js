/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#173D36',
        sand: '#C5AF8B',
        ivory: '#F7F5F0',
        stone: '#EAE6DE',
        graphite: '#202523',
        muted: '#656A67',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Manrope', 'Arial', 'sans-serif'],
      },
      maxWidth: {
        site: '84rem',
      },
    },
  },
  plugins: [],
};
