import type { ProgramProgress, JourneyProgress } from '../entities/Progress';

export interface ProgressRepository {
  getProgramProgress(programId: string, userId: string): Promise<ProgramProgress | null>;
  getJourneyProgress(journeyId: string): Promise<JourneyProgress | null>;
  updateProgramProgress(progress: ProgramProgress): Promise<void>;
  updateJourneyProgress(progress: JourneyProgress): Promise<void>;
}
