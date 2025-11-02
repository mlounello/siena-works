/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        siena: {
          green: "#006B54",
          darkGreen: "#1B4932",
          gold: "#FCC917",
          white: "#FFFFFF",
        },
      },
      fontFamily: {
        serif: ["Merriweather", "serif"],
        sans: ["Oswald", "sans-serif"],
      },
    },
  },
  plugins: [],
}