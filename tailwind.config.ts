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
          bg: '#eaf0ee',
          'bg-dark': '#dbe5e2',
          'bg-darker': '#c8d8d4',
          text: '#07272c',
          'text-muted': '#606060',
          heading: '#005338',
          primary: '#f6b540',
          'primary-hover': '#e5a430',
          border: 'rgba(7, 39, 44, 0.1)',
          'border-strong': 'rgba(7, 39, 44, 0.2)',
          sidebar: '#d4e0dc',
          'sidebar-active': '#b8cec9',
          card: '#ffffff',
          success: '#22863a',
          warning: '#f6b540',
          error: '#d73a49',
          info: '#0075ca',
        },
      },
      fontFamily: {
        sans: ['var(--font-cera)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.8rem',
        md: '1.6rem',
        lg: '2.4rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(7, 39, 44, 0.08), 0 1px 2px rgba(7, 39, 44, 0.04)',
        'card-hover': '0 4px 12px rgba(7, 39, 44, 0.12), 0 2px 4px rgba(7, 39, 44, 0.06)',
        modal: '0 20px 60px rgba(7, 39, 44, 0.2)',
      },
      fontSize: {
        'hero': ['6.4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['4.8rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'heading-xl': ['3.6rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'heading-lg': ['2.8rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'heading-md': ['2.2rem', { lineHeight: '1.3' }],
        'heading-sm': ['1.8rem', { lineHeight: '1.35' }],
        'body-lg': ['1.6rem', { lineHeight: '1.6' }],
        'body': ['1.4rem', { lineHeight: '1.6' }],
        'body-sm': ['1.2rem', { lineHeight: '1.5' }],
        'label': ['1.1rem', { lineHeight: '1.4', letterSpacing: '0.08em' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
