import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        fics: {
          bg: '#ffffff',
          'bg-dark': '#f4f4f5',
          'bg-darker': '#e4e4e7',
          text: '#09090b',
          'text-muted': '#71717a',
          heading: '#18181b',
          primary: '#f59e0b',
          'primary-hover': '#d97706',
          border: 'rgba(0, 0, 0, 0.08)',
          'border-strong': 'rgba(0, 0, 0, 0.14)',
          sidebar: '#fafafa',
          'sidebar-active': '#e4e4e7',
          card: '#ffffff',
          success: '#16a34a',
          warning: '#d97706',
          error: '#dc2626',
          info: '#2563eb',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
      },
      boxShadow: {
        card: '0 0 0 1px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 0 0 1px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08)',
        modal: '0 0 0 1px rgba(0, 0, 0, 0.08), 0 24px 64px rgba(0, 0, 0, 0.16)',
      },
      fontSize: {
        'hero': ['6.4rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display': ['4.8rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        'heading-xl': ['3.2rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'heading-lg': ['2.4rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        'heading-md': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'heading-sm': ['1.6rem', { lineHeight: '1.35', letterSpacing: '-0.005em' }],
        'body-lg': ['1.5rem', { lineHeight: '1.6' }],
        'body': ['1.4rem', { lineHeight: '1.6' }],
        'body-sm': ['1.2rem', { lineHeight: '1.5' }],
        'label': ['1.1rem', { lineHeight: '1.4', letterSpacing: '0.06em' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(8px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
