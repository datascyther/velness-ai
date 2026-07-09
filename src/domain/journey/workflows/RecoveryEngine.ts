import type { SessionRepository } from '../repositories/SessionRepository';
import type { ExerciseRepository } from '../repositories/ExerciseRepository';
import type { ProgressRepository } from '../repositories/ProgressRepository';
import type { JourneyRepository } from '../repositories/JourneyRepository';
import { SESSION_STATE } from '../enums';
import { SessionEngine } from './SessionEngine';
import { ExerciseLifecycle } from './ExerciseLifecycle';
import {
  success,
  failure,
  type WorkflowResult,
  type Interruption,
  type SyncResult,
} from './types';

export class RecoveryEngine {
  constructor(
    private sessionRepo: SessionRepository,
    private exerciseRepo: ExerciseRepository,
    private progressRepo: ProgressRepository,
    private journeyRepo: JourneyRepository,
    private sessionEngine: SessionEngine,
    private exerciseLifecycle: ExerciseLifecycle,
  ) {}

  async detectInterruptions(userId: string): Promise<WorkflowResult<Interruption[]>> {
    const interruptions: Interruption[] = [];
    const now = new Date();

    const journey = await this.journeyRepo.get(userId);
    if (!journey) return success([]);

    for (const programId of journey.programIds) {
      const progress = await this.progressRepo.getProgramProgress(programId, userId);
      if (!progress || !progress.currentExercise) continue;

      const sessions = await this.sessionRepo.getByExerciseId(progress.currentExercise);
      for (const session of sessions) {
        if (session.status === SESSION_STATE.RUNNING) {
          const elapsed = Date.now() - session.startedAt.getTime();
          if (elapsed > 30 * 60 * 1000) {
            interruptions.push({
              sessionId: session.id,
              exerciseId: session.exerciseId,
              type: 'running',
              detectedAt: now,
            });
          }
        } else if (session.status === SESSION_STATE.PAUSED) {
          interruptions.push({
            sessionId: session.id,
            exerciseId: session.exerciseId,
            type: 'paused',
            detectedAt: now,
          });
        }
      }
    }

    const orphaned = await this.findOrphanedExercises(userId);
    interruptions.push(...orphaned);

    return success(interruptions);
  }

  private async findOrphanedExercises(userId: string): Promise<Interruption[]> {
    const orphaned: Interruption[] = [];
    const now = new Date();

    const journey = await this.journeyRepo.get(userId);
    if (!journey) return [];

    for (const programId of journey.programIds) {
      const progress = await this.progressRepo.getProgramProgress(programId, userId);
      if (!progress) continue;

      if (progress.currentExercise && !progress.completedExercises.includes(progress.currentExercise)) {
        const sessions = await this.sessionRepo.getByExerciseId(progress.currentExercise);
        const hasActiveSession = sessions.some(
          s => s.status === SESSION_STATE.RUNNING || s.status === SESSION_STATE.PAUSED,
        );
        if (!hasActiveSession) {
          orphaned.push({
            sessionId: '',
            exerciseId: progress.currentExercise,
            type: 'orphaned',
            detectedAt: now,
          });
        }
      }
    }

    return orphaned;
  }

  async resumeSession(sessionId: string): Promise<WorkflowResult<void>> {
    const session = await this.sessionRepo.getById(sessionId);
    if (!session) return failure('SESSION_NOT_FOUND', `Session ${sessionId} not found`, 'Session', sessionId);

    if (session.status === SESSION_STATE.PAUSED) {
      const result = await this.sessionEngine.resume(sessionId);
      if ('error' in result) return failure(result.error.code, result.error.message, result.error.entity, result.error.entityId);
      const exerciseResult = await this.exerciseLifecycle.resume(session.exerciseId);
      if ('error' in exerciseResult) return failure(exerciseResult.error.code, exerciseResult.error.message, exerciseResult.error.entity, exerciseResult.error.entityId);
      return success(undefined);
    }

    if (session.status === SESSION_STATE.CREATED) {
      const result = await this.sessionEngine.start(sessionId);
      if ('error' in result) return failure(result.error.code, result.error.message, result.error.entity, result.error.entityId);
      return success(undefined);
    }

    return failure('INVALID_STATE', `Cannot resume session in state ${session.status}`, 'Session', sessionId);
  }

  async restartSession(sessionId: string): Promise<WorkflowResult<string>> {
    const session = await this.sessionRepo.getById(sessionId);
    if (!session) return failure('SESSION_NOT_FOUND', `Session ${sessionId} not found`, 'Session', sessionId);

    const cancelResult = await this.sessionEngine.cancel(sessionId);
    if ('error' in cancelResult) return failure(cancelResult.error.code, cancelResult.error.message, cancelResult.error.entity, cancelResult.error.entityId);

    const newSessionResult = await this.sessionEngine.create(session.exerciseId);
    if ('error' in newSessionResult) return failure(newSessionResult.error.code, newSessionResult.error.message, newSessionResult.error.entity, newSessionResult.error.entityId);

    const exerciseResult = await this.exerciseLifecycle.restart(session.exerciseId);
    if ('error' in exerciseResult) return failure(exerciseResult.error.code, exerciseResult.error.message, exerciseResult.error.entity, exerciseResult.error.entityId);

    return success(newSessionResult.data.id);
  }

  async discardSession(sessionId: string): Promise<WorkflowResult<void>> {
    const session = await this.sessionRepo.getById(sessionId);
    if (!session) return failure('SESSION_NOT_FOUND', `Session ${sessionId} not found`, 'Session', sessionId);

    const cancelResult = await this.sessionEngine.cancel(sessionId);
    if ('error' in cancelResult) return failure(cancelResult.error.code, cancelResult.error.message, cancelResult.error.entity, cancelResult.error.entityId);

    return success(undefined);
  }

  async retrySync(userId: string): Promise<WorkflowResult<SyncResult>> {
    const details: string[] = [];
    let fixed = 0;
    let errors = 0;

    const journey = await this.journeyRepo.get(userId);
    if (!journey) return success({ fixed: 0, errors: 0, details: ['No journey found'] });

    for (const programId of journey.programIds) {
      const progress = await this.progressRepo.getProgramProgress(programId, userId);
      if (!progress) continue;

      if (progress.completionPercentage === 100 && progress.completedLessons.length === 0) {
        errors++;
        details.push(`Program ${programId}: 100% but no completed lessons`);
      }

      if (progress.completionPercentage > 100) {
        progress.completionPercentage = 100;
        await this.progressRepo.updateProgramProgress(progress);
        fixed++;
        details.push(`Program ${programId}: capped completion at 100%`);
      }

      if (progress.currentLesson && progress.completedLessons.includes(progress.currentLesson)) {
        progress.currentLesson = null;
        await this.progressRepo.updateProgramProgress(progress);
        fixed++;
        details.push(`Program ${programId}: cleared current lesson pointer`);
      }
    }

    return success({ fixed, errors, details });
  }
}
