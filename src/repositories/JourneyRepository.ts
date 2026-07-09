import { storageService } from '@/services/storage';
import { journeyCache } from '@/features/journey/services/JourneyCache';
import { ROUTES } from '@/core/config/routes';
import { programRepository } from '../../backend/repositories/ProgramRepository';
import { lessonRepository } from '../../backend/repositories/LessonRepository';
import { exerciseRepository } from '../../backend/repositories/ExerciseRepository';
import { progressRepository } from '../../backend/repositories/ProgressRepository';
import { recommendationRepository } from '../../backend/repositories/RecommendationRepository';
import { NotAuthenticatedError } from '../../backend/repositories/baseRepository';
import { programLessonProgressRepository } from '../../backend/repositories/ProgramLessonProgressRepository';
import { slugToUUID, uuidToSlug } from '@/features/journey/utils/uuidMapping';
import {
  programFromDoc,
  lessonFromDoc,
  exerciseFromDoc,
} from '@/features/journey/models/dto';
import type { Program } from '@/features/journey/models/Program';
import type { Lesson } from '@/features/journey/models/Lesson';
import type { Exercise } from '@/features/journey/models/Exercise';
import type { UserProgress, ProgramProgress } from '@/features/journey/models/Progress';
import type { Recommendation } from '@/features/journey/models/Recommendation';
import type { Streak } from '@/features/journey/models/Streak';
import type { JourneyProgress } from '@/features/journey/types/JourneyProgress';
import { EXERCISE_TYPE } from '@/features/journey/constants';
import { DEFAULT_EXERCISES } from '@/features/journey/data/exercises';
import { DEFAULT_CATEGORIES } from '@/features/journey/data/categories';
import { DEFAULT_PROGRAMS, DEFAULT_LESSONS } from '@/features/journey/data/programs';
import { DEFAULT_RECOMMENDATIONS } from '@/features/journey/data/recommendations';
import { getRecommendations, computeStreak } from '@/features/journey/services/JourneyService';
import { ensureSeeded } from '@/features/journey/services/SeedService';
import { moodRepository } from './MoodRepository';
import { logger } from '@/services/logging';

export interface ExerciseProgress {
  completed: boolean;
  streak: number;
  lastCompletedAt?: Date;
}

interface ProgressRow {
  id: string;
  completed_at: string | null;
  created_at: string;
  exercise_id: string | null;
  lesson_id: string | null;
  program_id: string | null;
  score: number | null;
  status: string;
  updated_at: string;
  user_id: string;
}

const EXERCISE_ROUTE_MAP: Record<string, string> = {
  [EXERCISE_TYPE.MEDITATION]: ROUTES.JOURNEY.EXERCISE,
  [EXERCISE_TYPE.BREATHING]: ROUTES.JOURNEY.EXERCISE,
  [EXERCISE_TYPE.JOURNALING]: ROUTES.JOURNEY.SESSION,
  [EXERCISE_TYPE.GRATITUDE]: ROUTES.JOURNEY.SESSION,
};

function getLocalKey(uid: string): string {
  return `journey_progress_${uid}`;
}

function getUserProgressKey(uid: string): string {
  return `journey_user_progress_${uid}`;
}

function getDefaultRouteForExercise(type: string): string {
  return EXERCISE_ROUTE_MAP[type] || ROUTES.JOURNEY.PLACEHOLDER;
}

function computeDynamicProgramProgress(
  programId: string,
  progress: Record<string, ExerciseProgress>
): ProgramProgress {
  const lessons = DEFAULT_LESSONS.filter((l) => l.programId === programId).sort((a, b) => a.order - b.order);
  const lessonIds = new Set(lessons.map((l) => l.id));
  const exercises = DEFAULT_EXERCISES.filter((ex) => lessonIds.has(ex.lessonId));

  const completedExercises = exercises.filter((ex) => progress[ex.id]?.completed);
  const completedExCount = completedExercises.length;
  const totalCount = exercises.length;

  const completedLessonIds: string[] = [];
  const startedLessonIds: string[] = [];
  const lessonDates: Record<string, Date[]> = {};

  for (const lesson of lessons) {
    const lessonExs = exercises.filter((ex) => ex.lessonId === lesson.id);
    const completedExs = lessonExs.filter((ex) => progress[ex.id]?.completed);
    
    const dates = completedExs.map((ex) => progress[ex.id]?.lastCompletedAt).filter((d): d is Date => !!d);
    if (dates.length > 0) {
      lessonDates[lesson.id] = dates;
      startedLessonIds.push(lesson.id);
    }

    const allCompleted = lessonExs.length > 0 && lessonExs.every((ex) => progress[ex.id]?.completed);
    if (allCompleted) {
      completedLessonIds.push(lesson.id);
    }
  }

  let completedCount = completedLessonIds.length;
  let totalLessons = lessons.length;
  let lockedLessons = 0;
  
  for (let i = 0; i < lessons.length; i++) {
    if (i > 0) {
      const prevL = lessons[i - 1];
      const prevCompleted = completedLessonIds.includes(prevL.id);
      if (!prevCompleted) {
        lockedLessons++;
      }
    }
  }

  const completionPercent = totalCount > 0 ? Math.round((completedExCount / totalCount) * 100) : 0;
  
  const currentLessonObj = lessons.find((l) => !completedLessonIds.includes(l.id)) || lessons[lessons.length - 1];
  const currentLessonNum = currentLessonObj ? currentLessonObj.order : 1;

  const uncompletedExercises = exercises.filter((ex) => !progress[ex.id]?.completed);
  const estimatedRemainingTime = uncompletedExercises.reduce((sum, ex) => sum + ex.estimatedTime, 0);

  let lastOpenedLesson: string | null = null;
  let latestDate: Date | null = null;
  for (const [lId, dates] of Object.entries(lessonDates)) {
    const maxDate = dates.reduce((a, b) => (a > b ? a : b));
    if (!latestDate || maxDate > latestDate) {
      latestDate = maxDate;
      lastOpenedLesson = lId;
    }
  }

  let startedAt: Date | null = null;
  const allCompletedDates = completedExercises
    .map((ex) => progress[ex.id]?.lastCompletedAt)
    .filter((d): d is Date => !!d);
  if (allCompletedDates.length > 0) {
    startedAt = allCompletedDates.reduce((a, b) => (a < b ? a : b));
  }

  let completedAt: Date | null = null;
  const allCompleted = totalCount > 0 && exercises.every((ex) => progress[ex.id]?.completed);
  if (allCompleted && allCompletedDates.length > 0) {
    completedAt = allCompletedDates.reduce((a, b) => (a > b ? a : b));
  }

  let status: 'not_started' | 'active' | 'completed' = 'not_started';
  if (allCompleted) {
    status = 'completed';
  } else if (completedExCount > 0) {
    status = 'active';
  }

  const nextExercise = exercises.find((ex) => !progress[ex.id]?.completed) || null;

  return {
    programId,
    completedLessonIds,
    completionPercent,
    lastOpenedAt: latestDate,
    status,
    resumeTarget: nextExercise
      ? {
          exerciseId: nextExercise.id,
          route: getDefaultRouteForExercise(nextExercise.type),
        }
      : null,
    totalLessons,
    completedLessons: completedCount,
    lockedLessons,
    completionPercentage: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
    currentLesson: currentLessonNum,
    estimatedRemainingTime,
    lastOpenedLesson,
    startedAt,
    completedAt,
  };
}

function computeJourneyFromProgress(
  progress: Record<string, ExerciseProgress>
): JourneyProgress {
  const programStates = DEFAULT_PROGRAMS.map((prog) => {
    return computeDynamicProgramProgress(prog.id, progress);
  });

  const activePrograms = programStates
    .filter((ps) => ps.status === 'active')
    .sort((a, b) => {
      const timeA = a.lastOpenedAt?.getTime() || 0;
      const timeB = b.lastOpenedAt?.getTime() || 0;
      return timeB - timeA;
    });

  if (activePrograms.length > 0) {
    const act = activePrograms[0];
    return {
      programId: act.programId,
      title: DEFAULT_PROGRAMS.find((p) => p.id === act.programId)?.title || '',
      currentLesson: act.currentLesson || 1,
      totalLessons: act.totalLessons || 5,
      completionPercent: act.completionPercent || 0,
      lastActivity: act.lastOpenedAt,
      resumeTarget: act.resumeTarget,
      status: act.status as any,
    };
  }

  const notStartedPrograms = programStates.filter((ps) => ps.status === 'not_started');
  if (notStartedPrograms.length > 0) {
    const firstProg = DEFAULT_PROGRAMS[0];
    const firstState = notStartedPrograms.find((ps) => ps.programId === firstProg.id);
    if (firstState) {
      return {
        programId: firstState.programId,
        title: firstProg.title,
        currentLesson: firstState.currentLesson || 1,
        totalLessons: firstState.totalLessons || 5,
        completionPercent: firstState.completionPercent || 0,
        lastActivity: firstState.lastOpenedAt,
        resumeTarget: firstState.resumeTarget,
        status: firstState.status as any,
      };
    }
  }

  const act = programStates[0];
  return {
    programId: act.programId,
    title: DEFAULT_PROGRAMS.find((p) => p.id === act.programId)?.title || '',
    currentLesson: act.currentLesson || 1,
    totalLessons: act.totalLessons || 5,
    completionPercent: act.completionPercent || 0,
    lastActivity: act.lastOpenedAt,
    resumeTarget: act.resumeTarget,
    status: act.status as any,
  };
}

function mapProgressRowsToMap(rows: ProgressRow[]): Record<string, ExerciseProgress> {
  const map: Record<string, ExerciseProgress> = {};
  for (const row of rows) {
    if (row.exercise_id) {
      const slug = uuidToSlug(row.exercise_id);
      if (slug) {
        map[slug] = {
          completed: row.status === 'completed',
          streak: row.score ?? 0,
          lastCompletedAt: row.completed_at ? new Date(row.completed_at) : undefined,
        };
      }
    }
  }
  return map;
}

export class JourneyRepository {
  async loadProgramsFromCloud(): Promise<Program[]> {
    try {
      const rows = await programRepository.list();
      if (rows.length === 0) return DEFAULT_PROGRAMS;
      return rows.map((row) => {
        const id = uuidToSlug(row.id) || row.id;
        const existing = DEFAULT_PROGRAMS.find((p) => p.id === id);
        return {
          id,
          title: row.title,
          description: row.description || existing?.description || '',
          difficulty: existing?.difficulty || 'beginner',
          duration: existing?.duration || 0,
          thumbnail: existing?.thumbnail || '',
          categoryId: (existing?.categoryId || 'general') as any,
          lessonCount: DEFAULT_LESSONS.filter((l) => l.programId === id).length,
          status: (row.status || 'not_started') as any,
          sortOrder: row.position,
          benefits: existing?.benefits || [],
          estimatedTime: existing?.estimatedTime || '',
        };
      });
    } catch (error) {
      logger.error('journey', 'Failed to load programs from Supabase', { error: String(error) });
      return DEFAULT_PROGRAMS;
    }
  }

  async loadLessonsForProgram(programId: string): Promise<Lesson[]> {
    try {
      const rows = await lessonRepository.listByProgram(slugToUUID(programId)!);
      if (rows.length === 0) return DEFAULT_LESSONS.filter((l) => l.programId === programId);
      return rows.map((row) => {
        const id = uuidToSlug(row.id) || row.id;
        const existing = DEFAULT_LESSONS.find((l) => l.id === id);
        return {
          id,
          programId: uuidToSlug(row.program_id) || row.program_id,
          title: row.title,
          description: row.description || existing?.description || '',
          order: row.position,
          duration: existing?.duration || 10,
          exerciseIds: DEFAULT_EXERCISES.filter((ex) => ex.lessonId === id).map((ex) => ex.id),
          introduction: existing?.introduction || '',
          learningObjective: existing?.learningObjective || '',
          reflectionPrompt: existing?.reflectionPrompt || '',
          completionSummary: existing?.completionSummary || '',
        };
      });
    } catch (error) {
      logger.error('journey', 'Failed to load lessons', { programId, error: String(error) });
      return DEFAULT_LESSONS.filter((l) => l.programId === programId);
    }
  }

  async loadExercisesFromCloud(): Promise<Exercise[]> {
    try {
      const rows = await exerciseRepository.list();
      if (rows.length === 0) return DEFAULT_EXERCISES;
      return rows.map((row) => {
        const id = uuidToSlug(row.id) || row.id;
        const existing = DEFAULT_EXERCISES.find((e) => e.id === id);
        return {
          id,
          lessonId: uuidToSlug(row.lesson_id) || row.lesson_id || existing?.lessonId || '',
          type: row.type as Exercise['type'],
          title: row.title,
          description: row.description || existing?.description || '',
          estimatedTime: row.duration,
          content: row.content as Record<string, unknown> || existing?.content || {},
          sortOrder: row.position,
          goal: existing?.goal || '',
          instructions: existing?.instructions || [],
          completionCriteria: existing?.completionCriteria || '',
        };
      });
    } catch (error) {
      logger.error('journey', 'Failed to load exercises from Supabase', { error: String(error) });
      return DEFAULT_EXERCISES;
    }
  }

  async loadExerciseProgress(uid: string): Promise<Record<string, ExerciseProgress>> {
    if (!uid) return {};

    const local = await this.loadFromLocal(uid);
    if (Object.keys(local).length > 0) return local;

    const fromCloud = await this.loadExerciseFromCloud();
    if (Object.keys(fromCloud).length > 0) {
      await this.persistLocal(uid, fromCloud);
    }
    return fromCloud;
  }

  private async loadExerciseFromCloud(): Promise<Record<string, ExerciseProgress>> {
    try {
      const rows = await progressRepository.list();
      return mapProgressRowsToMap(rows);
    } catch (error) {
      logger.error('journey', 'Failed to load exercise progress from Supabase', { error: String(error) });
      return {};
    }
  }

  async loadUserProgress(uid: string): Promise<UserProgress> {
    if (!uid) {
      return { userId: '', totalExercisesCompleted: 0, streakDays: 0, lastActivityAt: null, programProgress: {}, achievements: {}, favorites: [] };
    }

    const key = getUserProgressKey(uid);
    const cached = await storageService.getJSON<UserProgress>(key);
    if (cached) return cached;

    const progress = await this.loadExerciseProgress(uid);
    const completedCount = DEFAULT_EXERCISES.filter((ex) => progress[ex.id]?.completed).length;

    const lastActivityDates = DEFAULT_EXERCISES
      .map((ex) => progress[ex.id]?.lastCompletedAt)
      .filter((d): d is Date => !!d);
    const lastActivity = lastActivityDates.length > 0
      ? lastActivityDates.reduce((latest, d) => d > latest ? d : latest)
      : null;

    const programProgress: Record<string, ProgramProgress> = {};
    for (const prog of DEFAULT_PROGRAMS) {
      programProgress[prog.id] = computeDynamicProgramProgress(prog.id, progress);
    }

    const userProgress: UserProgress = {
      userId: uid,
      totalExercisesCompleted: completedCount,
      streakDays: 0,
      lastActivityAt: lastActivity,
      programProgress,
      achievements: {},
      favorites: [],
    };

    await storageService.setJSON(key, userProgress);
    return userProgress;
  }

  async saveUserProgress(uid: string, progress: UserProgress): Promise<void> {
    if (!uid) return;

    const key = getUserProgressKey(uid);
    await storageService.setJSON(key, progress);
  }

  async loadPrograms(uid: string): Promise<Program[]> {
    const key = `journey_programs_${uid}`;
    const cached = await storageService.getJSON<Program[]>(key);
    if (cached) return cached;

    const fromCloud = await this.loadProgramsFromCloud();
    await storageService.setJSON(key, fromCloud);
    return fromCloud;
  }

  async loadRecommendations(uid: string): Promise<Recommendation[]> {
    if (!uid) return DEFAULT_RECOMMENDATIONS;

    try {
      // Ensure the referenced exercises exist in the DB (seeded with the
      // matching slugToUUID ids) before we save recommendations that point
      // at them — otherwise the recommendations_exercise_id_fkey violates.
      await ensureSeeded();

      const [userProgress, moodHistory, exerciseProgress] = await Promise.all([
        this.loadUserProgress(uid),
        moodRepository.loadMoods(uid),
        this.loadExerciseProgress(uid),
      ]);

      const recentExercises = Object.entries(exerciseProgress)
        .filter(([_, ep]) => ep.lastCompletedAt)
        .map(([exerciseId]) => exerciseId);

      const completedLessons = Object.values(userProgress.programProgress).flatMap(
        (p) => p.completedLessonIds,
      );

      const recs = getRecommendations(
        userProgress,
        DEFAULT_CATEGORIES,
        DEFAULT_EXERCISES,
        moodHistory,
        recentExercises,
        completedLessons,
      );

      if (recs.length > 0) {
        for (const rec of recs) {
          this.saveRecommendation(uid, rec).catch((err) => {
            logger.warn('journey', 'Failed to save recommendation to Supabase', { err });
          });
        }
      }

      return recs;
    } catch (error) {
      logger.error('journey', 'Failed to compute recommendations dynamically, falling back', { error: String(error) });
      const userProgress = await this.loadUserProgress(uid);
      return getRecommendations(userProgress, DEFAULT_CATEGORIES, DEFAULT_EXERCISES);
    }
  }

  async saveRecommendation(uid: string, rec: Recommendation): Promise<void> {
    try {
      await this.insertRecommendation(slugToUUID(rec.exerciseId), rec);
    } catch (error) {
      if (error instanceof NotAuthenticatedError) return;
      // If the referenced exercise hasn't been seeded yet, save the
      // recommendation without the FK link instead of dropping it.
      if (error instanceof Error && error.message.includes('foreign key constraint')) {
        try {
          await this.insertRecommendation(null, rec);
          return;
        } catch (fallbackErr) {
          if (fallbackErr instanceof NotAuthenticatedError) return;
          logger.error('journey', 'Failed to save recommendation (null exercise)', {
            uid,
            recId: rec.id,
            error: String(fallbackErr),
          });
          return;
        }
      }
      logger.error('journey', 'Failed to save recommendation', { uid, recId: rec.id, error: String(error) });
    }
  }

  private async insertRecommendation(
    exerciseId: string | null,
    rec: Recommendation,
  ): Promise<void> {
    await recommendationRepository.create({
      exercise_id: exerciseId,
      reason: rec.reason,
      priority: 0,
      source: 'computed',
      journey_id: null,
      program_id: null,
      expires_at: null,
    });
  }

  async loadStreak(uid: string): Promise<Streak> {
    if (!uid) {
      return { currentStreak: 0, longestStreak: 0, lastActivityDate: null, streakHistory: [] };
    }

    try {
      const progress = await this.loadExerciseProgress(uid);
      const dates = Object.values(progress)
        .filter((p) => p.lastCompletedAt)
        .map((p) => p.lastCompletedAt!);
      
      const sortedDates = dates
        .map(d => new Date(d))
        .sort((a, b) => b.getTime() - a.getTime());

      let currentStreak = 0;
      let longestStreak = 0;
      let lastActivityDate: Date | null = null;

      if (sortedDates.length > 0) {
        lastActivityDate = sortedDates[0];
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - sortedDates[0].getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
          currentStreak = 1;
          let tempStreak = 1;
          for (let i = 0; i < sortedDates.length - 1; i++) {
            const d1 = sortedDates[i];
            const d2 = sortedDates[i + 1];
            const diff = (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
            if (diff <= 1.1 && diff >= 0.9) {
              tempStreak++;
            } else if (diff > 1.1) {
              break;
            }
          }
          currentStreak = tempStreak;
        }
        longestStreak = currentStreak; // fallback
      }

      return {
        currentStreak,
        longestStreak,
        lastActivityDate,
        streakHistory: sortedDates.map(d => ({ date: d, active: true }))
      };
    } catch {
      return { currentStreak: 0, longestStreak: 0, lastActivityDate: null, streakHistory: [] };
    }
  }

  async saveStreak(_uid: string, streak: Streak): Promise<void> {
    await storageService.setJSON('user_streak', streak);
  }

  async getActiveJourney(uid: string): Promise<JourneyProgress | null> {
    if (!uid) return null;
    const progress = await this.loadExerciseProgress(uid);
    return computeJourneyFromProgress(progress);
  }

  async computeUserProgress(uid: string): Promise<JourneyProgress> {
    const progress = await this.loadExerciseProgress(uid);
    return computeJourneyFromProgress(progress);
  }

  async toggleFavorite(uid: string, programId: string): Promise<void> {
    if (!uid) return;
    const userProgress = await this.loadUserProgress(uid);
    const favorites = userProgress.favorites || [];
    const index = favorites.indexOf(programId);
    if (index >= 0) {
      favorites.splice(index, 1);
    } else {
      favorites.push(programId);
    }
    userProgress.favorites = favorites;

    const key = getUserProgressKey(uid);
    await storageService.setJSON(key, userProgress);
  }

  async saveProgress(
    uid: string,
    exerciseId: string,
    streak: number
  ): Promise<boolean> {
    if (!uid || !exerciseId) return false;

    try {
      await progressRepository.create({
        exercise_id: slugToUUID(exerciseId),
        status: 'completed',
        score: streak,
        completed_at: new Date().toISOString(),
        lesson_id: null,
        program_id: null,
        journey_id: null,
      });

      const mergedProgress = await this.persistLocal(uid, {
        [exerciseId]: { completed: true, streak, lastCompletedAt: new Date() },
      });

      if (Object.keys(mergedProgress).length > 0) {
        const journey = computeJourneyFromProgress(mergedProgress);
        await journeyCache.set(journey);
        await this.syncProgramLessonProgressSupabase(uid, exerciseId, mergedProgress);
      }

      return true;
    } catch (error) {
      logger.error('journey', 'Failed to save progress', { uid, exerciseId, error: String(error) });
      throw error;
    }
  }

  private async syncProgramLessonProgressSupabase(
    uid: string,
    exerciseId: string,
    mergedProgress: Record<string, ExerciseProgress>
  ): Promise<void> {
    try {
      const exerciseObj = DEFAULT_EXERCISES.find((ex) => ex.id === exerciseId);
      if (!exerciseObj) return;

      const lessonObj = DEFAULT_LESSONS.find((l) => l.id === exerciseObj.lessonId);
      if (!lessonObj) return;

      const programId = lessonObj.programId;
      const programProg = computeDynamicProgramProgress(programId, mergedProgress);

      const statusMap: Record<string, "completed" | "locked" | "in_progress" | "available" | "mastered"> = {
        active: 'in_progress',
        completed: 'completed',
        locked: 'locked',
        available: 'available',
        mastered: 'mastered',
      };

      await programLessonProgressRepository.save(
        slugToUUID(programId)!,
        null,
        statusMap[programProg.status] || 'in_progress',
        programProg.completionPercentage || 0,
        programProg.lastOpenedAt,
        programProg.startedAt,
        programProg.completedAt
      );

      const lessons = DEFAULT_LESSONS.filter((l) => l.programId === programId).sort((a, b) => a.order - b.order);
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        const lessonExs = DEFAULT_EXERCISES.filter((ex) => ex.lessonId === lesson.id);
        const completedExs = lessonExs.filter((ex) => mergedProgress[ex.id]?.completed);

        let lessonStatus: 'locked' | 'available' | 'in_progress' | 'completed' = 'locked';
        const isCompleted = lessonExs.length > 0 && lessonExs.every((ex) => mergedProgress[ex.id]?.completed);

        if (isCompleted) {
          lessonStatus = 'completed';
        } else if (completedExs.length > 0) {
          lessonStatus = 'in_progress';
        } else {
          if (i === 0) {
            lessonStatus = 'available';
          } else {
            const prevLesson = lessons[i - 1];
            const prevCompleted = DEFAULT_EXERCISES.filter((ex) => ex.lessonId === prevLesson.id).every((ex) => mergedProgress[ex.id]?.completed);
            lessonStatus = prevCompleted ? 'available' : 'locked';
          }
        }

        const lessonPercent = lessonExs.length > 0 ? Math.round((completedExs.length / lessonExs.length) * 100) : 0;
        const lessonDates = completedExs.map((ex) => mergedProgress[ex.id]?.lastCompletedAt).filter((d): d is Date => !!d);
        const lastOpened = lessonDates.length > 0 ? lessonDates.reduce((a, b) => (a > b ? a : b)) : null;
        const started = lessonDates.length > 0 ? lessonDates.reduce((a, b) => (a < b ? a : b)) : null;
        const completed = isCompleted && lessonDates.length > 0 ? lessonDates.reduce((a, b) => (a > b ? a : b)) : null;

        await programLessonProgressRepository.save(
          slugToUUID(programId)!,
          slugToUUID(lesson.id)!,
          lessonStatus,
          lessonPercent,
          lastOpened,
          started,
          completed
        );
      }
    } catch (err) {
      logger.warn('journey', 'Failed to sync program/lesson progress to Supabase', { error: String(err) });
    }
  }

  async batchSaveProgress(
    uid: string,
    exercises: { exerciseId: string; streak: number }[],
  ): Promise<boolean> {
    if (!uid || exercises.length === 0) return false;

    try {
      for (const { exerciseId, streak } of exercises) {
        await progressRepository.create({
          exercise_id: slugToUUID(exerciseId),
          status: 'completed',
          score: streak,
          completed_at: new Date().toISOString(),
          lesson_id: null,
          program_id: null,
          journey_id: null,
        });
      }

      const localUpdates: Record<string, ExerciseProgress> = {};
      for (const { exerciseId, streak } of exercises) {
        localUpdates[exerciseId] = { completed: true, streak, lastCompletedAt: new Date() };
      }
      const mergedProgress = await this.persistLocal(uid, localUpdates);

      if (Object.keys(mergedProgress).length > 0) {
        const journey = computeJourneyFromProgress(mergedProgress);
        await journeyCache.set(journey);
      }

      return true;
    } catch (error) {
      logger.error('journey', 'Failed to batch save progress', { uid, error: String(error) });
      throw error;
    }
  }

  async completeLessonAtomic(
    uid: string,
    programId: string,
    lessonId: string,
    exerciseIds: string[],
  ): Promise<boolean> {
    if (!uid) return false;

    try {
      for (const exerciseId of exerciseIds) {
        await progressRepository.create({
          exercise_id: slugToUUID(exerciseId),
          status: 'completed',
          score: 1,
          completed_at: new Date().toISOString(),
          lesson_id: slugToUUID(lessonId),
          program_id: slugToUUID(programId),
          journey_id: null,
        });
      }

      const localUpdates: Record<string, ExerciseProgress> = {};
      for (const exerciseId of exerciseIds) {
        localUpdates[exerciseId] = { completed: true, streak: 1, lastCompletedAt: new Date() };
      }
      const mergedProgress = await this.persistLocal(uid, localUpdates);

      if (exerciseIds.length > 0) {
        await this.syncProgramLessonProgressSupabase(uid, exerciseIds[0], mergedProgress);
      }

      return true;
    } catch (error) {
      logger.error('journey', 'Atomic lesson completion failed', { uid, programId, lessonId, error: String(error) });
      return false;
    }
  }

  async syncFromCloud(uid: string): Promise<JourneyProgress | null> {
    if (!uid) return null;

    const cloudData = await this.loadExerciseFromCloud();
    let merged: Record<string, ExerciseProgress>;
    if (Object.keys(cloudData).length > 0) {
      merged = await this.persistLocal(uid, cloudData);
    } else {
      merged = await this.loadFromLocal(uid);
    }

    const journey = computeJourneyFromProgress(merged);
    if (journey) {
      await journeyCache.set(journey);
    }
    return journey;
  }

  async persistLocal(
    uid: string,
    progress: Record<string, ExerciseProgress>
  ): Promise<Record<string, ExerciseProgress>> {
    if (!uid) return {};
    try {
      const key = getLocalKey(uid);
      const existing = await this.loadFromLocal(uid);
      const merged = { ...existing, ...progress };
      await storageService.setJSON(key, merged);
      return merged;
    } catch (error) {
      logger.error('journey', 'Failed to persist local progress', { uid, error: String(error) });
      return {};
    }
  }

  private async loadFromLocal(uid: string): Promise<Record<string, ExerciseProgress>> {
    try {
      const data = await storageService.getJSON<Record<string, ExerciseProgress>>(
        getLocalKey(uid)
      );
      return data || {};
    } catch {
      return {};
    }
  }
}

export const journeyRepository = new JourneyRepository();
export default journeyRepository;
