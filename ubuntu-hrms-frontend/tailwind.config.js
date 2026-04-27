/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode colors
        'primary': 'rgba(67, 112, 55, 1)',
        'primary-dark': 'rgba(50, 84, 41, 1)',
        'primary-light': 'rgba(96, 145, 83, 1)',
        'secondary': '#64748b',
        'success': '#10b981',
        'warning': 'rgba(211, 127, 55, 1)',
        'warning-dark': 'rgba(180, 105, 39, 1)',
        'warning-light': 'rgba(226, 156, 98, 1)',
        'danger': '#ef4444',
        'info': 'rgba(67, 112, 55, 1)',
        
        // Backgrounds
        'bg-light': '#ffffff',
        'bg-light-secondary': '#f8fafc',
        'bg-light-tertiary': '#f1f5f9',
        
        // Text
        'text-light': '#1e293b',
        'text-light-secondary': '#64748b',
        'text-light-tertiary': '#94a3b8',
        
        // Borders
        'border-light': '#e2e8f0',
        'border-light-dark': '#cbd5e1',
      },
      backgroundColor: {
        'light': '#ffffff',
        'light-secondary': '#f8fafc',
        'light-tertiary': '#f1f5f9',
        'dark': '#1e293b',
        'dark-secondary': '#0f172a',
        'dark-tertiary': '#334155',
      },
      textColor: {
        'light': '#1e293b',
        'light-secondary': '#64748b',
        'light-tertiary': '#94a3b8',
        'dark': '#f1f5f9',
        'dark-secondary': '#cbd5e1',
        'dark-tertiary': '#94a3b8',
      },
      borderColor: {
        'light': '#e2e8f0',
        'light-dark': '#cbd5e1',
        'dark': '#334155',
        'dark-light': '#475569',
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '2.5rem',
        '3xl': '3rem',
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
      },
      fontWeight: {
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },
      transitionDuration: {
        '150': '150ms',
        '300': '300ms',
        '500': '500ms',
      },
    },
  },
  plugins: [],
}
