import { Timestamp } from 'firebase/firestore';
import type { ExerciseProgress } from '@/repositories/JourneyRepository';
import type { Exercise, ExerciseWithProgress } from './Exercise';
import type { Program } from './Program';
import type { Lesson } from './Lesson';
import type { ProgramProgress, UserProgress, ResumeTarget } from './Progress';
import type { Recommendation } from './Recommendation';
import type { Streak } from './Streak';
import { COMPLETION_STATUS } from '../constants';

function toDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  return undefined;
}

function dateOrNull(value: unknown): Date | null {
  return toDate(value) ?? null;
}

function serializeDate(d: Date | null | undefined): Timestamp | null {
  if (!d) return null;
  return Timestamp.fromDate(d);
}

export interface ExerciseProgressDoc {
  id: string;
  completed: boolean;
  streak: number;
  lastCompletedAt?: { toDate: () => Date } | Date | null;
}

export function exerciseProgressFromDoc(
  doc: { id: string; data: () => Record<string, unknown> }
): ExerciseProgress {
  const data = doc.data();
  return {
    completed: (data.completed as boolean) ?? false,
    streak: (data.streak as number) ?? 0,
    lastCompletedAt: toDate(data.lastCompletedAt),
  };
}

export function exerciseProgressToDoc(
  exerciseId: string,
  streak: number,
): Record<string, unknown> {
  return {
    id: exerciseId,
    completed: true,
    streak,
    lastCompletedAt: Timestamp.now(),
  };
}

export function exerciseProgressToExerciseWithProgress(
  base: { id: string; type: Exercise['type']; title: string; description: string; estimatedTime: number; lessonId: string; sortOrder: number; content: Record<string, unknown> },
  progress: ExerciseProgress | undefined,
): ExerciseWithProgress {
  return {
    ...base,
    completionStatus: progress?.completed
      ? COMPLETION_STATUS.COMPLETED
      : COMPLETION_STATUS.AVAILABLE,
    streak: progress?.streak ?? 0,
    lastCompletedAt: progress?.lastCompletedAt ?? null,
  };
}

export function progressMapToProgramProgress(
  programId: string,
  progressMap: Record<string, ExerciseProgress>,
  lessonIds: string[],
): ProgramProgress {
  const completedIds = lessonIds.filter((id) => progressMap[id]?.completed);
  const percent = lessonIds.length > 0
    ? Math.round((completedIds.length / lessonIds.length) * 100)
    : 0;
  const lastDates = Object.values(progressMap)
    .map((p) => p.lastCompletedAt)
    .filter((d): d is Date => !!d);

  return {
    programId,
    completedLessonIds: completedIds,
    completionPercent: percent,
    lastOpenedAt: lastDates.length > 0
      ? lastDates.reduce((latest, d) => (d > latest ? d : latest))
      : null,
    status: percent === 100 ? 'completed' : percent > 0 ? 'active' : 'not_started',
    resumeTarget: null,
  };
}

export function programFromDoc(doc: { id: string; data: () => Record<string, unknown> }): Program {
  const d = doc.data();
  return {
    id: doc.id,
    title: d.title as string,
    description: d.description as string,
    difficulty: d.difficulty as Program['difficulty'],
    duration: (d.duration as number) ?? 0,
    thumbnail: (d.thumbnail as string) ?? '',
    categoryId: d.categoryId as Program['categoryId'],
    lessonCount: (d.lessonCount as number) ?? 0,
    status: (d.status as Program['status']) ?? 'not_started',
    sortOrder: (d.sortOrder as number) ?? 0,
  };
}

export function programToDoc(program: Program): Record<string, unknown> {
  return {
    id: program.id,
    title: program.title,
    description: program.description,
    difficulty: program.difficulty,
    duration: program.duration,
    thumbnail: program.thumbnail,
    categoryId: program.categoryId,
    lessonCount: program.lessonCount,
    status: program.status,
    sortOrder: program.sortOrder,
  };
}

export function lessonFromDoc(doc: { id: string; data: () => Record<string, unknown> }): Lesson {
  const d = doc.data();
  return {
    id: doc.id,
    programId: d.programId as string,
    title: d.title as string,
    description: d.description as string,
    order: (d.order as number) ?? 0,
    duration: (d.duration as number) ?? 0,
    exerciseIds: (d.exerciseIds as string[]) ?? [],
  };
}

export function lessonToDoc(lesson: Lesson): Record<string, unknown> {
  return {
    id: lesson.id,
    programId: lesson.programId,
    title: lesson.title,
    description: lesson.description,
    order: lesson.order,
    duration: lesson.duration,
    exerciseIds: lesson.exerciseIds,
  };
}

export function exerciseFromDoc(doc: { id: string; data: () => Record<string, unknown> }): Exercise {
  const d = doc.data();
  return {
    id: doc.id,
    lessonId: d.lessonId as string,
    type: d.type as Exercise['type'],
    title: d.title as string,
    description: d.description as string,
    estimatedTime: (d.estimatedTime as number) ?? 0,
    content: (d.content as Record<string, unknown>) ?? {},
    sortOrder: (d.sortOrder as number) ?? 0,
  };
}

export function exerciseToDoc(exercise: Exercise): Record<string, unknown> {
  return {
    id: exercise.id,
    lessonId: exercise.lessonId,
    type: exercise.type,
    title: exercise.title,
    description: exercise.description,
    estimatedTime: exercise.estimatedTime,
    content: exercise.content,
    sortOrder: exercise.sortOrder,
  };
}

export function recommendationFromDoc(doc: { id: string; data: () => Record<string, unknown> }): Recommendation {
  const d = doc.data();
  return {
    id: doc.id,
    exerciseId: d.exerciseId as string,
    title: d.title as string,
    description: d.description as string,
    categoryId: d.categoryId as Recommendation['categoryId'],
    exerciseType: d.exerciseType as Recommendation['exerciseType'],
    durationMinutes: (d.durationMinutes as number) ?? 0,
    reason: (d.reason as string) ?? '',
  };
}

export function recommendationToDoc(rec: Recommendation): Record<string, unknown> {
  return {
    id: rec.id,
    exerciseId: rec.exerciseId,
    title: rec.title,
    description: rec.description,
    categoryId: rec.categoryId,
    exerciseType: rec.exerciseType,
    durationMinutes: rec.durationMinutes,
    reason: rec.reason,
  };
}

export function streakFromDoc(doc: { id: string; data: () => Record<string, unknown> }): Streak {
  const d = doc.data();
  const rawHistory = (d.streakHistory as Array<Record<string, unknown>>) ?? [];
  return {
    currentStreak: (d.currentStreak as number) ?? 0,
    longestStreak: (d.longestStreak as number) ?? 0,
    lastActivityDate: dateOrNull(d.lastActivityDate),
    streakHistory: rawHistory.map((entry) => ({
      date: dateOrNull(entry.date) ?? new Date(0),
      active: (entry.active as boolean) ?? false,
    })),
  };
}

export function streakToDoc(streak: Streak): Record<string, unknown> {
  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastActivityDate: serializeDate(streak.lastActivityDate),
    streakHistory: streak.streakHistory.map((entry) => ({
      date: serializeDate(entry.date),
      active: entry.active,
    })),
  };
}

export function userProgressFromDoc(doc: { id: string; data: () => Record<string, unknown> }): UserProgress {
  const d = doc.data();
  return {
    userId: (d.userId as string) ?? doc.id,
    totalExercisesCompleted: (d.totalExercisesCompleted as number) ?? 0,
    streakDays: (d.streakDays as number) ?? 0,
    lastActivityAt: dateOrNull(d.lastActivityAt),
    programProgress: (d.programProgress as Record<string, ProgramProgress>) ?? {},
  };
}

export function userProgressToDoc(progress: UserProgress): Record<string, unknown> {
  return {
    userId: progress.userId,
    totalExercisesCompleted: progress.totalExercisesCompleted,
    streakDays: progress.streakDays,
    lastActivityAt: serializeDate(progress.lastActivityAt),
    programProgress: progress.programProgress,
    updatedAt: Timestamp.now(),
  };
}
