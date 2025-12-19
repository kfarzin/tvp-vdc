/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#1a1b26',
          100: '#24283b',
          200: '#2f3549',
          300: '#3d4461',
          400: '#565f89',
          500: '#7aa2f7',
          600: '#89b4fa',
          700: '#a9c1ff',
          800: '#c0caf5',
          900: '#cdd6f4',
          950: '#e6e9ff',
        },
        secondary: {
          50: '#0a0f1a',
          100: '#0d1929',
          200: '#12263d',
          300: '#163352',
          400: '#19457d',
          500: '#19457d',
          600: '#1e5296',
          700: '#2563af',
          800: '#3b82f6',
          900: '#60a5fa',
          950: '#93c5fd',
        },
        accent: {
          50: '#1a1f2e',
          100: '#2a3447',
          200: '#394b61',
          300: '#f38ba8',
          400: '#f5c2e7',
          500: '#89dceb',
          600: '#94e2d5',
          700: '#a6e3a1',
          800: '#b4e6a6',
          900: '#c6f0c6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
