import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        mono: ['JetBrains Mono', ...fontFamily.mono],
      },
      colors: {
        // App chrome
        surface: {
          DEFAULT: '#0a0a0a',
          raised: '#0d0d0d',
          overlay: '#111111',
          border: 'rgba(255,255,255,0.06)',
        },
        // Brand
        brand: {
          DEFAULT: '#6366f1', // indigo-500
          muted: 'rgba(99,102,241,0.15)',
          border: 'rgba(99,102,241,0.3)',
        },
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.06)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-cross-fade': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.2s ease-out',
        'cross-fade': 'slide-cross-fade 0.4s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config
