/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Lora', 'Georgia', 'serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },
      colors: {
        navy: {
          50:  '#f4f6fb',
          100: '#e8edf5',
          200: '#c2d0e6',
          300: '#8ba4c8',
          400: '#5b77a8',
          500: '#3b5280',
          600: '#2d4068',
          700: '#253352',
          800: '#1e2a45',
          900: '#0f172a',
          950: '#0a0f1e',
        },
      },
      boxShadow: {
        card: '0 2px 12px rgba(30,58,110,0.08)',
        'card-hover': '0 4px 24px rgba(30,58,110,0.14)',
        modal: '0 20px 60px rgba(10,15,30,0.3)',
      },
    },
  },
  plugins: [],
}
