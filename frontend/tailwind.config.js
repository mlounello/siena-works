/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "siena-green": "#006B54",
        "siena-darkGreen": "#1B4932",
        "siena-gold": "#FCC917",
        "siena-white": "#FFFFFF",
        "siena-bg": "#F5F5F2",
      },
      fontFamily: {
        sans: ["Gudea", "sans-serif"],
        serif: ["Merriweather", "serif"],
        display: ["Oswald", "sans-serif"],
      },
    },
  },
  plugins: [],
};