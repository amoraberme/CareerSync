/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF8F5',
        surface: '#FFFFFF',
        obsidian: '#0D0D12',
        slate: '#2A2A35',
        champagne: '#C9A84C', // Elegant accent
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
