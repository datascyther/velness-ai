/**
 * Velness — Route Constants
 *
 * Centralised route names for Expo Router navigation.
 * Prevents hardcoded strings across the codebase.
 */

export const ROUTES = {
  // ─── Auth ───────────────────────────────────────────────────────────
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    ONBOARDING: '/onboarding',
  } as const,

  // ─── Tabs ───────────────────────────────────────────────────────────
  TABS: {
    HOME: '/(tabs)',
    CHAT: '/(tabs)/chat',
    JOURNEY: '/(tabs)/journey',
    PROFILE: '/(tabs)/profile',
  } as const,

  // ─── Journey ────────────────────────────────────────────────────────────
  JOURNEY: {
    HOME: '/(tabs)/journey',
    PLACEHOLDER: '/journey/placeholder',
    LIBRARY: '/journey/library',
    CATEGORY: '/journey/category/[categoryId]',
    PROGRAM: '/journey/program/[programId]',
    LESSON: '/journey/program/[programId]/lesson/[lessonId]',
    EXERCISE: '/journey/exercise/[exerciseId]',
    SESSION: '/journey/session/[sessionId]',
    COMPLETION: '/journey/completion',
    PROGRESS: '/journey/progress',
    MOOD_TIMELINE: '/journey/mood-timeline',
  } as const,
} as const;

export type RouteName = keyof typeof ROUTES;
export type TabRoute = keyof typeof ROUTES.TABS;
export type AuthRoute = keyof typeof ROUTES.AUTH;

// ─── Journey Route Params ─────────────────────────────────────────────────

export interface JourneyCategoryParams { categoryId: string; }
export interface JourneyProgramParams { programId: string; }
export interface JourneyLessonParams { programId: string; lessonId: string; }
export interface JourneyExerciseParams { exerciseId: string; }
export interface JourneySessionParams { sessionId: string; }

/**
 * Resolves a route template like `/journey/program/[programId]`
 * with the given params object into a real path.
 */
export function buildRoute(
  template: string,
  params: Record<string, string>,
): string {
  let path = template;
  for (const [key, value] of Object.entries(params)) {
    path = path.replace(`[${key}]`, value);
  }
  return path;
}
