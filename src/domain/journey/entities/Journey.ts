import type { JourneyStatus } from '../enums';

export interface Journey {
  id: string;
  userId: string;
  status: JourneyStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  programIds: string[];
  currentProgramId: string | null;
}
