/**
 * Velness — Dark Theme Tokens
 *
 * Single source of truth for the dark theme. Tuned so surfaces keep clear
 * separation (no "muddy" confusion) and text stays comfortably above the
 * ~4.5:1 AA threshold against its background — fixing previously "faded"
 * text. Brand is brightened for pop on near-black surfaces.
 */

import type { ThemeTokens } from './light';

export const darkTheme: ThemeTokens = {
  background: {
    primary: '#0B0B12',
    secondary: '#12121C',
    tertiary: '#181826',
  },
  surface: {
    primary: '#16161F',
    secondary: '#1C1C28',
    tertiary: '#23232F',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#C3C9D4',
    tertiary: '#9AA3B2',
    disabled: '#6B7280',
    onBrand: '#FFFFFF',
    inverse: '#0B0B12',
  },
  border: {
    default: 'rgba(255, 255, 255, 0.10)',
    strong: 'rgba(255, 255, 255, 0.18)',
    subtle: 'rgba(255, 255, 255, 0.05)',
  },
  brand: {
    primary: '#7E60CD',
    secondary: '#9F8BE6',
    contrastText: '#FFFFFF',
    subtle: 'rgba(126, 96, 205, 0.16)',
    border: 'rgba(126, 96, 205, 0.45)',
  },
  overlay: 'rgba(0, 0, 0, 0.62)',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  successSubtle: 'rgba(52, 211, 153, 0.14)',
  warningSubtle: 'rgba(251, 191, 36, 0.14)',
  dangerSubtle: 'rgba(248, 113, 113, 0.14)',
  successText: '#6EE7B7',
  warningText: '#FCD34D',
  dangerText: '#FCA5A5',
};
