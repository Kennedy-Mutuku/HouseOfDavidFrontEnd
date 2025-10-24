/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Black & White Foundation
        black: {
          DEFAULT: '#1A1A1A',
          soft: '#2C2C2C',
        },
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#404040',
          800: '#2C2C2C',
          900: '#1A1A1A',
        },
        // Brand Accent: Purple
        purple: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B4CB1', // Light purple
          600: '#6B2C91', // Primary brand purple
          700: '#4A1D66', // Dark purple
          800: '#3A1552',
          900: '#2A0F3D',
        },
        // Brand Accent: Gold
        gold: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#D4AF37', // Primary brand gold
          600: '#C89B3C',
          700: '#B8941F',
          800: '#A07C1A',
          900: '#856515',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
