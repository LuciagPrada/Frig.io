/*
Copyright (C) 2026 Frigio
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program.  If not, see https://gnu.org.
*/

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
