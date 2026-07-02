/**
 * Neeva AI Design System — Design Tokens
 *
 * Centralised design tokens for typography, spacing, radius, shadows, and motion.
 * These values are the source of truth for the design system.
 * All components must reference these tokens — never hardcode values.
 */

export const typography = {
  fontFamily: {
    sans: 'SF Pro Text',
    display: 'SF Pro Display',
    mono: 'JetBrains Mono',
  },
  fontSize: {
    hero: 56,
    'page-title': 40,
    'section-title': 28,
    'card-title': 20,
    'body-lg': 18,
    body: 16,
    'body-sm': 14,
    caption: 13,
    label: 12,
  },
  lineHeight: {
    hero: 1.1,
    'page-title': 1.15,
    'section-title': 1.2,
    'card-title': 1.3,
    'body-lg': 1.7,
    body: 1.7,
    'body-sm': 1.6,
    caption: 1.5,
    label: 1.4,
  },
  fontWeight: {
    hero: '700' as const,
    'page-title': '700' as const,
    'section-title': '600' as const,
    'card-title': '600' as const,
    'body-lg': '400' as const,
    body: '400' as const,
    'body-sm': '400' as const,
    caption: '400' as const,
    label: '500' as const,
  },
  letterSpacing: {
    hero: -0.03,
    'page-title': -0.02,
    'section-title': -0.015,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
  section: 40,
  '5xl': 64,
  '6xl': 80,
  '7xl': 96,
  '8xl': 120,
} as const;

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
  glass: 16,
  'glass-sm': 12,
  'glass-lg': 24,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  glass: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

export const gradients = {
  primary: ['#8B5CF6', '#06B6D4'] as const,
  purple: ['#7C3AED', '#A78BFA'] as const,
  cyan: ['#06B6D4', '#22D3EE'] as const,
  warm: ['#8B5CF6', '#F472B6'] as const,
  calm: ['#6366F1', '#06B6D4'] as const,
} as const;

export const motion = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeInOut: [0.4, 0, 0.2, 1] as const,
    easeOut: [0, 0, 0.2, 1] as const,
    easeIn: [0.4, 0, 1, 1] as const,
    spring: { damping: 15, stiffness: 200, mass: 1 } as const,
  },
} as const;

export const zIndex = {
  base: 0,
  elevated: 10,
  dropdown: 100,
  modal: 200,
  overlay: 300,
  toast: 400,
  tooltip: 500,
} as const;

export const opacity = {
  disabled: 0.4,
  hint: 0.6,
  medium: 0.7,
  high: 0.9,
  full: 1,
} as const;

export default {
  typography,
  spacing,
  borderRadius,
  shadows,
  gradients,
  motion,
  zIndex,
  opacity,
};
