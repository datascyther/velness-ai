import type { SessionRepository } from '../repositories/SessionRepository';
import type { Session } from '../entities/Session';
import { SESSION_STATE } from '../enums';
import type { SessionState } from '../enums';
import { sessionStateMachine } from '../state-machine/session-states';
import { success, failure, type WorkflowResult } from './types';

export class SessionEngine {
  constructor(private sessionRepo: SessionRepository) {}

  async create(exerciseId: string): Promise<WorkflowResult<Session>> {
    const session: Session = {
      id: crypto.randomUUID(),
      exerciseId,
      startedAt: new Date(),
      endedAt: null,
      elapsedTime: 0,
      completionPercentage: 0,
      status: SESSION_STATE.CREATED,
    };
    await this.sessionRepo.create(session);
    return success(session);
  }

  async start(sessionId: string): Promise<WorkflowResult<Session>> {
    const session = await this.sessionRepo.getById(sessionId);
    if (!session) return failure('SESSION_NOT_FOUND', `Session ${sessionId} not found`, 'Session', sessionId);
    if (!sessionStateMachine.canTransition(session.status, SESSION_STATE.RUNNING)) {
      return failure('INVALID_TRANSITION', `Cannot start session in state ${session.status}`, 'Session', sessionId);
    }
    session.status = SESSION_STATE.RUNNING;
    session.startedAt = new Date();
    await this.sessionRepo.updateStatus(sessionId, session.status);
    return success(session);
  }

  async pause(sessionId: string): Promise<WorkflowResult<Session>> {
    const session = await this.sessionRepo.getById(sessionId);
    if (!session) return failure('SESSION_NOT_FOUND', `Session ${sessionId} not found`, 'Session', sessionId);
    if (!sessionStateMachine.canTransition(session.status, SESSION_STATE.PAUSED)) {
      return failure('INVALID_TRANSITION', `Cannot pause session in state ${session.status}`, 'Session', sessionId);
    }
    session.status = SESSION_STATE.PAUSED;
    session.elapsedTime += Date.now() - session.startedAt.getTime();
    await this.sessionRepo.updateStatus(sessionId, session.status);
    return success(session);
  }

  async resume(sessionId: string): Promise<WorkflowResult<Session>> {
    const session = await this.sessionRepo.getById(sessionId);
    if (!session) return failure('SESSION_NOT_FOUND', `Session ${sessionId} not found`, 'Session', sessionId);
    if (!sessionStateMachine.canTransition(session.status, SESSION_STATE.RUNNING)) {
      return failure('INVALID_TRANSITION', `Cannot resume session in state ${session.status}`, 'Session', sessionId);
    }
    session.status = SESSION_STATE.RUNNING;
    session.startedAt = new Date();
    await this.sessionRepo.updateStatus(sessionId, session.status);
    return success(session);
  }

  async finish(sessionId: string, completionPercentage: number = 100): Promise<WorkflowResult<Session>> {
    const session = await this.sessionRepo.getById(sessionId);
    if (!session) return failure('SESSION_NOT_FOUND', `Session ${sessionId} not found`, 'Session', sessionId);
    if (session.status === SESSION_STATE.FINISHED) {
      return failure('ALREADY_FINISHED', 'Session cannot finish twice', 'Session', sessionId);
    }
    if (!sessionStateMachine.canTransition(session.status, SESSION_STATE.FINISHED)) {
      return failure('INVALID_TRANSITION', `Cannot finish session in state ${session.status}`, 'Session', sessionId);
    }
    session.status = SESSION_STATE.FINISHED;
    session.endedAt = new Date();
    session.elapsedTime = session.endedAt.getTime() - session.startedAt.getTime();
    session.completionPercentage = completionPercentage;
    await this.sessionRepo.updateStatus(sessionId, session.status);
    return success(session);
  }

  async cancel(sessionId: string): Promise<WorkflowResult<Session>> {
    const session = await this.sessionRepo.getById(sessionId);
    if (!session) return failure('SESSION_NOT_FOUND', `Session ${sessionId} not found`, 'Session', sessionId);
    if (!sessionStateMachine.canTransition(session.status, SESSION_STATE.CANCELLED)) {
      return failure('INVALID_TRANSITION', `Cannot cancel session in state ${session.status}`, 'Session', sessionId);
    }
    session.status = SESSION_STATE.CANCELLED;
    session.endedAt = new Date();
    await this.sessionRepo.updateStatus(sessionId, session.status);
    return success(session);
  }

  async getElapsedTime(sessionId: string): Promise<WorkflowResult<number>> {
    const session = await this.sessionRepo.getById(sessionId);
    if (!session) return failure('SESSION_NOT_FOUND', `Session ${sessionId} not found`, 'Session', sessionId);
    if (session.endedAt) {
      return success(session.elapsedTime);
    }
    return success(session.elapsedTime + (Date.now() - session.startedAt.getTime()));
  }
}
