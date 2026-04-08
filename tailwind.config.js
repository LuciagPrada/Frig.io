/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          header: '#99C2B9',
          light: '#b8d8d1',
          dark: '#7aaba0',
        },
        navy: {
          DEFAULT: '#0F172A',
          dark: '#060d1a',
        },
        bg: {
          DEFAULT: '#F1F5F9',
          card: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'General Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
