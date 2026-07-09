/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["SF Pro Text", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["SF Pro Display", "SF Pro Text", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Menlo", "monospace"],
      },
      fontSize: {
        'hero': ['56px', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '700' }],
        'page-title': ['40px', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'section-title': ['28px', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '600' }],
        'card-title': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.7', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '1.7', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        'label': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      colors: {
        velness: {
          purple: {
            50: '#F5F3FF',
            100: '#EDE9FE',
            200: '#DDD6FE',
            300: '#C4B5FD',
            400: '#A78BFA',
            500: '#8B5CF6',
            600: '#7C3AED',
            700: '#6D28D9',
            800: '#5B21B6',
            900: '#4C1D95',
          },
          cyan: {
            50: '#ECFEFF',
            100: '#CFFAFE',
            200: '#A5F3FC',
            300: '#67E8F9',
            400: '#22D3EE',
            500: '#06B6D4',
            600: '#0891B2',
            700: '#0E7490',
            800: '#155E75',
            900: '#164E63',
          },
          glass: {
            light: 'rgba(255, 255, 255, 0.7)',
            medium: 'rgba(255, 255, 255, 0.5)',
            dark: 'rgba(15, 10, 26, 0.7)',
            border: 'rgba(255, 255, 255, 0.2)',
          },
        },
        background: {
          primary: 'var(--background-primary)',
          secondary: 'var(--background-secondary)',
        },
        surface: {
          primary: 'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
        border: {
          default: 'var(--border-default)',
        },
        brand: {
          primary: 'var(--brand-primary)',
          secondary: 'var(--brand-secondary)',
          contrastText: 'var(--brand-contrastText)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
      backgroundColor: {
        'app-dark': '#0B0B12',
        'app-light': '#F8FAFF',
      },
      borderRadius: {
        'glass': '16px',
        'glass-sm': '12px',
        'glass-lg': '24px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [],
}
