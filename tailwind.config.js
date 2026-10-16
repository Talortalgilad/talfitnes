/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#5B8A72', hover: '#4A7360', soft: '#E8F0EC' },
        bg: '#FAFAF7',
        ink: { DEFAULT: '#1F2937', soft: '#6B7280' },
        escrow: { DEFAULT: '#D97706', soft: '#FEF3C7' },
        ok: '#16A34A',
        bad: '#DC2626',
      },
      fontFamily: { sans: ['Heebo', 'system-ui', 'sans-serif'] },
      boxShadow: { soft: '0 4px 20px rgba(31,41,55,0.08)' },
    },
  },
  plugins: [],
};
