/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',     // Pure White
        surface: '#F8F9FA',      // Icy Off-White for subtle sectioning
        obsidian: '#111111',     // Near Black for heavy high-contrast headings
        slate: '#666666',        // Medium Gray for elegant readable paragraphs
        champagne: '#C9A84C',    // Elegant gold accent remains
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
