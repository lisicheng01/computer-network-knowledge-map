/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        panel: "#f8fafc",
      },
      boxShadow: {
        selected: "0 0 0 3px rgba(59, 130, 246, 0.20)",
      },
    },
  },
  plugins: [],
};
