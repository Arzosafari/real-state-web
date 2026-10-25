/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#102B20',
        evergreen: '#0B1B16',
        midnight: '#102C3B',
        ivory: '#F5F2EA',
        soft: '#FCFBF7',
        gold: '#B6A06A',
        'gold-deep': '#9C8654',
        warmgray: '#8A8981',
        ink: '#17221E',
        mist: '#E4E7E1',
      },
      borderColor: {
        hairline: 'rgba(182,160,106,0.35)',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      letterSpacing: {
        label: '0.18em',
        wide2: '0.32em',
      },
      maxWidth: {
        shell: '78rem',
        prose: '38rem',
      },
      transitionDuration: {
        base: '220ms',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        rise: 'rise 520ms cubic-bezier(0.22, 0.61, 0.36, 1) both',
        fade: 'fade 700ms ease-out both',
      },
    },
  },
  plugins: [],
}
