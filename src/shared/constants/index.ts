/**
 * Velness — Shared Constants
 *
 * Application-wide constants. Never import these directly in components —
 * use the theme system or context providers instead.
 */

export const APP = {
  NAME: 'Velness',
  VERSION: '1.0.0',
  DEEP_LINK_SCHEMES: ['neeva', 'velness'] as const,
  DEEP_LINK_SCHEME: 'velness',
} as const;

export const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: 'onboarding_completed',
  USER_PREFERENCES: 'user_preferences',
  AUTH_TOKEN: 'auth_token',
} as const;

export const MESSAGES = {
  // Generic
  LOADING: 'Loading...',
  ERROR_GENERIC: 'Something went wrong. Please try again.',
  RETRY: 'Retry',
  CANCEL: 'Cancel',
  CONFIRM: 'Confirm',

  // Auth
  LOGIN_SUCCESS: 'Welcome back!',
  LOGIN_ERROR: 'Invalid email or password.',
  SIGNUP_SUCCESS: 'Account created successfully!',
  SIGNUP_ERROR: 'Could not create account.',
  RESET_PASSWORD_SENT: 'Password reset email sent.',
  LOGOUT_CONFIRM: 'Are you sure you want to sign out?',

  // Mood
  MOOD_SAVED: 'Mood logged successfully.',
  MOOD_ERROR: 'Could not save mood entry.',

  // Chat
  CHAT_STREAM_ERROR: 'Failed to get response. Please try again.',
  CHAT_EMPTY: 'Start a conversation with Velness...',

  // Journey
  EXERCISE_COMPLETE: 'Well done! Exercise completed.',
  EXERCISE_ERROR: 'Could not save exercise progress.',

  // Network
  OFFLINE: 'You are offline. Some features may be unavailable.',
  ONLINE: 'Back online!',
} as const;

export const LAYOUT = {
  TAB_BAR_HEIGHT: 72,
  TAB_BAR_MARGIN: 16,
  CHAT_COMPOSER_SPACING: 12,
  HEADER_HEIGHT: 56,
} as const;

export const MOCK_DATA = {
  GREETINGS: [
    'How are you feeling today?',
    'Welcome back. Let\'s check in.',
    'Hi there. I\'m here for you.',
    'Good to see you again.',
  ],
} as const;
