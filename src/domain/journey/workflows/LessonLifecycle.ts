import type { LessonRepository } from '../repositories/LessonRepository';
import type { ExerciseRepository } from '../repositories/ExerciseRepository';
import type { ProgressRepository } from '../repositories/ProgressRepository';
import type { Lesson } from '../entities/Lesson';
import { LESSON_STATE } from '../enums';
import { lessonStateMachine } from '../state-machine/lesson-states';
import { ProgressEngine } from './ProgressEngine';
import { success, failure, type WorkflowResult } from './types';

export class LessonLifecycle {
  constructor(
    private lessonRepo: LessonRepository,
    private exerciseRepo: ExerciseRepository,
    private progressRepo: ProgressRepository,
    private progressEngine: ProgressEngine,
  ) {}

  async unlock(lessonId: string): Promise<WorkflowResult<Lesson>> {
    const lesson = await this.lessonRepo.getById(lessonId);
    if (!lesson) return failure('LESSON_NOT_FOUND', `Lesson ${lessonId} not found`, 'Lesson', lessonId);
    if (!lessonStateMachine.canTransition(lesson.status, LESSON_STATE.AVAILABLE)) {
      return failure('INVALID_TRANSITION', `Cannot unlock lesson in state ${lesson.status}`, 'Lesson', lessonId);
    }
    lesson.status = LESSON_STATE.AVAILABLE;
    await this.lessonRepo.update(lesson);
    return success(lesson);
  }

  async start(lessonId: string): Promise<WorkflowResult<Lesson>> {
    const lesson = await this.lessonRepo.getById(lessonId);
    if (!lesson) return failure('LESSON_NOT_FOUND', `Lesson ${lessonId} not found`, 'Lesson', lessonId);
    if (!lessonStateMachine.canTransition(lesson.status, LESSON_STATE.ACTIVE)) {
      return failure('INVALID_TRANSITION', `Cannot start lesson in state ${lesson.status}`, 'Lesson', lessonId);
    }
    lesson.status = LESSON_STATE.ACTIVE;
    await this.lessonRepo.update(lesson);
    return success(lesson);
  }

  async resume(lessonId: string): Promise<WorkflowResult<{ lesson: Lesson; currentExerciseId: string | null }>> {
    const lesson = await this.lessonRepo.getById(lessonId);
    if (!lesson) return failure('LESSON_NOT_FOUND', `Lesson ${lessonId} not found`, 'Lesson', lessonId);
    const exercises = await this.exerciseRepo.getByLessonId(lessonId);
    const completedIds = exercises.filter(e => e.status === 'completed').map(e => e.id);
    const currentExerciseId = this.progressEngine.getCurrentExercise(completedIds, exercises);
    return success({ lesson, currentExerciseId });
  }

  async complete(userId: string, lessonId: string): Promise<WorkflowResult<Lesson>> {
    const lesson = await this.lessonRepo.getById(lessonId);
    if (!lesson) return failure('LESSON_NOT_FOUND', `Lesson ${lessonId} not found`, 'Lesson', lessonId);
    if (!lessonStateMachine.canTransition(lesson.status, LESSON_STATE.COMPLETED)) {
      return failure('INVALID_TRANSITION', `Cannot complete lesson in state ${lesson.status}`, 'Lesson', lessonId);
    }

    const exercises = await this.exerciseRepo.getByLessonId(lessonId);
    const completedIds = exercises.filter(e => e.status === 'completed').map(e => e.id);
    const allDone = this.progressEngine.isLessonComplete(exercises, completedIds);
    if (!allDone) {
      return failure('LESSON_NOT_FULLY_COMPLETE', 'Not all exercises are completed', 'Lesson', lessonId);
    }

    lesson.status = LESSON_STATE.COMPLETED;
    await this.lessonRepo.update(lesson);

    const progress = await this.progressRepo.getProgramProgress(lesson.programId, userId);
    if (progress) {
      progress.completedLessons = [...new Set([...progress.completedLessons, lessonId])];
      const allLessons = await this.lessonRepo.getByProgramId(lesson.programId);
      progress.completionPercentage = this.progressEngine.calculateProgramPercentage(
        progress.completedLessons,
        allLessons.length,
      );
      progress.lastUpdated = new Date();
      await this.progressRepo.updateProgramProgress(progress);
    }

    return success(lesson);
  }

  async skip(userId: string, lessonId: string): Promise<WorkflowResult<Lesson>> {
    const lesson = await this.lessonRepo.getById(lessonId);
    if (!lesson) return failure('LESSON_NOT_FOUND', `Lesson ${lessonId} not found`, 'Lesson', lessonId);
    if (!lessonStateMachine.canTransition(lesson.status, LESSON_STATE.SKIPPED)) {
      return failure('INVALID_TRANSITION', `Cannot skip lesson in state ${lesson.status}`, 'Lesson', lessonId);
    }
    lesson.status = LESSON_STATE.SKIPPED;
    await this.lessonRepo.update(lesson);
    return success(lesson);
  }
}
