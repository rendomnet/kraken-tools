/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background, #0a0c10)',
        foreground: 'var(--foreground, #f8fafc)',
        card: {
          DEFAULT: 'var(--card, rgba(15, 23, 42, 0.45))',
          foreground: 'var(--card-foreground, #f8fafc)',
        },
        popover: {
          DEFAULT: 'var(--popover, rgba(15, 23, 42, 0.95))',
          foreground: 'var(--popover-foreground, #f8fafc)',
        },
        primary: {
          DEFAULT: 'var(--kraken-accent, #38bdf8)',
          foreground: 'var(--primary-foreground, #ffffff)',
        },
        secondary: {
          DEFAULT: 'var(--secondary, rgba(255, 255, 255, 0.06))',
          foreground: 'var(--secondary-foreground, #cbd5e1)',
        },
        muted: {
          DEFAULT: 'var(--muted, rgba(255, 255, 255, 0.04))',
          foreground: 'var(--muted-foreground, #94a3b8)',
        },
        accent: {
          DEFAULT: 'var(--accent, rgba(255, 255, 255, 0.08))',
          foreground: 'var(--accent-foreground, #f8fafc)',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        border: 'var(--border, rgba(255, 255, 255, 0.08))',
        input: 'var(--input, rgba(0, 0, 0, 0.3))',
        ring: 'var(--kraken-accent, #38bdf8)',
      },
      borderRadius: {
        lg: '14px',
        md: '8px',
        sm: '5px',
      },
      fontFamily: {
        title: ['Cinzel', 'serif'],
        sans: ['var(--font-family-sans, Outfit)', 'Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
