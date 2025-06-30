/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '475px',
        // Keep default mobile-first breakpoints
        // sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
      },
      colors: {
        // Replace current blue primary with yellow/red system
        primary: {
          50: '#FFFDDB',
          100: '#FFFCC2',
          200: '#FFF895',
          300: '#FFF567',
          400: '#FEF24A',
          500: '#FDF351',
          600: '#E1D935',
          700: '#BFB327',
          800: '#9B9119',
          900: '#756B0E',
        },
        secondary: {
          50: '#FFE5E8',
          100: '#FFC8CF',
          200: '#FFA4B0',
          300: '#FF7D90',
          400: '#F95E79',
          500: '#C5283D',
          600: '#A01E32',
          700: '#7A1627',
          800: '#55101C',
          900: '#330A12',
        },
        surface: {
          base: '#FFFCFF',
          card: '#EEE5E9',
          stroke: '#D9CED3',
        },
        foreground: {
          DEFAULT: '#000500',
          muted: '#444A50',
        },
        utility: {
          success: '#24C78E',
          warning: '#FFB648',
          error: '#E03E52',
        },
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        '18': '4.5rem',
        '88': '22rem',
      },
      minHeight: {
        touch: '48px', // Update from current 44px
      },
      minWidth: {
        touch: '48px', // Update from current 44px
      },
      fontSize: {
        touch: ['1rem', { lineHeight: '1.5' }],
      },
      animation: {
        'bounce-subtle': 'bounce 1s ease-in-out 1',
        'scale-tap': 'scale-tap 0.1s ease-in-out',
        'fade-in': 'fadeIn 0.15s ease-out',
        'fade-out': 'fadeOut 0.15s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-in',
        'success-pulse': 'successPulse 0.6s ease-out',
        shake: 'shake 0.5s ease-in-out',
      },
      keyframes: {
        'scale-tap': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        successPulse: {
          '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(253, 243, 81, 0.7)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 10px rgba(253, 243, 81, 0)' },
          '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(253, 243, 81, 0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
      },
    },
  },
  plugins: [],
}
