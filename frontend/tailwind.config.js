/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#7c3aed",
        danger: "#dc2626",
        safe: "#16a34a",
      },
    },
  },
  plugins: [],
};
