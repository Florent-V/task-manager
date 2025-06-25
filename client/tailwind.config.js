/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  darkMode: 'selector',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [typography],
}

