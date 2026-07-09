import type { Lesson } from '../entities/Lesson';

export interface LessonRepository {
  getById(id: string): Promise<Lesson | null>;
  getByProgramId(programId: string): Promise<Lesson[]>;
  update(lesson: Lesson): Promise<void>;
}
