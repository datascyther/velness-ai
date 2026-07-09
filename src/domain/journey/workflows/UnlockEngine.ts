import type { ProgramRepository } from '../repositories/ProgramRepository';
import type { LessonRepository } from '../repositories/LessonRepository';
import type { ExerciseRepository } from '../repositories/ExerciseRepository';
import type { Lesson } from '../entities/Lesson';
import type { Exercise } from '../entities/Exercise';
import { PROGRAM_STATE, LESSON_STATE, EXERCISE_STATE } from '../enums';
import { programStateMachine } from '../state-machine/program-states';
import { lessonStateMachine } from '../state-machine/lesson-states';
import { exerciseStateMachine } from '../state-machine/exercise-states';
import { success, failure, type WorkflowResult } from './types';

export interface UnlockResult {
  unlockedLessons: Lesson[];
  unlockedExercises: Exercise[];
}

export class UnlockEngine {
  constructor(
    private programRepo: ProgramRepository,
    private lessonRepo: LessonRepository,
    private exerciseRepo: ExerciseRepository,
  ) {}

  async unlockLesson(programId: string): Promise<WorkflowResult<Lesson[]>> {
    const lessons = await this.lessonRepo.getByProgramId(programId);
    const locked = lessons.filter(l => l.status === LESSON_STATE.LOCKED).sort((a, b) => a.order - b.order);

    if (locked.length === 0) return success([]);

    const unlocked: Lesson[] = [];

    for (const lesson of locked) {
      if (!lessonStateMachine.canTransition(lesson.status, LESSON_STATE.AVAILABLE)) break;
      const prevLesson = lessons.find(l => l.order === lesson.order - 1);
      if (prevLesson && prevLesson.status !== LESSON_STATE.COMPLETED && prevLesson.status !== LESSON_STATE.SKIPPED) break;

      lesson.status = LESSON_STATE.AVAILABLE;
      await this.lessonRepo.update(lesson);
      unlocked.push(lesson);
    }

    return success(unlocked);
  }

  async unlockExercise(lessonId: string): Promise<WorkflowResult<Exercise[]>> {
    const exercises = await this.exerciseRepo.getByLessonId(lessonId);
    const locked = exercises.filter(e => e.status === EXERCISE_STATE.LOCKED);

    if (locked.length === 0) return success([]);

    const unlocked: Exercise[] = [];
    const firstLocked = locked[0];

    if (exerciseStateMachine.canTransition(firstLocked.status, EXERCISE_STATE.READY)) {
      firstLocked.status = EXERCISE_STATE.READY;
      await this.exerciseRepo.updateStatus(firstLocked.id, firstLocked.status);
      unlocked.push(firstLocked);
    }

    return success(unlocked);
  }

  async unlockProgram(programId: string): Promise<WorkflowResult<void>> {
    const program = await this.programRepo.getById(programId);
    if (!program) return failure('PROGRAM_NOT_FOUND', `Program ${programId} not found`, 'Program', programId);
    if (!programStateMachine.canTransition(program.status, PROGRAM_STATE.AVAILABLE)) {
      return failure('INVALID_TRANSITION', `Cannot unlock program in state ${program.status}`, 'Program', programId);
    }
    program.status = PROGRAM_STATE.AVAILABLE;
    await this.programRepo.update(program);
    return success(undefined);
  }

  async processCompletion(
    entityType: 'exercise' | 'lesson' | 'program',
    entityId: string,
  ): Promise<WorkflowResult<UnlockResult>> {
    const result: UnlockResult = { unlockedLessons: [], unlockedExercises: [] };

    if (entityType === 'exercise') {
      const exercise = await this.exerciseRepo.getById(entityId);
      if (!exercise) return failure('EXERCISE_NOT_FOUND', `Exercise ${entityId} not found`, 'Exercise', entityId);

      const exercises = await this.exerciseRepo.getByLessonId(exercise.lessonId);
      const currentIdx = exercises.findIndex(e => e.id === entityId);
      if (currentIdx < exercises.length - 1) {
        const next = exercises[currentIdx + 1];
        if (exerciseStateMachine.canTransition(next.status, EXERCISE_STATE.READY)) {
          next.status = EXERCISE_STATE.READY;
          await this.exerciseRepo.updateStatus(next.id, next.status);
          result.unlockedExercises.push(next);
        }
      }

      const allDone = exercises.every(
        e => e.status === EXERCISE_STATE.COMPLETED || e.status === EXERCISE_STATE.SKIPPED || e.id === entityId,
      );
      if (allDone) {
        const lesson = await this.lessonRepo.getById(exercise.lessonId);
        if (lesson && lessonStateMachine.canTransition(lesson.status, LESSON_STATE.COMPLETED)) {
          const lessonUnlocks = await this.unlockLesson(lesson.programId);
          if (lessonUnlocks.success) {
            result.unlockedLessons.push(...lessonUnlocks.data);
          }
        }
      }
    }

    if (entityType === 'lesson') {
      const lesson = await this.lessonRepo.getById(entityId);
      if (!lesson) return failure('LESSON_NOT_FOUND', `Lesson ${entityId} not found`, 'Lesson', entityId);
      const nextUnlocked = await this.unlockLesson(lesson.programId);
      if (nextUnlocked.success) {
        result.unlockedLessons.push(...nextUnlocked.data);
      }
    }

    if (entityType === 'program') {
      const programs = await this.programRepo.getAll();
      const current = programs.find(p => p.id === entityId);
      if (current) {
        const nextProgram = programs
          .filter(p => p.status === PROGRAM_STATE.LOCKED)
          .sort((a, b) => (a.tags[0] ?? '').localeCompare(b.tags[0] ?? ''));

        for (const p of nextProgram.slice(0, 1)) {
          const unlockResult = await this.unlockProgram(p.id);
          if (unlockResult.success) {
            const lessonUnlocks = await this.unlockLesson(p.id);
            if ('error' in lessonUnlocks) continue;
            result.unlockedLessons.push(...lessonUnlocks.data);
          }
        }
      }
    }

    return success(result);
  }
}
