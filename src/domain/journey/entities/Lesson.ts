import type { LessonState } from '../enums';

export interface Lesson {
  id: string;
  programId: string;
  title: string;
  description: string;
  order: number;
  duration: number;
  exerciseCount: number;
  status: LessonState;
}
