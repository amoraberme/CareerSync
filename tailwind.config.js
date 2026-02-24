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
        background: 'rgb(var(--color-background) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        obsidian: 'rgb(var(--color-obsidian) / <alpha-value>)',
        slate: 'rgb(var(--color-slate) / <alpha-value>)',
        champagne: 'rgb(var(--color-champagne) / <alpha-value>)',

        // Exact original dark mode theme (pre-Snow White)
        darkBg: '#0D0D12',     // Original 'obsidian'
        darkCard: '#2A2A35',   // Original 'slate'
        darkText: '#FFFFFF',   // Original 'surface'
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
