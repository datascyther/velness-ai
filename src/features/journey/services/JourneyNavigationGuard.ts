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
};
