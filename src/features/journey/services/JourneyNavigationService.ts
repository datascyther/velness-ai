import { ROUTES } from '@/core/config/routes';
import type { JourneyProgress } from '../types/JourneyProgress';

export type JourneyDestination =
  | { type: 'program'; programId: string }
  | { type: 'lesson'; programId: string; lessonId: string }
  | { type: 'exercise'; exerciseId: string }
  | { type: 'session'; sessionId: string }
  | { type: 'library' }
  | { type: 'progress' }
  | { type: 'completion' }
  | { type: 'placeholder'; journey: JourneyProgress };

export const JourneyNavigationService = {
  resolve(journey: JourneyProgress): JourneyDestination {
    const target = journey.resumeTarget;
    if (!target) {
      return { type: 'placeholder', journey };
    }
    const route = target.route;
    if (route === ROUTES.JOURNEY.SESSION) {
      return { type: 'session', sessionId: target.exerciseId };
    }
    return { type: 'exercise', exerciseId: target.exerciseId };
  },

  buildPath(destination: JourneyDestination): string {
    switch (destination.type) {
      case 'program':
        return ROUTES.JOURNEY.PROGRAM.replace('[programId]', destination.programId);
      case 'lesson':
        return ROUTES.JOURNEY.LESSON
          .replace('[programId]', destination.programId)
          .replace('[lessonId]', destination.lessonId);
      case 'exercise':
        return ROUTES.JOURNEY.EXERCISE.replace('[exerciseId]', destination.exerciseId);
      case 'session':
        return ROUTES.JOURNEY.SESSION.replace('[sessionId]', destination.sessionId);
      case 'library':
        return ROUTES.JOURNEY.LIBRARY;
      case 'progress':
        return ROUTES.JOURNEY.PROGRESS;
      case 'completion':
        return ROUTES.JOURNEY.COMPLETION;
      case 'placeholder':
        return ROUTES.JOURNEY.PLACEHOLDER;
    }
  },
};
