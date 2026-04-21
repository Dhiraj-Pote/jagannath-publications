/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light theme: warm parchment
        parchment: {
          50:  '#fdfbf7',
          100: '#faf6ee',
          200: '#f3ecdb',
          300: '#e8ddc4',
          400: '#d4c4a0',
        },
        // Deep maroon
        maroon: {
          50:  '#fdf2f1',
          100: '#f5d5d2',
          200: '#d4847b',
          300: '#a85a52',
          400: '#8b3e36',
          500: '#6b2920',
          600: '#4a1c15',
          700: '#2a100a',
          800: '#1a0906',
          900: '#0d0403',
        },
        // Orange accent (CTAs from Canva)
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',  // primary orange (EXPLORE BOOKS, Add to Bag)
          600: '#ea580c',
          700: '#c2410c',
        },
        // Saffron / gold
        saffron: {
          50:  '#fdf9ef',
          100: '#f5ecd4',
          200: '#e8d5a8',
          300: '#d4b87a',
          400: '#c9a96e',
          500: '#a68b4b',
          600: '#876f3a',
        },
        // Peacock
        peacock: {
          50:  '#eef9f7',
          100: '#c8ece6',
          200: '#7ecbbe',
          300: '#3aaa98',
          400: '#1a7a6b',
          500: '#0e5c53',
          600: '#093d38',
        },
      },
      fontFamily: {
        display: ['Gatwick', 'Georgia', 'serif'],
        body:    ['Gatwick', 'Georgia', 'serif'],
        sans:    ['Gatwick', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
