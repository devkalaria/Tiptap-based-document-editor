/**
 * Tailwind CSS
 * @type {import('tailwindcss').Config}
 */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        page: '#ffffff',
        background: '#f3f4f6',
        ink: '#111827',
      },
      boxShadow: {
        page: '0 1px 2px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.08)'
      }
    },
  },
  plugins: [],
};
