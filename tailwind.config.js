/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0f',
        parchment: '#e8e3d3',
        crimson: '#c4322b',
        gold: '#d4af37',
        teal: '#5fb3a1',
        ash: '#1c1c24',
        bone: '#3a3a44',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(212, 175, 55, 0.35)',
        crimson: '0 0 24px rgba(196, 50, 43, 0.35)',
      },
      keyframes: {
        flash: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        flash: 'flash 0.3s ease-out forwards',
        pulseSoft: 'pulseSoft 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
