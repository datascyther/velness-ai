import type { ExerciseType, Difficulty, ExerciseState } from '../enums';

export interface Exercise {
  id: string;
  lessonId: string;
  type: ExerciseType;
  title: string;
  description: string;
  duration: number;
  difficulty: Difficulty;
  status: ExerciseState;
  metadata: Record<string, unknown>;
}
