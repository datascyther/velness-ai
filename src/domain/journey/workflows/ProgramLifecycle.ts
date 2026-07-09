import type { ProgramRepository } from '../repositories/ProgramRepository';
import type { LessonRepository } from '../repositories/LessonRepository';
import type { ProgressRepository } from '../repositories/ProgressRepository';
import type { Program } from '../entities/Program';
import { PROGRAM_STATE } from '../enums';
import { programStateMachine } from '../state-machine/program-states';
import { ProgressEngine } from './ProgressEngine';
import { UnlockEngine } from './UnlockEngine';
import { success, failure, type WorkflowResult } from './types';

export class ProgramLifecycle {
  constructor(
    private programRepo: ProgramRepository,
    private lessonRepo: LessonRepository,
    private progressRepo: ProgressRepository,
    private progressEngine: ProgressEngine,
    private unlockEngine: UnlockEngine,
  ) {}

  async start(userId: string, programId: string): Promise<WorkflowResult<Program>> {
    const program = await this.programRepo.getById(programId);
    if (!program) return failure('PROGRAM_NOT_FOUND', `Program ${programId} not found`, 'Program', programId);
    if (!programStateMachine.canTransition(program.status, PROGRAM_STATE.ACTIVE)) {
      return failure('INVALID_TRANSITION', `Cannot start program in state ${program.status}`, 'Program', programId);
    }

    program.status = PROGRAM_STATE.ACTIVE;
    await this.programRepo.update(program);

    const unlockResult = await this.unlockEngine.unlockLesson(programId);
    if ('error' in unlockResult) return failure(unlockResult.error.code, unlockResult.error.message);

    return success(program);
  }

  async resume(programId: string): Promise<WorkflowResult<{ program: Program; currentLessonId: string | null }>> {
    const program = await this.programRepo.getById(programId);
    if (!program) return failure('PROGRAM_NOT_FOUND', `Program ${programId} not found`, 'Program', programId);
    if (program.status !== PROGRAM_STATE.ACTIVE) {
      return failure('PROGRAM_NOT_ACTIVE', 'Cannot resume a program that is not active', 'Program', programId);
    }

    const lessons = await this.lessonRepo.getByProgramId(programId);
    const progress = await this.progressRepo.getProgramProgress(programId, '');
    const completedIds = progress?.completedLessons ?? [];
    const currentLessonId = this.progressEngine.getCurrentLesson(completedIds, lessons);

    return success({ program, currentLessonId });
  }

  async complete(userId: string, programId: string): Promise<WorkflowResult<Program>> {
    const program = await this.programRepo.getById(programId);
    if (!program) return failure('PROGRAM_NOT_FOUND', `Program ${programId} not found`, 'Program', programId);
    if (!programStateMachine.canTransition(program.status, PROGRAM_STATE.COMPLETED)) {
      return failure('INVALID_TRANSITION', `Cannot complete program in state ${program.status}`, 'Program', programId);
    }

    const lessons = await this.lessonRepo.getByProgramId(programId);
    const completedLessonIds = lessons.filter(l => l.status === 'completed').map(l => l.id);
    const allDone = this.progressEngine.isProgramComplete(lessons, completedLessonIds);
    if (!allDone) {
      return failure('PROGRAM_NOT_FULLY_COMPLETE', 'Not all lessons are completed', 'Program', programId);
    }

    program.status = PROGRAM_STATE.COMPLETED;
    await this.programRepo.update(program);

    const progress = await this.progressRepo.getProgramProgress(programId, userId);
    if (progress) {
      progress.completionPercentage = 100;
      progress.lastUpdated = new Date();
      await this.progressRepo.updateProgramProgress(progress);
    }

    return success(program);
  }

  async archive(programId: string): Promise<WorkflowResult<Program>> {
    const program = await this.programRepo.getById(programId);
    if (!program) return failure('PROGRAM_NOT_FOUND', `Program ${programId} not found`, 'Program', programId);
    if (!programStateMachine.canTransition(program.status, PROGRAM_STATE.ARCHIVED)) {
      return failure('INVALID_TRANSITION', `Cannot archive program in state ${program.status}`, 'Program', programId);
    }
    program.status = PROGRAM_STATE.ARCHIVED;
    await this.programRepo.update(program);
    return success(program);
  }
}
