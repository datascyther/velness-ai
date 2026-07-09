/**
 * Velness — Light Theme Tokens
 *
 * This file is the SINGLE SOURCE OF TRUTH for the light theme.
 * `global.css` and the runtime CSS-variable injection in ThemeProvider
 * both derive from these values, so Tailwind classes and inline
 * `useTheme().colors` usage can never drift apart.
 *
 * Contrast is tuned for WCAG AA on every text/surface pairing.
 */

export interface ThemeTokens {
  /** App / screen backgrounds */
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  /** Cards, sheets, elevated containers */
  surface: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  /** All text colors */
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    /** Text drawn on top of a brand/colored fill */
    onBrand: string;
    /** Text drawn on top of a dark overlay (e.g. scrims) */
    inverse: string;
  };
  /** Border / divider weights */
  border: {
    default: string;
    strong: string;
    subtle: string;
  };
  /** Brand ramp */
  brand: {
    primary: string;
    secondary: string;
    contrastText: string;
    /** Tinted fill behind brand icons / chips */
    subtle: string;
    /** Border tint for brand outlines */
    border: string;
  };
  /** Translucent scrim used for modals / overlays */
  overlay: string;
  /** Status colors */
  success: string;
  warning: string;
  danger: string;
  /** Soft background tints for status surfaces */
  successSubtle: string;
  warningSubtle: string;
  dangerSubtle: string;
  /** Status text on subtle tints */
  successText: string;
  warningText: string;
  dangerText: string;
}

export const lightTheme: ThemeTokens = {
  background: {
    primary: '#F7F8FC',
    secondary: '#EEF1F7',
    tertiary: '#E4E8F0',
  },
  surface: {
    primary: '#FFFFFF',
    secondary: '#F4F6FB',
    tertiary: '#EAEEF6',
  },
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    tertiary: '#64748B',
    disabled: '#94A3B8',
    onBrand: '#FFFFFF',
    inverse: '#F8FAFC',
  },
  border: {
    default: '#E2E8F0',
    strong: '#CBD5E1',
    subtle: '#EEF2F7',
  },
  brand: {
    primary: '#634EB8',
    secondary: '#8063D6',
    contrastText: '#FFFFFF',
    subtle: 'rgba(99, 78, 184, 0.10)',
    border: 'rgba(99, 78, 184, 0.35)',
  },
  overlay: 'rgba(15, 23, 42, 0.45)',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  successSubtle: 'rgba(22, 163, 74, 0.12)',
  warningSubtle: 'rgba(217, 119, 6, 0.12)',
  dangerSubtle: 'rgba(220, 38, 38, 0.12)',
  successText: '#15803D',
  warningText: '#B45309',
  dangerText: '#B91C1C',
};
