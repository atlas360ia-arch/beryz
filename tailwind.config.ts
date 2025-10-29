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
    },
  },
  plugins: [],
}

export default config
