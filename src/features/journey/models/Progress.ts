import type { ProgramStatus } from '../constants';

export interface ResumeTarget {
  exerciseId: string;
  route: string;
}

export interface ProgramProgress {
  programId: string;
  completedLessonIds: string[];
  completionPercent: number;
  lastOpenedAt: Date | null;
  status: ProgramStatus;
  resumeTarget: ResumeTarget | null;
  // Dynamic CBT Program Intelligence fields (Phase 6.1)
  totalLessons?: number;
  completedLessons?: number;
  lockedLessons?: number;
  completionPercentage?: number;
  currentLesson?: number;
  estimatedRemainingTime?: number;
  lastOpenedLesson?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
}

export interface UserProgress {
  userId: string;
  totalExercisesCompleted: number;
  streakDays: number;
  lastActivityAt: Date | null;
  programProgress: Record<string, ProgramProgress>;
  achievements?: Record<string, string>; // Maps milestoneId -> ISO achieved Date
  favorites?: string[]; // Array of favorited program IDs
}
