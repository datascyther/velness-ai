import type { Difficulty, CategoryId, ProgramStatus } from '../constants';

export interface Program {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  duration: number;
  thumbnail: string;
  categoryId: CategoryId;
  lessonCount: number;
  status: ProgramStatus;
  sortOrder: number;
  benefits?: string[];
  estimatedTime?: string;
}
