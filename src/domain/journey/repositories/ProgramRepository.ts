import type { Program } from '../entities/Program';

export interface ProgramRepository {
  getById(id: string): Promise<Program | null>;
  getAll(): Promise<Program[]>;
  update(program: Program): Promise<void>;
}
