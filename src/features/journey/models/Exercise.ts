import type { ExerciseType, CompletionStatus } from '../constants';

export interface Exercise {
  id: string;
  lessonId: string;
  type: ExerciseType;
  title: string;
  description: string;
  estimatedTime: number;
  content: Record<string, unknown>;
  sortOrder: number;
}

export interface ExerciseWithProgress extends Exercise {
  completionStatus: CompletionStatus;
  streak: number;
  lastCompletedAt: Date | null;
}
