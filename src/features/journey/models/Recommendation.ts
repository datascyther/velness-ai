import type { ExerciseType, CategoryId } from '../constants';

export interface Recommendation {
  id: string;
  exerciseId: string;
  title: string;
  description: string;
  categoryId: CategoryId;
  exerciseType: ExerciseType;
  durationMinutes: number;
  reason: string;
}
