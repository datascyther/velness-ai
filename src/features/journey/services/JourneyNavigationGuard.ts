import { DEFAULT_LESSONS } from '../data/programs';

export type GuardResult =
  | { allowed: true }
  | { allowed: false; reason: string; fallback: string };

export const JourneyNavigationGuard = {
  checkAuth(): GuardResult {
    return { allowed: true };
  },

  checkProgramExists(programId: string): GuardResult {
    if (!programId) {
      return { allowed: false, reason: 'Program not found', fallback: '/journey/placeholder' };
    }
    return { allowed: true };
  },

  checkExerciseExists(exerciseId: string): GuardResult {
    if (!exerciseId) {
      return { allowed: false, reason: 'Exercise not found', fallback: '/journey/placeholder' };
    }
    return { allowed: true };
  },

  checkLessonAccessible(programId: string, lessonId: string, userProgress: any): GuardResult {
    if (!programId || !lessonId) return { allowed: true };
    
    const lessons = DEFAULT_LESSONS.filter((l) => l.programId === programId).sort((a, b) => a.order - b.order);
    const lessonIndex = lessons.findIndex((l) => l.id === lessonId);
    if (lessonIndex <= 0) return { allowed: true }; // First lesson is always unlocked

    if (!userProgress || !userProgress.programProgress || !userProgress.programProgress[programId]) {
      return { allowed: false, reason: 'This lesson is locked. Complete the previous lesson first.', fallback: `/journey/program/${programId}` };
    }

    const prevLesson = lessons[lessonIndex - 1];
    const completedLessonIds = userProgress.programProgress[programId].completedLessonIds || [];
    if (completedLessonIds.includes(prevLesson.id)) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: 'This lesson is locked. Complete the previous lesson first.',
      fallback: `/journey/program/${programId}`,
    };
  },
};

