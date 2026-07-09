import type { Exercise } from '../entities/Exercise';
import type { Lesson } from '../entities/Lesson';
import type { Program } from '../entities/Program';
import type { Journey } from '../entities/Journey';

export class ProgressEngine {
  calculateExercisePercentage(exercise: Exercise): number {
    return exercise.status === 'completed' ? 100 : 0;
  }

  calculateLessonPercentage(
    completedExerciseIds: string[],
    totalExerciseCount: number,
  ): number {
    if (totalExerciseCount === 0) return 0;
    return Math.round((completedExerciseIds.length / totalExerciseCount) * 100);
  }

  calculateProgramPercentage(
    completedLessonIds: string[],
    totalLessonCount: number,
  ): number {
    if (totalLessonCount === 0) return 0;
    return Math.round((completedLessonIds.length / totalLessonCount) * 100);
  }

  calculateJourneyPercentage(
    completedProgramCount: number,
    totalProgramCount: number,
  ): number {
    if (totalProgramCount === 0) return 0;
    return Math.round((completedProgramCount / totalProgramCount) * 100);
  }

  getCurrentLesson(
    completedLessonIds: string[],
    lessons: Lesson[],
  ): string | null {
    const remaining = lessons
      .filter(l => !completedLessonIds.includes(l.id))
      .sort((a, b) => a.order - b.order);
    return remaining[0]?.id ?? null;
  }

  getCurrentExercise(
    completedExerciseIds: string[],
    exercises: Exercise[],
  ): string | null {
    const remaining = exercises.filter(
      e => !completedExerciseIds.includes(e.id),
    );
    return remaining[0]?.id ?? null;
  }

  estimateTimeRemaining(lessons: Lesson[], completedLessonIds: string[]): number {
    return lessons
      .filter(l => !completedLessonIds.includes(l.id))
      .reduce((sum, l) => sum + l.duration, 0);
  }

  isLessonComplete(
    exercises: Exercise[],
    completedExerciseIds: string[],
  ): boolean {
    return exercises.every(
      e => completedExerciseIds.includes(e.id) || e.status === 'skipped',
    );
  }

  isProgramComplete(
    lessons: Lesson[],
    completedLessonIds: string[],
  ): boolean {
    return lessons.every(l => completedLessonIds.includes(l.id));
  }

  countCompletedExercises(exercises: Exercise[]): number {
    return exercises.filter(e => e.status === 'completed').length;
  }

  countCompletedLessons(lessons: Lesson[]): number {
    return lessons.filter(l => l.status === 'completed').length;
  }
}
