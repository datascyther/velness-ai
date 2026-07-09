/**
 * Velness Design System — Design Tokens
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

/**
 * Typography system for the chat conversation.
 * Defines every text style used in messages — headings, body, supporting,
 * lists, quotes, code, links, emojis, and block labels.
 */
export const chatTypography = {
  /** AI message body — comfortable reading */
  bodyAI: { fontSize: 16, lineHeight: 26, fontWeight: '400' as const },
  /** User message body */
  bodyUser: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  /** Heading level 1 — section titles within messages */
  h1: { fontSize: 20, lineHeight: 28, fontWeight: '700' as const },
  /** Heading level 2 */
  h2: { fontSize: 17, lineHeight: 24, fontWeight: '600' as const },
  /** Heading level 3 */
  h3: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const },
  /** Supporting / caption text — timestamps, footnotes */
  supporting: { fontSize: 13, lineHeight: 19, fontWeight: '400' as const },
  /** Block type label (e.g. "Reflection", "Question") */
  blockLabel: {
    fontSize: 11, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  /** Inline code and code blocks */
  code: { fontSize: 13, lineHeight: 20, fontWeight: '400' as const, fontFamily: 'JetBrains Mono' as const },
  /** List item body */
  listItem: { fontSize: 15, lineHeight: 24, fontWeight: '400' as const },
  /** Blockquote text */
  quote: { fontSize: 15, lineHeight: 23, fontWeight: '400' as const, fontStyle: 'italic' as const },
  /** Link text */
  link: { fontSize: 16, lineHeight: 26, fontWeight: '500' as const, textDecorationLine: 'underline' as const },
  /** Emoji-only line */
  emoji: { fontSize: 22, lineHeight: 32, fontWeight: '400' as const, textAlign: 'center' as const },
  /** Reflection / insight title */
  reflectionTitle: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },
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
  primary: ['#7E60CD', '#06B6D4'] as const,
  purple: ['#6E50BD', '#9F8BE6'] as const,
  cyan: ['#06B6D4', '#22D3EE'] as const,
  warm: ['#7E60CD', '#F472B6'] as const,
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
    springLight: { damping: 18, stiffness: 180, mass: 0.8 } as const,
    springBouncy: { damping: 10, stiffness: 250, mass: 0.6 } as const,
  },
  chat: {
    /** User message send animation — slide in from right + fade */
    send: 280,
    /** AI message receive animation — slide in from left + fade */
    receive: 350,
    /** Streaming cursor blink rate */
    stream: 500,
    /** Typing indicator dot animation cycle */
    dots: 350,
    /** Auto-scroll smooth duration */
    autoScroll: 200,
    /** Keyboard show/hide transition */
    keyboardTransition: 300,
    /** Bubble scale-in when appearing */
    bubbleAppear: 250,
    /** Loading skeleton shimmer cycle */
    shimmer: 1200,
    /** Action sheet slide-up */
    actionSheet: 300,
    /** Feedback button press feedback */
    feedbackPress: 100,
  },
} as const;

/**
 * Chat-specific design tokens.
 * These define the geometry and visual grammar of the conversation.
 */
export const chat = {
  bubble: {
    /** Standard corner radius for all bubbles */
    radius: 20,
    /** Flattened corner radius for grouped same-role siblings */
    radiusGrouped: 6,
    /** Top corner radius for first message in a user group */
    radiusTop: 20,
    /** Bottom corner radius for last message in a user group */
    radiusBottom: 20,
    /** Max width for AI bubbles (full-width card) */
    maxWidthAI: '100%' as const,
    /** Max width for user bubbles */
    maxWidthUser: '82%' as const,
    /** Padding inside AI card bubbles */
    paddingHAI: 20,
    paddingVAI: 18,
    /** Padding inside user pill bubbles */
    paddingHUser: 16,
    paddingVUser: 10,
  },
  group: {
    /** Vertical gap between messages in the same group */
    innerGap: 2,
    /** Vertical gap between groups (different roles) */
    outerGap: 12,
  },
  typography: chatTypography,
  blocks: {
    /** Accent colors per block type */
    reflection: '#8B5CF6',
    question: '#06B6D4',
    action: '#34D399',
    summary: '#FBBF24',
    insight: '#A78BFA',
    resource: '#818CF8',
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
  chatTypography,
  spacing,
  borderRadius,
  shadows,
  gradients,
  motion,
  chat,
  zIndex,
  opacity,
};
