/**
 * Velness Design System — Color Palette
 *
 * Dark theme is the default for Velness.
 * Light theme tokens are included for future use.
 */

export const colors = {
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
    highlight: 'rgba(255, 255, 255, 0.1)',
  },
  surface: {
    dark: '#0F0A1A',
    light: '#F8FAFF',
    card: '#1A1428',
    elevated: '#221D33',
  },
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.4)',
    accent: '#8B5CF6',
    link: '#22D3EE',
  },
  status: {
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#38BDF8',
  },
} as const;

export type ColorKey = keyof typeof colors;
