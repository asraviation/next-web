/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Make Tailwind's font-sans use Raleway everywhere by default
        sans: ['var(--font-raleway)', 'system-ui', 'sans-serif'],
        // Utility for Aboreto (use where needed)
        aboreto: ['var(--font-aboreto)', 'cursive'],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
