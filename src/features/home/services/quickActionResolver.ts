// src/features/home/services/quickActionResolver.ts
//
// Resolves the navigation target for a Quick Action button.
//
// Each Quick Action tries to "resume" the user's last / unfinished session for
// its feature by inspecting recent analytics events. If a resumable id
// (session / exercise / program / lesson) is found on a feature-relevant event,
// we route straight to that detail/player screen. Otherwise we fall back to the
// feature's index route (its category hub, or the closest valid route).
//
// DATA SOURCE: `analyticsService.list(50)` → `AnalyticsRow[]` (each row has
// `{ event_name, created_at, properties }`). `properties` is where a resumable
// id would be embedded if/when the feature emits one.
//
// NOTE: No screen in the current app emits `program_id` / `session_id` /
// `exercise_id` on these events yet, so in practice the resolver falls through
// to the feature index route. The lookup is written so that the moment those
// events start carrying ids (or a new canonical event string is added), resume
// "just works" — no further wiring required.

import { analyticsService } from '../../../../backend/services/AnalyticsService';
import type { AnalyticsRow } from '../../../../backend/services/AnalyticsService';
import { buildRoute, ROUTES } from '@/core/config/routes';
import { CATEGORY_ID } from '@/features/journey/constants';

export type QuickActionFeature = 'breathing' | 'meditation' | 'sleep';

// Event names that signal "the user opened/used this feature".
// These are the REAL strings declared in src/services/analytics/index.ts where
// they exist, plus the proposed canonical strings documented in
// HomeViewModel.ts (`breathing_session_completed`, etc.).
const FEATURE_EVENTS: Record<QuickActionFeature, readonly string[]> = {
  breathing: ['breathing_session_started', 'breathing_session_completed', 'meditation_completed'],
  meditation: ['meditation_session_started', 'meditation_completed'],
  sleep: ['sleep_session_started', 'sleep_session_completed'],
};

// Resumable id keys, in priority order.
const ID_KEYS = ['session_id', 'exercise_id', 'program_id', 'lesson_id'] as const;

function findResumableEvent(
  events: AnalyticsRow[],
  feature: QuickActionFeature,
): AnalyticsRow | null {
  return events.find((e) => FEATURE_EVENTS[feature].includes(e.event_name)) ?? null;
}

function routeForEvent(event: AnalyticsRow): string | null {
  const props = (event.properties ?? {}) as Record<string, unknown>;
  for (const key of ID_KEYS) {
    const id = props[key];
    if (typeof id !== 'string' || !id) continue;
    switch (key) {
      case 'session_id':
        return buildRoute(ROUTES.JOURNEY.SESSION, { sessionId: id });
      case 'exercise_id':
        return buildRoute(ROUTES.JOURNEY.EXERCISE, { exerciseId: id });
      case 'program_id':
        return buildRoute(ROUTES.JOURNEY.PROGRAM, { programId: id });
      case 'lesson_id': {
        const programId = props.program_id;
        if (typeof programId === 'string' && programId) {
          return buildRoute(ROUTES.JOURNEY.LESSON, { programId, lessonId: id });
        }
        break;
      }
    }
  }
  return null;
}

// Feature "index" / main hub route. Used when no resumable session is found.
function featureIndexRoute(feature: QuickActionFeature): string {
  switch (feature) {
    case 'breathing':
      // Category hub listing every breathing program.
      return buildRoute(ROUTES.JOURNEY.CATEGORY, { categoryId: CATEGORY_ID.BREATHING });
    case 'meditation':
      // Category hub listing every meditation program.
      return buildRoute(ROUTES.JOURNEY.CATEGORY, { categoryId: CATEGORY_ID.MEDITATION });
    case 'sleep':
      // GAP: there is no dedicated `sleep` category or route. The closest valid
      // route is the sleep-themed breathing program (`sleep-preparation`).
      return buildRoute(ROUTES.JOURNEY.PROGRAM, { programId: 'sleep-preparation' });
  }
}

/**
 * Returns the route a Quick Action button should navigate to.
 * Never throws — analytics failures degrade to the feature index route.
 */
export async function resolveQuickActionRoute(feature: QuickActionFeature): Promise<string> {
  try {
    const events = await analyticsService.list(50);
    const event = findResumableEvent(events, feature);
    if (event) {
      const route = routeForEvent(event);
      if (route) return route;
    }
  } catch {
    // Analytics is best-effort; never block navigation on it.
  }
  return featureIndexRoute(feature);
}
