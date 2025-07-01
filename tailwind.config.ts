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
        },
        secondary: {
          500: '#C5283D', // Red for headers, notifications
        },
        surface: {
          card: '#EEE5E9', // Card backgrounds
        }
      },
    },
  },
  plugins: [],
}
export default config
