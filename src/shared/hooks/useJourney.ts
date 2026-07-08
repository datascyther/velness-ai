import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { journeyRepository } from '@/repositories/JourneyRepository';
import { journeyCache } from '@/features/journey/services/JourneyCache';
import { JourneyNavigationService } from '@/features/journey/services/JourneyNavigationService';
import { useAuth } from '@/shared/hooks/useAuth';
import { useSyncStore } from '@/core/store/useSyncStore';
import { useJourneyStore } from '@/features/journey/store/useJourneyStore';
import { useRealtimeUserProgress } from '@/hooks/realtime/useRealtimeUserProgress';
import { useRealtimeExercises } from '@/hooks/realtime/useRealtimeExercises';
import { useRealtimePrograms } from '@/hooks/realtime/useRealtimePrograms';
import { ensureSeeded } from '@/features/journey/services/SeedService';
import { DEFAULT_CATEGORIES } from '@/features/journey/data/categories';
import { DEFAULT_EXERCISES } from '@/features/journey/data/exercises';
import { DEFAULT_RECOMMENDATIONS } from '@/features/journey/data/recommendations';
import { COMPLETION_STATUS } from '@/features/journey/constants';
import {
  computeStreak,
  computeWeeklyProgress,
  computeExercisesCompleted,
  getResumeProgress,
} from '@/features/journey/services/JourneyService';
import type { ExerciseWithProgress } from '@/features/journey/models/Exercise';
import type { JourneyProgress } from '@/features/journey/types/JourneyProgress';
import { logger } from '@/services/logging';

const cachedPromise = journeyCache.get();

export function useJourney() {
  const { user } = useAuth();
  const uid = user?.uid || null;
  const queryClient = useQueryClient();

  const [cachedJourney, setCachedJourney] = useState<JourneyProgress | null>(null);
  const [cachedExercises, setCachedExercises] = useState<ExerciseWithProgress[] | null>(null);
  const cacheRead = useRef(false);
  const seeded = useRef(false);

  const setCategories = useJourneyStore((state) => state.setCategories);
  const setTodaysRecommendation = useJourneyStore((state) => state.setTodaysRecommendation);
  const setJourneyProgress = useJourneyStore((state) => state.setJourneyProgress);
  const setUserProgress = useJourneyStore((state) => state.setUserProgress);

  useEffect(() => {
    if (cacheRead.current) return;
    cacheRead.current = true;

    cachedPromise.then((cached) => {
      if (cached) {
        setCachedJourney(cached);
      }
    });
  }, []);

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;

    ensureSeeded().catch((err) => {
      logger.warn('journey', 'SeedService background call failed', { error: String(err) });
    });
  }, []);

  const exercisesRealtime = useRealtimeExercises(uid);
  const userProgressRealtime = useRealtimeUserProgress(uid);
  const programsRealtime = useRealtimePrograms(uid);

  const exercisesQuery = useQuery({
    queryKey: ['journey', 'exercises', uid],
    queryFn: async () => {
      if (!uid) return DEFAULT_EXERCISES.map((ex) => ({
        ...ex,
        completionStatus: COMPLETION_STATUS.AVAILABLE,
        streak: 0,
        lastCompletedAt: null,
      }));

      const progress = await journeyRepository.loadExerciseProgress(uid);
      return DEFAULT_EXERCISES.map((ex) => {
        const stored = progress[ex.id];
        if (stored) {
          return {
            ...ex,
            completionStatus: COMPLETION_STATUS.COMPLETED,
            streak: stored.streak,
            lastCompletedAt: stored.lastCompletedAt ?? null,
          };
        }
        return {
          ...ex,
          completionStatus: COMPLETION_STATUS.AVAILABLE,
          streak: 0,
          lastCompletedAt: null,
        };
      });
    },
    enabled: true,
  });

  const programsQuery = useQuery({
    queryKey: ['journey', 'programs', uid],
    queryFn: async () => {
      if (!uid) return [];
      const fromCloud = await journeyRepository.loadProgramsFromCloud();
      return fromCloud;
    },
    enabled: true,
  });

  const categoriesQuery = useQuery({
    queryKey: ['journey', 'categories'],
    queryFn: async () => DEFAULT_CATEGORIES,
    staleTime: Infinity,
  });

  const recommendationsQuery = useQuery({
    queryKey: ['journey', 'recommendations', uid],
    queryFn: async () => {
      if (!uid) return DEFAULT_RECOMMENDATIONS;
      return journeyRepository.loadRecommendations(uid);
    },
    enabled: true,
  });

  const userProgressQuery = useQuery({
    queryKey: ['journey', 'user-progress', uid],
    queryFn: async () => {
      if (!uid) return null;

      const realtimeData = queryClient.getQueryData(['journey', 'user-progress', uid]);
      if (realtimeData) return realtimeData as any;

      return journeyRepository.loadUserProgress(uid);
    },
    enabled: true,
  });

  const journeyQuery = useQuery({
    queryKey: ['journey', 'legacy', uid],
    queryFn: async () => {
      if (!uid) return null;
      return journeyRepository.computeUserProgress(uid);
    },
    enabled: true,
  });

  const activeExerciseId = journeyQuery.data?.resumeTarget?.exerciseId;
  const guidedProgressQuery = useQuery({
    queryKey: ['journey', 'active-guided-progress', activeExerciseId, uid],
    queryFn: async () => {
      if (!uid || !activeExerciseId) return null;
      try {
        const { guidedProgressRepository } = await import('../../../backend/repositories/GuidedProgressRepository');
        return guidedProgressRepository.get(activeExerciseId);
      } catch {
        return null;
      }
    },
    enabled: !!uid && !!activeExerciseId,
  });

  useEffect(() => {
    if (journeyQuery.data) {
      setCachedJourney(journeyQuery.data);
    }
  }, [journeyQuery.data]);

  useEffect(() => {
    if (exercisesQuery.data) {
      setCachedExercises(exercisesQuery.data);
    }
  }, [exercisesQuery.data]);

  useEffect(() => {
    if (categoriesQuery.data) {
      setCategories(categoriesQuery.data);
    }
  }, [categoriesQuery.data, setCategories]);

  useEffect(() => {
    if (recommendationsQuery.data && recommendationsQuery.data.length > 0) {
      setTodaysRecommendation(recommendationsQuery.data[0]);
    }
  }, [recommendationsQuery.data, setTodaysRecommendation]);

  useEffect(() => {
    if (userProgressQuery.data) {
      setUserProgress(userProgressQuery.data);
      const resumeProg = getResumeProgress(userProgressQuery.data);
      setJourneyProgress(resumeProg);
    }
  }, [userProgressQuery.data, setUserProgress, setJourneyProgress]);

  useEffect(() => {
    if (!uid) return;
    const timer = setTimeout(async () => {
      try {
        const merged = await journeyRepository.syncFromCloud(uid);
        if (merged) {
          queryClient.setQueryData(['journey', 'legacy', uid], merged);
        }
        queryClient.invalidateQueries({ queryKey: ['journey', 'exercises', uid] });
        queryClient.invalidateQueries({ queryKey: ['journey', 'user-progress', uid] });
        queryClient.invalidateQueries({ queryKey: ['journey', 'recommendations', uid] });
      } catch (error) {
        logger.warn('journey', 'Background sync failed', { error: String(error) });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [uid, queryClient]);

  const pendingQueue = useSyncStore((state) => state.pendingQueue);
  const pendingProgress = useMemo(() => {
    return pendingQueue.filter(
      (item) => item.type === 'save_exercise_progress' && item.payload.uid === uid
    );
  }, [pendingQueue, uid]);

  const exercises = useMemo(() => {
    const base = exercisesQuery.data ?? cachedExercises ?? [];
    if (pendingProgress.length === 0) return base;
    return base.map((ex) => {
      const pending = pendingProgress.find((p) => p.payload.exerciseId === ex.id);
      if (pending) {
        return {
          ...ex,
          completionStatus: COMPLETION_STATUS.COMPLETED,
          streak: pending.payload.streak,
        };
      }
      return ex;
    });
  }, [exercisesQuery.data, cachedExercises, pendingProgress]);

  const categories = categoriesQuery.data ?? DEFAULT_CATEGORIES;
  const programs = programsQuery.data ?? [];
  const recommendations = recommendationsQuery.data ?? DEFAULT_RECOMMENDATIONS;
  const userProgress = userProgressQuery.data ?? null;

  const favorites = useMemo(() => {
    if (!userProgress || !userProgress.favorites || !programs) return [];
    return programs.filter((p) => userProgress.favorites?.includes(p.id));
  }, [userProgress, programs]);

  const toggleFavorite = useCallback(async (programId: string) => {
    if (!uid) return;
    await journeyRepository.toggleFavorite(uid, programId);
    await queryClient.invalidateQueries({ queryKey: ['journey', 'user-progress', uid] });
    await queryClient.invalidateQueries({ queryKey: ['journey', 'legacy', uid] });
  }, [uid, queryClient]);

  const streak = useMemo(() => {
    if (!userProgress) return 0;
    return computeStreak(userProgress);
  }, [userProgress]);

  const weeklyProgress = useMemo(() => {
    if (!exercisesQuery.data) return 0;
    const progressMap: Record<string, { completed: boolean; streak: number; lastCompletedAt?: Date }> = {};
    for (const ex of exercisesQuery.data) {
      if (ex.lastCompletedAt) {
        progressMap[ex.id] = {
          completed: true,
          streak: ex.streak,
          lastCompletedAt: ex.lastCompletedAt,
        };
      }
    }
    return computeWeeklyProgress(progressMap);
  }, [exercisesQuery.data]);

  const exercisesCompleted = useMemo(() => {
    if (!userProgress) return 0;
    return computeExercisesCompleted(userProgress);
  }, [userProgress]);

  const journey = journeyQuery.data ?? cachedJourney ?? null;

  const allQueries = [
    exercisesQuery,
    programsQuery,
    categoriesQuery,
    recommendationsQuery,
    userProgressQuery,
    journeyQuery,
    guidedProgressQuery,
  ];

  const isLoading = allQueries.every((q) => q.isLoading) && !journey && !cachedExercises;
  const isRefetching = allQueries.some((q) => q.isFetching && !q.isLoading);
  const error = allQueries.find((q) => q.error)?.error ?? null;

  const isEmpty =
    !isLoading &&
    !error &&
    exercises.length === 0;

  const isOnline = useSyncStore((state) => state.isOnline);
  const isOffline = !isOnline;

  const refresh = useCallback(async () => {
    if (!uid) return;
    await queryClient.invalidateQueries({ queryKey: ['journey'] });
  }, [uid, queryClient]);

  const resumeJourney = useCallback((j: JourneyProgress) => {
    const destination = JourneyNavigationService.resolve(j);
    const path = JourneyNavigationService.buildPath(destination);
    router.push(path as any);
  }, []);

  const refreshRecommendation = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['journey', 'recommendations', uid] });
  }, [queryClient, uid]);

  const startExercise = useCallback((exerciseId: string) => {
    const path = `/journey/exercise/${exerciseId}`;
    router.push(path as any);
  }, []);

  const completeLesson = useCallback(async (programId: string, lessonId: string) => {
    if (!uid) return;
    const lessonExercises = DEFAULT_EXERCISES.filter((ex) => ex.lessonId === lessonId);
    const exerciseIds = lessonExercises.map((ex) => ex.id);
    await journeyRepository.completeLessonAtomic(uid, programId, lessonId, exerciseIds);
    queryClient.invalidateQueries({ queryKey: ['journey', 'exercises', uid] });
    queryClient.invalidateQueries({ queryKey: ['journey', 'user-progress', uid] });
    queryClient.invalidateQueries({ queryKey: ['journey', 'legacy', uid] });
    queryClient.invalidateQueries({ queryKey: ['journey', 'active-guided-progress'] });
  }, [uid, queryClient]);

  return {
    exercises,
    categories,
    programs,
    recommendations,
    userProgress,
    streak,
    weeklyProgress,
    exercisesCompleted,
    journey,
    activeGuidedProgress: guidedProgressQuery.data || null,
    journeyLoading: isLoading,
    journeyError: error,
    isLoading,
    isRefetching,
    error,
    isEmpty,
    isOffline,
    isOnline,
    refresh,
    resumeJourney,
    refreshRecommendation,
    startExercise,
    completeLesson,
    favorites,
    toggleFavorite,
  };
}

export default useJourney;
