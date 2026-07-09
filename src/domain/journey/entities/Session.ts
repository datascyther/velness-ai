import type { SessionState } from '../enums';

export interface Session {
  id: string;
  exerciseId: string;
  startedAt: Date;
  endedAt: Date | null;
  elapsedTime: number;
  completionPercentage: number;
  status: SessionState;
}
