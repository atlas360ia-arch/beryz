import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        etsy: {
          primary: '#F1641E',
          'primary-light': '#F88D6E',
          'primary-dark': '#C84913',
          secondary: '#F3F3F1',
          'secondary-light': '#FAFAF8',
          'secondary-dark': '#E8E8E6',
          dark: '#222222',
          'dark-light': '#555555',
          gold: '#C8B100',
          'gold-light': '#DCC92F',
          'gold-dark': '#A68D00',
          success: '#228863',
          'success-light': '#3CA876',
          'success-dark': '#1A6B4F',
          gray: '#CCCCCC',
          'gray-light': '#E8E8E8',
          'gray-dark': '#999999',
          error: '#C73A3A',
          'error-light': '#E85A5A',
          'error-dark': '#A02C2C',
          info: '#0066CC',
          'info-light': '#3399FF',
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
