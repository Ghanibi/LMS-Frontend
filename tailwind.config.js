/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        figmaDark: '#0F2854',
        figmaBlue: '#1C4D8D',
        figmaLight: '#4988C4',
      },
    },
  },
  plugins: [],
}