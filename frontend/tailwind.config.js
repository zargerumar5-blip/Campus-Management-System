/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'admin-blue': '#1e40af',
        'faculty-indigo': '#4338ca',
        'student-emerald': '#047857',
      }
    },
  },
  plugins: [],
}