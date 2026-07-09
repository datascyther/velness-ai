import type { Exercise } from '../entities/Exercise';
import type { ExerciseState } from '../enums';

export interface ExerciseRepository {
  getById(id: string): Promise<Exercise | null>;
  getByLessonId(lessonId: string): Promise<Exercise[]>;
  updateStatus(exerciseId: string, status: ExerciseState): Promise<void>;
}
