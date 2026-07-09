import type { CompletionStatus, ProgramState } from '../enums';

export interface ResumeTarget {
  exerciseId: string;
  route: string;
}

export interface ExerciseProgress {
  exerciseId: string;
  completionStatus: CompletionStatus;
  streak: number;
  lastCompletedAt: Date | null;
}

export interface ProgramProgress {
  programId: string;
  completedLessons: string[];
  completedExercises: string[];
  currentLesson: string | null;
  currentExercise: string | null;
  completionPercentage: number;
  lastUpdated: Date | null;
  resumeTarget: ResumeTarget | null;
}

export interface JourneyProgress {
  journeyId: string;
  totalExercisesCompleted: number;
  totalProgramsCompleted: number;
  streakDays: number;
  lastActivityAt: Date | null;
}
