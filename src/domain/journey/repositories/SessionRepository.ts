import type { Session } from '../entities/Session';
import type { SessionState } from '../enums';

export interface SessionRepository {
  getById(id: string): Promise<Session | null>;
  getByExerciseId(exerciseId: string): Promise<Session[]>;
  create(session: Session): Promise<void>;
  updateStatus(sessionId: string, status: SessionState): Promise<void>;
}
