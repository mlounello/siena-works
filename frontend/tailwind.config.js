/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        sienagreen: "#006B54",
        darkgreen: "#1B4932",
        gold: "#FCC917",
        offwhite: "#f8f8f8",
      },
      fontFamily: {
        serif: ["Merriweather", "serif"],
        sans: ["Oswald", "sans-serif"],
      },
    },
  },
  plugins: [],
}