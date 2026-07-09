import type { ExerciseRepository } from '../repositories/ExerciseRepository';
import type { Exercise } from '../entities/Exercise';
import { EXERCISE_STATE } from '../enums';
import { exerciseStateMachine } from '../state-machine/exercise-states';
import { SessionEngine } from './SessionEngine';
import { success, failure, type WorkflowResult } from './types';

export class ExerciseLifecycle {
  constructor(
    private exerciseRepo: ExerciseRepository,
    private sessionEngine: SessionEngine,
  ) {}

  async prepare(exerciseId: string): Promise<WorkflowResult<Exercise>> {
    const exercise = await this.exerciseRepo.getById(exerciseId);
    if (!exercise) return failure('EXERCISE_NOT_FOUND', `Exercise ${exerciseId} not found`, 'Exercise', exerciseId);
    if (!exerciseStateMachine.canTransition(exercise.status, EXERCISE_STATE.READY)) {
      return failure('INVALID_TRANSITION', `Cannot prepare exercise in state ${exercise.status}`, 'Exercise', exerciseId);
    }
    exercise.status = EXERCISE_STATE.READY;
    await this.exerciseRepo.updateStatus(exerciseId, exercise.status);
    return success(exercise);
  }

  async start(exerciseId: string): Promise<WorkflowResult<{ exercise: Exercise; sessionId: string }>> {
    const exercise = await this.exerciseRepo.getById(exerciseId);
    if (!exercise) return failure('EXERCISE_NOT_FOUND', `Exercise ${exerciseId} not found`, 'Exercise', exerciseId);
    if (!exerciseStateMachine.canTransition(exercise.status, EXERCISE_STATE.RUNNING)) {
      return failure('INVALID_TRANSITION', `Cannot start exercise in state ${exercise.status}`, 'Exercise', exerciseId);
    }

    const createResult = await this.sessionEngine.create(exerciseId);
    if ('error' in createResult) return failure(createResult.error.code, createResult.error.message, createResult.error.entity, createResult.error.entityId);

    const sessionId = createResult.data.id;

    exercise.status = EXERCISE_STATE.RUNNING;
    await this.exerciseRepo.updateStatus(exerciseId, exercise.status);

    const startResult = await this.sessionEngine.start(sessionId);
    if ('error' in startResult) return failure(startResult.error.code, startResult.error.message, startResult.error.entity, startResult.error.entityId);

    return success({ exercise, sessionId });
  }

  async pause(exerciseId: string): Promise<WorkflowResult<Exercise>> {
    const exercise = await this.exerciseRepo.getById(exerciseId);
    if (!exercise) return failure('EXERCISE_NOT_FOUND', `Exercise ${exerciseId} not found`, 'Exercise', exerciseId);
    if (!exerciseStateMachine.canTransition(exercise.status, EXERCISE_STATE.PAUSED)) {
      return failure('INVALID_TRANSITION', `Cannot pause exercise in state ${exercise.status}`, 'Exercise', exerciseId);
    }
    exercise.status = EXERCISE_STATE.PAUSED;
    await this.exerciseRepo.updateStatus(exerciseId, exercise.status);
    return success(exercise);
  }

  async resume(exerciseId: string): Promise<WorkflowResult<Exercise>> {
    const exercise = await this.exerciseRepo.getById(exerciseId);
    if (!exercise) return failure('EXERCISE_NOT_FOUND', `Exercise ${exerciseId} not found`, 'Exercise', exerciseId);
    if (!exerciseStateMachine.canTransition(exercise.status, EXERCISE_STATE.RUNNING)) {
      return failure('INVALID_TRANSITION', `Cannot resume exercise in state ${exercise.status}`, 'Exercise', exerciseId);
    }
    exercise.status = EXERCISE_STATE.RUNNING;
    await this.exerciseRepo.updateStatus(exerciseId, exercise.status);
    return success(exercise);
  }

  async restart(exerciseId: string): Promise<WorkflowResult<Exercise>> {
    const exercise = await this.exerciseRepo.getById(exerciseId);
    if (!exercise) return failure('EXERCISE_NOT_FOUND', `Exercise ${exerciseId} not found`, 'Exercise', exerciseId);
    if (!exerciseStateMachine.canTransition(exercise.status, EXERCISE_STATE.READY)) {
      return failure('INVALID_TRANSITION', `Cannot restart exercise in state ${exercise.status}`, 'Exercise', exerciseId);
    }
    exercise.status = EXERCISE_STATE.READY;
    await this.exerciseRepo.updateStatus(exerciseId, exercise.status);
    return success(exercise);
  }

  async complete(exerciseId: string): Promise<WorkflowResult<Exercise>> {
    const exercise = await this.exerciseRepo.getById(exerciseId);
    if (!exercise) return failure('EXERCISE_NOT_FOUND', `Exercise ${exerciseId} not found`, 'Exercise', exerciseId);
    if (!exerciseStateMachine.canTransition(exercise.status, EXERCISE_STATE.COMPLETED)) {
      return failure('INVALID_TRANSITION', `Cannot complete exercise in state ${exercise.status}`, 'Exercise', exerciseId);
    }
    exercise.status = EXERCISE_STATE.COMPLETED;
    await this.exerciseRepo.updateStatus(exerciseId, exercise.status);
    return success(exercise);
  }

  async cancel(exerciseId: string): Promise<WorkflowResult<Exercise>> {
    const exercise = await this.exerciseRepo.getById(exerciseId);
    if (!exercise) return failure('EXERCISE_NOT_FOUND', `Exercise ${exerciseId} not found`, 'Exercise', exerciseId);
    const canSkip = exerciseStateMachine.canTransition(exercise.status, EXERCISE_STATE.SKIPPED);
    const canFail = exerciseStateMachine.canTransition(exercise.status, EXERCISE_STATE.FAILED);
    if (!canSkip && !canFail) {
      return failure('INVALID_TRANSITION', `Cannot cancel exercise in state ${exercise.status}`, 'Exercise', exerciseId);
    }
    if (exercise.status === EXERCISE_STATE.RUNNING && canFail) {
      exercise.status = EXERCISE_STATE.FAILED;
    } else if (canSkip) {
      exercise.status = EXERCISE_STATE.SKIPPED;
    } else {
      return failure('INVALID_TRANSITION', `Cannot cancel exercise in state ${exercise.status}`, 'Exercise', exerciseId);
    }
    await this.exerciseRepo.updateStatus(exerciseId, exercise.status);
    return success(exercise);
  }
}
