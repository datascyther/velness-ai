import type { Program } from './Program';
import type { Lesson } from './Lesson';
import type { Exercise } from './Exercise';
import type { ProgramProgress, UserProgress } from './Progress';
import { DIFFICULTY, CATEGORY_ID, PROGRAM_STATUS, EXERCISE_TYPE } from '../constants';

export function validateProgram(p: Partial<Program>): string[] {
  const errors: string[] = [];
  if (!p.id) errors.push('Program.id is required');
  if (!p.title) errors.push('Program.title is required');
  if (p.difficulty && !Object.values(DIFFICULTY).includes(p.difficulty as any)) {
    errors.push(`Program.difficulty must be one of: ${Object.values(DIFFICULTY).join(', ')}`);
  }
  if (p.categoryId && !Object.values(CATEGORY_ID).includes(p.categoryId as any)) {
    errors.push(`Program.categoryId must be one of: ${Object.values(CATEGORY_ID).join(', ')}`);
  }
  if (p.status && !Object.values(PROGRAM_STATUS).includes(p.status as any)) {
    errors.push(`Program.status must be one of: ${Object.values(PROGRAM_STATUS).join(', ')}`);
  }
  if (p.lessonCount !== undefined && p.lessonCount < 0) {
    errors.push('Program.lessonCount must be >= 0');
  }
  return errors;
}

export function validateLesson(l: Partial<Lesson>): string[] {
  const errors: string[] = [];
  if (!l.id) errors.push('Lesson.id is required');
  if (!l.programId) errors.push('Lesson.programId is required');
  if (!l.title) errors.push('Lesson.title is required');
  if (l.order !== undefined && l.order < 0) errors.push('Lesson.order must be >= 0');
  if (l.duration !== undefined && l.duration < 0) errors.push('Lesson.duration must be >= 0');
  if (l.exerciseIds && !Array.isArray(l.exerciseIds)) errors.push('Lesson.exerciseIds must be an array');
  return errors;
}

export function validateExercise(e: Partial<Exercise>): string[] {
  const errors: string[] = [];
  if (!e.id) errors.push('Exercise.id is required');
  if (!e.lessonId) errors.push('Exercise.lessonId is required');
  if (e.type && !Object.values(EXERCISE_TYPE).includes(e.type as any)) {
    errors.push(`Exercise.type must be one of: ${Object.values(EXERCISE_TYPE).join(', ')}`);
  }
  if (!e.title) errors.push('Exercise.title is required');
  if (e.estimatedTime !== undefined && e.estimatedTime < 0) errors.push('Exercise.estimatedTime must be >= 0');
  return errors;
}

export function validateProgramProgress(p: Partial<ProgramProgress>): string[] {
  const errors: string[] = [];
  if (!p.programId) errors.push('ProgramProgress.programId is required');
  if (p.status && !Object.values(PROGRAM_STATUS).includes(p.status as any)) {
    errors.push(`ProgramProgress.status must be one of: ${Object.values(PROGRAM_STATUS).join(', ')}`);
  }
  if (p.completionPercent !== undefined && (p.completionPercent < 0 || p.completionPercent > 100)) {
    errors.push('ProgramProgress.completionPercent must be 0\u2013100');
  }
  return errors;
}

export function getDefaultProgramProgress(programId: string): ProgramProgress {
  return {
    programId,
    completedLessonIds: [],
    completionPercent: 0,
    lastOpenedAt: null,
    status: 'not_started',
    resumeTarget: null,
  };
}

export function getDefaultUserProgress(userId: string): UserProgress {
  return {
    userId,
    totalExercisesCompleted: 0,
    streakDays: 0,
    lastActivityAt: null,
    programProgress: {},
  };
}
