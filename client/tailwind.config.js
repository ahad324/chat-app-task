/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        takeoff: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0)' },
          '25%': { transform: 'translate(2px, -2px) rotate(5deg)' },
          '75%': { transform: 'translate(-2px, 2px) rotate(-5deg)' },
        }
      },
      animation: {
        takeoff: 'takeoff 0.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}