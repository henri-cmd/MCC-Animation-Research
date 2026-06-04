import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#14110F', // near-black background
          900: '#14110F',
          800: '#1B1714',
          700: '#241F1B',
          600: '#2F2925',
          500: '#3D352F',
        },
        bone: '#F3EDE3', // warm off-white for body text
        ash: '#A89F94', // muted label text
        // The maturity spectrum (young -> old), also defined in src/lib/spectrum.ts
        spectrum: {
          1: '#E8A33D',
          2: '#EE7A47',
          3: '#5FA862',
          4: '#3690C9',
          5: '#6655C9',
          6: '#9B6FD6',
          7: '#D6457A',
          8: '#E0552B',
          9: '#C0392B',
        },
      },
      fontFamily: {
        display: ['Anton', 'Impact', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
        body: ['"Archivo"', 'Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'bar-in': {
          '0%': { opacity: '0', transform: 'translateX(-12px) scaleX(0.92)' },
          '100%': { opacity: '1', transform: 'translateX(0) scaleX(1)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'drawer-in': {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'bar-in': 'bar-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.4s ease both',
        'drawer-in': 'drawer-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
} satisfies Config
