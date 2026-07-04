import type { UserProgress, ProgramProgress } from '../models/Progress';
import type { Category } from '../models/Category';
import type { Exercise } from '../models/Exercise';
import type { Recommendation } from '../models/Recommendation';
import type { Milestone } from '../models/Milestone';
import type { Streak } from '../models/Streak';
import type { ExerciseProgress } from '@/repositories/JourneyRepository';
import { DEFAULT_RECOMMENDATIONS } from '../data/recommendations';
import { getTodaysRecommendations } from './RecommendationEngine';

export function computeStreak(userProgress: UserProgress): number {
  if (!userProgress.lastActivityAt) return 0;

  const lastActivity = new Date(userProgress.lastActivityAt);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays > 1) return 0;

  let streak = 1;
  const checkDate = new Date(lastActivity);
  checkDate.setDate(checkDate.getDate() - 1);

  while (true) {
    const dayStr = checkDate.toDateString();
    const hasActivity = Object.values(userProgress.programProgress).some((pp) => {
      if (!pp.lastOpenedAt) return false;
      return new Date(pp.lastOpenedAt).toDateString() === dayStr;
    });

    if (!hasActivity && streak > 0) {
      const earlierDate = new Date(checkDate);
      earlierDate.setDate(earlierDate.getDate() - 1);
      const earlierStr = earlierDate.toDateString();
      const hasEarlier = Object.values(userProgress.programProgress).some((pp) => {
        if (!pp.lastOpenedAt) return false;
        return new Date(pp.lastOpenedAt).toDateString() === earlierStr;
      });
      if (!hasEarlier) break;
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    }

    if (!hasActivity) break;
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

export function computeStreakV2(
  userProgress: UserProgress,
  streakData?: Streak,
): { current: number; longest: number } {
  if (streakData && streakData.streakHistory.length > 0) {
    const sorted = [...streakData.streakHistory].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
    let current = 0;
    for (const entry of sorted) {
      if (entry.active) current++;
      else break;
    }
    const longest = Math.max(current, streakData.longestStreak);
    return { current, longest };
  }

  const current = computeStreak(userProgress);
  return { current, longest: current };
}

export function computeWeeklyProgress(
  progressMap: Record<string, ExerciseProgress>
): number {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const activeDays = new Set<string>();

  for (const entry of Object.values(progressMap)) {
    if (entry.lastCompletedAt) {
      const date = new Date(entry.lastCompletedAt);
      if (date >= sevenDaysAgo && date <= now) {
        activeDays.add(date.toDateString());
      }
    }
  }

  return activeDays.size;
}

export function computeWeeklyProgressV2(
  progressMap: Record<string, ExerciseProgress>,
  today?: Date,
): { day: string; completed: boolean }[] {
  const now = today ?? new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days: { day: string; completed: boolean }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayStr = d.toDateString();
    const dayName = dayNames[d.getDay()];

    const hasActivity = Object.values(progressMap).some((entry) => {
      if (!entry.lastCompletedAt) return false;
      return new Date(entry.lastCompletedAt).toDateString() === dayStr;
    });

    days.push({ day: dayName, completed: hasActivity });
  }

  return days;
}

export function computeExercisesCompleted(userProgress: UserProgress): number {
  return userProgress.totalExercisesCompleted;
}

export function getResumeProgress(
  userProgress: UserProgress
): ProgramProgress | null {
  const activePrograms = Object.values(userProgress.programProgress)
    .filter((p) => p.status === 'active' && p.completionPercent > 0)
    .sort((a, b) => b.completionPercent - a.completionPercent);

  return activePrograms[0] || null;
}

export function computeNextLesson(
  programProgress: ProgramProgress,
  allLessons: { id: string; order: number }[],
): { lessonId: string; order: number } | null {
  const completedSet = new Set(programProgress.completedLessonIds);

  const sortedLessons = [...allLessons]
    .filter((l) => !completedSet.has(l.id))
    .sort((a, b) => a.order - b.order);

  const next = sortedLessons[0];
  if (!next) return null;
  return { lessonId: next.id, order: next.order };
}

export function computeAchievements(
  userProgress: UserProgress,
): Milestone[] {
  const milestones: Milestone[] = [
    { id: 'first-exercise', title: 'First Exercise', description: 'Complete your first exercise', requiredCount: 1, achievedAt: null },
    { id: 'five-exercises', title: 'Getting Started', description: 'Complete 5 exercises', requiredCount: 5, achievedAt: null },
    { id: 'first-lesson', title: 'First Lesson', description: 'Complete your first lesson', requiredCount: 1, achievedAt: null },
    { id: 'first-program', title: 'First Program', description: 'Complete your first program', requiredCount: 1, achievedAt: null },
    { id: 'ten-exercises', title: 'Dedicated', description: 'Complete 10 exercises', requiredCount: 10, achievedAt: null },
    { id: 'three-day-streak', title: '3-Day Streak', description: '3 days in a row', requiredCount: 3, achievedAt: null },
  ];

  const totalEx = userProgress.totalExercisesCompleted;
  const completedPrograms = Object.values(userProgress.programProgress)
    .filter((p) => p.status === 'completed');

  for (const ms of milestones) {
    if (ms.id === 'first-exercise' && totalEx >= 1) ms.achievedAt = new Date();
    if (ms.id === 'five-exercises' && totalEx >= 5) ms.achievedAt = new Date();
    if (ms.id === 'first-lesson') {
      const hasCompletedLesson = Object.values(userProgress.programProgress)
        .some((p) => p.completedLessonIds.length >= 1);
      if (hasCompletedLesson) ms.achievedAt = new Date();
    }
    if (ms.id === 'first-program' && completedPrograms.length >= 1) ms.achievedAt = new Date();
    if (ms.id === 'ten-exercises' && totalEx >= 10) ms.achievedAt = new Date();
    if (ms.id === 'three-day-streak' && userProgress.streakDays >= 3) ms.achievedAt = new Date();
  }

  return milestones;
}

export function getRecommendations(
  userProgress: UserProgress,
  categories: Category[],
  allExercises: Exercise[],
): Recommendation[] {
  return getTodaysRecommendations({
    userProgress,
    categories,
    allExercises,
    moodHistory: [],
    recentExercises: [],
    completedLessons: [],
    preferences: [],
  });
}

export function sortPrograms(
  programs: import('../models/Program').Program[],
  userProgress: UserProgress
): import('../models/Program').Program[] {
  const statusOrder: Record<string, number> = {
    active: 0,
    not_started: 1,
    completed: 2,
  };

  return [...programs].sort((a, b) => {
    const aProg = userProgress.programProgress[a.id];
    const bProg = userProgress.programProgress[b.id];
    const aStatus = aProg?.status ?? 'not_started';
    const bStatus = bProg?.status ?? 'not_started';
    const aOrder = statusOrder[aStatus] ?? 1;
    const bOrder = statusOrder[bStatus] ?? 1;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.sortOrder - b.sortOrder;
  });
}

export function filterProgramsByCategory(
  programs: import('../models/Program').Program[],
  categoryId: string
): import('../models/Program').Program[] {
  return programs.filter((p) => p.categoryId === categoryId);
}
