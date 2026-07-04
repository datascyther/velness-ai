import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  writeBatch,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { storageService } from '@/services/storage';
import { journeyCache } from '@/features/journey/services/JourneyCache';
import { ROUTES } from '@/core/config/routes';
import {
  programsRef,
  programLessonsRef,
  exercisesRef,
  userExercisesRef,
  userExerciseDocRef,
  userProgressDocRef,
  userRecommendationsRef,
  userRecommendationDocRef,
  userStreaksRef,
  userStreakDocRef,
} from '@/lib/firestore';
import {
  programFromDoc,
  lessonFromDoc,
  exerciseFromDoc,
  exerciseProgressFromDoc,
  exerciseProgressToDoc,
  recommendationFromDoc,
  recommendationToDoc,
  streakFromDoc,
  streakToDoc,
  userProgressFromDoc,
  userProgressToDoc,
} from '@/features/journey/models/dto';
import type { Program } from '@/features/journey/models/Program';
import type { Lesson } from '@/features/journey/models/Lesson';
import type { Exercise } from '@/features/journey/models/Exercise';
import type { UserProgress, ProgramProgress } from '@/features/journey/models/Progress';
import type { Recommendation } from '@/features/journey/models/Recommendation';
import type { Streak } from '@/features/journey/models/Streak';
import type { JourneyProgress } from '@/features/journey/types/JourneyProgress';
import { EXERCISE_TYPE, PROGRAM_STATUS } from '@/features/journey/constants';
import { DEFAULT_EXERCISES } from '@/features/journey/data/exercises';
import { DEFAULT_CATEGORIES } from '@/features/journey/data/categories';
import { DEFAULT_PROGRAMS, DEFAULT_LESSONS } from '@/features/journey/data/programs';
import { DEFAULT_RECOMMENDATIONS } from '@/features/journey/data/recommendations';
import { getRecommendations, computeStreak } from '@/features/journey/services/JourneyService';
import { logger } from '@/services/logging';

export interface ExerciseProgress {
  completed: boolean;
  streak: number;
  lastCompletedAt?: Date;
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

function computeJourneyFromProgress(
  progress: Record<string, ExerciseProgress>
): JourneyProgress {
  const completedCount = DEFAULT_EXERCISES.filter((ex) => progress[ex.id]?.completed).length;
  const totalCount = DEFAULT_EXERCISES.length;
  const allCompleted = completedCount === totalCount;
  const noneStarted = completedCount === 0;

  if (noneStarted) {
    return {
      programId: 'wellness-basics',
      title: DEFAULT_EXERCISES[0].title,
      currentLesson: 1,
      totalLessons: totalCount,
      completionPercent: 0,
      lastActivity: null,
      resumeTarget: {
        exerciseId: DEFAULT_EXERCISES[0].id,
        route: getDefaultRouteForExercise(DEFAULT_EXERCISES[0].type),
      },
      status: 'not_started',
    };
  }

  if (allCompleted) {
    return {
      programId: 'wellness-basics',
      title: DEFAULT_EXERCISES[0].title,
      currentLesson: totalCount,
      totalLessons: totalCount,
      completionPercent: 100,
      lastActivity: null,
      resumeTarget: null,
      status: 'completed',
    };
  }

  const firstUncompletedIndex = DEFAULT_EXERCISES.findIndex(
    (ex) => !progress[ex.id]?.completed
  );
  const nextExercise = DEFAULT_EXERCISES[firstUncompletedIndex];
  const lastActivityDates = DEFAULT_EXERCISES
    .map((ex) => progress[ex.id]?.lastCompletedAt)
    .filter((d): d is Date => !!d);
  const lastActivity = lastActivityDates.length > 0
    ? lastActivityDates.reduce((latest, d) => d > latest ? d : latest)
    : null;

  return {
    programId: 'wellness-basics',
    title: DEFAULT_EXERCISES[0].title,
    currentLesson: firstUncompletedIndex + 1,
    totalLessons: totalCount,
    completionPercent: Math.round((completedCount / totalCount) * 100),
    lastActivity,
    resumeTarget: {
      exerciseId: nextExercise.id,
      route: getDefaultRouteForExercise(nextExercise.type),
    },
    status: 'active',
  };
}

export class JourneyRepository {
  // ─── Programs ───────────────────────────────────────────────────────

  async loadProgramsFromCloud(): Promise<Program[]> {
    const ref = programsRef();
    if (!ref) return DEFAULT_PROGRAMS;

    try {
      const snapshot = await getDocs(ref);
      if (snapshot.empty) return DEFAULT_PROGRAMS;
      return snapshot.docs.map(programFromDoc);
    } catch (error) {
      logger.error('journey', 'Failed to load programs from cloud', { error: String(error) });
      return DEFAULT_PROGRAMS;
    }
  }

  async loadLessonsForProgram(programId: string): Promise<Lesson[]> {
    const ref = programLessonsRef(programId);
    if (!ref) return DEFAULT_LESSONS.filter((l) => l.programId === programId);

    try {
      const snapshot = await getDocs(ref);
      if (snapshot.empty) return DEFAULT_LESSONS.filter((l) => l.programId === programId);
      return snapshot.docs.map(lessonFromDoc);
    } catch (error) {
      logger.error('journey', 'Failed to load lessons', { programId, error: String(error) });
      return DEFAULT_LESSONS.filter((l) => l.programId === programId);
    }
  }

  async loadExercisesFromCloud(): Promise<Exercise[]> {
    const ref = exercisesRef();
    if (!ref) return DEFAULT_EXERCISES;

    try {
      const snapshot = await getDocs(ref);
      if (snapshot.empty) return DEFAULT_EXERCISES;
      return snapshot.docs.map(exerciseFromDoc);
    } catch (error) {
      logger.error('journey', 'Failed to load exercises from cloud', { error: String(error) });
      return DEFAULT_EXERCISES;
    }
  }

  // ─── Exercise Progress ──────────────────────────────────────────────

  async loadExerciseProgress(uid: string): Promise<Record<string, ExerciseProgress>> {
    if (!uid) return {};

    const local = await this.loadFromLocal(uid);
    if (Object.keys(local).length > 0) return local;

    const fromCloud = await this.loadExerciseFromCloud(uid);
    if (Object.keys(fromCloud).length > 0) {
      await this.persistLocal(uid, fromCloud);
    }
    return fromCloud;
  }

  private async loadExerciseFromCloud(uid: string): Promise<Record<string, ExerciseProgress>> {
    const ref = userExercisesRef(uid);
    if (!ref || !db) return {};

    try {
      const snapshot = await getDocs(ref);
      const results: Record<string, ExerciseProgress> = {};
      snapshot.docs.forEach((d) => {
        results[d.id] = exerciseProgressFromDoc(d);
      });
      return results;
    } catch (error) {
      logger.error('journey', 'Failed to load exercise progress from cloud', { uid, error: String(error) });
      return {};
    }
  }

  // ─── User Progress ──────────────────────────────────────────────────

  async loadUserProgress(uid: string): Promise<UserProgress> {
    if (!uid) {
      return { userId: '', totalExercisesCompleted: 0, streakDays: 0, lastActivityAt: null, programProgress: {} };
    }

    const key = getUserProgressKey(uid);
    const cached = await storageService.getJSON<UserProgress>(key);
    if (cached) return cached;

    const fromCloud = await this.loadUserProgressFromCloud(uid);
    if (fromCloud) {
      await storageService.setJSON(key, fromCloud);
      return fromCloud;
    }

    const progress = await this.loadExerciseProgress(uid);
    const completedCount = DEFAULT_EXERCISES.filter((ex) => progress[ex.id]?.completed).length;

    const completedLessonIds: string[] = [];
    for (const lesson of DEFAULT_LESSONS) {
      const allCompleted = lesson.exerciseIds.every((eid) => progress[eid]?.completed);
      if (allCompleted) completedLessonIds.push(lesson.id);
    }

    const lastActivityDates = DEFAULT_EXERCISES
      .map((ex) => progress[ex.id]?.lastCompletedAt)
      .filter((d): d is Date => !!d);
    const lastActivity = lastActivityDates.length > 0
      ? lastActivityDates.reduce((latest, d) => d > latest ? d : latest)
      : null;

    const totalCount = DEFAULT_EXERCISES.length;
    const completionPercent = totalCount > 0
      ? Math.round((completedCount / totalCount) * 100)
      : 0;

    const status = completedCount === 0
      ? PROGRAM_STATUS.NOT_STARTED
      : completedCount >= totalCount
      ? PROGRAM_STATUS.COMPLETED
      : PROGRAM_STATUS.ACTIVE;

    const programProgress: Record<string, ProgramProgress> = {
      'wellness-basics': {
        programId: 'wellness-basics',
        completedLessonIds,
        completionPercent,
        lastOpenedAt: lastActivity,
        status,
        resumeTarget: null,
      },
    };

    const userProgress: UserProgress = {
      userId: uid,
      totalExercisesCompleted: completedCount,
      streakDays: 0,
      lastActivityAt: lastActivity,
      programProgress,
    };

    await storageService.setJSON(key, userProgress);
    return userProgress;
  }

  private async loadUserProgressFromCloud(uid: string): Promise<UserProgress | null> {
    const ref = userProgressDocRef(uid);
    if (!ref) return null;

    try {
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return userProgressFromDoc(snap);
    } catch (error) {
      logger.error('journey', 'Failed to load user progress from cloud', { uid, error: String(error) });
      return null;
    }
  }

  async saveUserProgress(uid: string, progress: UserProgress): Promise<void> {
    if (!uid) return;

    const key = getUserProgressKey(uid);
    await storageService.setJSON(key, progress);

    const ref = userProgressDocRef(uid);
    if (!ref) return;

    try {
      await setDoc(ref, userProgressToDoc(progress), { merge: true });
    } catch (error) {
      logger.error('journey', 'Failed to save user progress to cloud', { uid, error: String(error) });
    }
  }

  // ─── Programs (local-first with cloud fallback) ─────────────────────

  async loadPrograms(uid: string): Promise<Program[]> {
    const key = `journey_programs_${uid}`;
    const cached = await storageService.getJSON<Program[]>(key);
    if (cached) return cached;

    const fromCloud = await this.loadProgramsFromCloud();
    await storageService.setJSON(key, fromCloud);
    return fromCloud;
  }

  // ─── Recommendations ────────────────────────────────────────────────

  async loadRecommendations(uid: string): Promise<Recommendation[]> {
    if (!uid) return DEFAULT_RECOMMENDATIONS;

    const fromCloud = await this.loadRecommendationsFromCloud(uid);
    if (fromCloud.length > 0) return fromCloud;

    const userProgress = await this.loadUserProgress(uid);
    return getRecommendations(userProgress, DEFAULT_CATEGORIES, DEFAULT_EXERCISES);
  }

  private async loadRecommendationsFromCloud(uid: string): Promise<Recommendation[]> {
    const ref = userRecommendationsRef(uid);
    if (!ref) return [];

    try {
      const snapshot = await getDocs(ref);
      return snapshot.docs.map(recommendationFromDoc);
    } catch (error) {
      logger.error('journey', 'Failed to load recommendations from cloud', { uid, error: String(error) });
      return [];
    }
  }

  async saveRecommendation(uid: string, rec: Recommendation): Promise<void> {
    const ref = userRecommendationDocRef(uid, rec.id);
    if (!ref) return;

    try {
      await setDoc(ref, recommendationToDoc(rec));
    } catch (error) {
      logger.error('journey', 'Failed to save recommendation', { uid, recId: rec.id, error: String(error) });
    }
  }

  // ─── Streaks ────────────────────────────────────────────────────────

  async loadStreak(uid: string): Promise<Streak> {
    if (!uid) {
      return { currentStreak: 0, longestStreak: 0, lastActivityDate: null, streakHistory: [] };
    }

    const year = String(new Date().getFullYear());
    const ref = userStreakDocRef(uid, year);
    if (!ref) {
      return { currentStreak: 0, longestStreak: 0, lastActivityDate: null, streakHistory: [] };
    }

    try {
      const snap = await getDoc(ref);
      if (snap.exists()) return streakFromDoc(snap);

      return { currentStreak: 0, longestStreak: 0, lastActivityDate: null, streakHistory: [] };
    } catch (error) {
      logger.error('journey', 'Failed to load streak', { uid, error: String(error) });
      return { currentStreak: 0, longestStreak: 0, lastActivityDate: null, streakHistory: [] };
    }
  }

  async saveStreak(uid: string, streak: Streak): Promise<void> {
    const year = String(new Date().getFullYear());
    const ref = userStreakDocRef(uid, year);
    if (!ref) return;

    try {
      await setDoc(ref, streakToDoc(streak), { merge: true });
    } catch (error) {
      logger.error('journey', 'Failed to save streak', { uid, error: String(error) });
    }
  }

  // ─── Active Journey (legacy) ────────────────────────────────────────

  async getActiveJourney(uid: string): Promise<JourneyProgress | null> {
    if (!uid) return null;
    const progress = await this.loadExerciseProgress(uid);
    return computeJourneyFromProgress(progress);
  }

  async computeUserProgress(uid: string): Promise<JourneyProgress> {
    const progress = await this.loadExerciseProgress(uid);
    return computeJourneyFromProgress(progress);
  }

  // ─── Save ───────────────────────────────────────────────────────────

  async saveProgress(
    uid: string,
    exerciseId: string,
    streak: number
  ): Promise<boolean> {
    if (!uid || !exerciseId) return false;

    const ref = userExerciseDocRef(uid, exerciseId);
    if (!ref) {
      await this.persistLocal(uid, {
        [exerciseId]: { completed: true, streak, lastCompletedAt: new Date() },
      });
      return true;
    }

    try {
      await setDoc(ref, exerciseProgressToDoc(exerciseId, streak), { merge: true });

      const mergedProgress = await this.persistLocal(uid, {
        [exerciseId]: { completed: true, streak, lastCompletedAt: new Date() },
      });

      if (Object.keys(mergedProgress).length > 0) {
        const journey = computeJourneyFromProgress(mergedProgress);
        await journeyCache.set(journey);
      }

      return true;
    } catch (error) {
      logger.error('journey', 'Failed to save progress', { uid, exerciseId, error: String(error) });
      throw error;
    }
  }

  async batchSaveProgress(
    uid: string,
    exercises: { exerciseId: string; streak: number }[],
  ): Promise<boolean> {
    if (!uid || exercises.length === 0 || !db) return false;

    try {
      const batch = writeBatch(db);

      for (const { exerciseId, streak } of exercises) {
        const ref = userExerciseDocRef(uid, exerciseId);
        if (ref) {
          batch.set(ref, exerciseProgressToDoc(exerciseId, streak), { merge: true });
        }
      }

      await batch.commit();

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

  // ─── Atomic Lesson Completion ───────────────────────────────────────

  async completeLessonAtomic(
    uid: string,
    programId: string,
    lessonId: string,
    exerciseIds: string[],
  ): Promise<boolean> {
    if (!uid || !db) return false;

    try {
      const userProgressRef = userProgressDocRef(uid);
      if (!userProgressRef) return false;

      await runTransaction(db, async (transaction) => {
        const progressSnap = await transaction.get(userProgressRef);
        let userProgress: UserProgress;

        if (progressSnap.exists()) {
          userProgress = userProgressFromDoc(progressSnap);
        } else {
          userProgress = {
            userId: uid,
            totalExercisesCompleted: 0,
            streakDays: 0,
            lastActivityAt: null,
            programProgress: {},
          };
        }

        const now = new Date();
        const prevActivity = userProgress.lastActivityAt;

        for (const exerciseId of exerciseIds) {
          const exRef = userExerciseDocRef(uid, exerciseId);
          if (exRef) {
            transaction.set(exRef, exerciseProgressToDoc(exerciseId, 1), { merge: true });
          }
        }

        const existingProg = userProgress.programProgress[programId];
        const completedLessonIds = existingProg
          ? [...new Set([...existingProg.completedLessonIds, lessonId])]
          : [lessonId];

        const programLessons = DEFAULT_LESSONS.filter((l) => l.programId === programId);
        const totalLessons = programLessons.length;
        const completionPercent = Math.round((completedLessonIds.length / totalLessons) * 100);

        const status =
          completionPercent >= 100 ? PROGRAM_STATUS.COMPLETED
          : completedLessonIds.length > 0 ? PROGRAM_STATUS.ACTIVE
          : PROGRAM_STATUS.NOT_STARTED;

        userProgress.programProgress[programId] = {
          programId,
          completedLessonIds,
          completionPercent,
          lastOpenedAt: now,
          status,
          resumeTarget: null,
        };

        userProgress.totalExercisesCompleted += exerciseIds.length;
        userProgress.lastActivityAt = now;

        if (!this.isSameDay(prevActivity, now)) {
          userProgress.streakDays += 1;
        }

        transaction.set(userProgressRef, { ...userProgressToUserProgressDoc(userProgress), lastActivityAt: serverTimestamp() }, { merge: true });
      });

      const localUpdates: Record<string, ExerciseProgress> = {};
      for (const exerciseId of exerciseIds) {
        localUpdates[exerciseId] = { completed: true, streak: 1, lastCompletedAt: new Date() };
      }
      await this.persistLocal(uid, localUpdates);

      return true;
    } catch (error) {
      logger.error('journey', 'Atomic lesson completion failed', { uid, programId, lessonId, error: String(error) });
      return false;
    }
  }

  private isSameDay(a: Date | null, b: Date): boolean {
    if (!a) return false;
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }

  // ─── Cloud sync ─────────────────────────────────────────────────────

  async syncFromCloud(uid: string): Promise<JourneyProgress | null> {
    if (!uid) return null;

    const cloudData = await this.loadExerciseFromCloud(uid);
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

  // ─── Local persistence ───────────────────────────────────────────────

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

  // ─── Private helpers ─────────────────────────────────────────────────

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

function userProgressToUserProgressDoc(progress: UserProgress): Record<string, unknown> {
  return {
    userId: progress.userId,
    totalExercisesCompleted: progress.totalExercisesCompleted,
    streakDays: progress.streakDays,
    lastActivityAt: progress.lastActivityAt,
    programProgress: progress.programProgress,
  };
}

export const journeyRepository = new JourneyRepository();
export default journeyRepository;
