/** @type {import('tailwindcss').Config} */
export default {
  // THIS IS THE SECRET SAUCE:
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}