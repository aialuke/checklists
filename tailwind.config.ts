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
      // Fluid typography with clamp-based sizing
      fontSize: {
        'fluid-sm': 'clamp(0.875rem, 2.5vw, 1rem)',
        'fluid-base': 'clamp(1rem, 3vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 3.5vw, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 4vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 5vw, 2.25rem)',
        'fluid-3xl': 'clamp(1.875rem, 6vw, 3rem)',
      },
    },
  },
  // Optimize CSS purging for production builds
  safelist: [
    // Existing classes
    'bg-primary-500',
    'bg-primary-600', 
    'bg-secondary-500',
    'bg-secondary-600',
    'bg-green-500',
    'text-green-600',
    
    // CRITICAL: Missing dynamic classes from template literals
    'bg-green-100', 'text-green-800',      // Status badges - checklist-grid.tsx:94
    'bg-yellow-100', 'text-yellow-800',    // Progress badges - checklist-grid.tsx:96  
    'bg-gray-100', 'text-gray-800',        // Default badges - checklist-grid.tsx:97
    'border-green-200', 'bg-green-50',     // Completed task cards - checklist-detail.tsx:123
    'bg-gray-200', 'text-gray-400',        // Incomplete checkboxes - checklist-detail.tsx:131
    'text-gray-500', 'line-through',       // Completed task text - checklist-detail.tsx:140
    'text-gray-900', 'text-white',         // Task states
    
    // Responsive grid patterns (for container queries)
    '@sm:grid-cols-2', '@md:grid-cols-3', '@lg:grid-cols-4',
    '@sm:text-lg', '@md:text-xl', '@lg:text-2xl'
  ],
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
}
export default config
