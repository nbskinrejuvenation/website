import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Soft rose accent — luxury calm rebrand
        brand: {
          50: '#FAF6F4',
          100: '#F0E6E3',
          200: '#E5D4CF',
          300: '#D4B5AD',
          400: '#C49A8F',
          500: '#B8897E',
          600: '#9E6F65',
          700: '#825A52',
          800: '#6B4A44',
          900: '#563D38',
          950: '#3D2A26',
        },
        cream: {
          DEFAULT: '#FAF8F6',
          dark: '#F3EDE6',
        },
        sand: {
          DEFAULT: '#EBE3DA',
          dark: '#E0D5C9',
        },
        ink: {
          DEFAULT: '#2A2624',
          muted: '#6E6863',
          faint: '#9A948E',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(42, 38, 36, 0.08)',
        card: '0 2px 16px -2px rgba(42, 38, 36, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
