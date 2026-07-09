import type { Difficulty, ProgramState } from '../enums';
import type { ProgramProgress } from './Progress';

export interface Program {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: Difficulty;
  estimatedDuration: number;
  lessonCount: number;
  exerciseCount: number;
  progress: ProgramProgress | null;
  status: ProgramState;
  tags: string[];
}
