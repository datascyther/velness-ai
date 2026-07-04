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
}

export interface UserProgress {
  userId: string;
  totalExercisesCompleted: number;
  streakDays: number;
  lastActivityAt: Date | null;
  programProgress: Record<string, ProgramProgress>;
}
