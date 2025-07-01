import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#FDF351', // Yellow for buttons, ticks
          600: '#FDF235', // Darker yellow for hover states
        },
        secondary: {
          500: '#C5283D', // Red for headers, notifications
          600: '#A61E30', // Darker red for hover states
        },
        surface: {
          card: '#EEE5E9', // Card backgrounds
        }
      },
      // Optimize for PWA touch interfaces
      spacing: {
        '18': '4.5rem', // 72px - Good for touch targets
      },
      // Add safe area insets for PWA
      padding: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
  // Optimize CSS purging for production builds
  safelist: [
    // Keep utility classes that might be used dynamically
    'bg-primary-500',
    'bg-primary-600', 
    'bg-secondary-500',
    'bg-secondary-600',
    'bg-green-500',
    'text-green-600',
  ],
  plugins: [],
}
export default config
