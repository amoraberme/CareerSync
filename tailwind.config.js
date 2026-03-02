/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        surface: 'hsl(var(--card))',
        obsidian: 'hsl(0 0% 5%)',
        slate: 'hsl(0 0% 15%)',
        champagne: 'hsl(40 40% 60%)',

        // Exact original dark mode theme mappings for backward compatibility
        darkBg: 'hsl(0 0% 0%)',
        darkCard: 'hsl(0 0% 5%)',
        darkText: 'hsl(0 0% 100%)',
      },
      boxShadow: {
        'depth-card': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
        'depth-card-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8), 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'depth-sunken': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        'depth-sunken-light': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      },
      transitionTimingFunction: {
        'physical': 'cubic-bezier(0.68, -0.55, 0.26, 1.55)', // Bouncy elastic
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        drama: ['"Playfair Display"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        tightest: '-.075em',
        tighter: '-.05em',
        tight: '-.025em',
        normal: '0',
      }
    },
  },
  plugins: [],
}
