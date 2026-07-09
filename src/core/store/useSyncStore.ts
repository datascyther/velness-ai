import { create } from 'zustand';
import { Platform } from 'react-native';
import { QueryClient } from '@tanstack/react-query';
import { storageService } from '@/services/storage';
import { moodRepository } from '@/repositories/MoodRepository';
import { journeyRepository } from '@/repositories/JourneyRepository';
import { profileRepository } from '@/repositories/ProfileRepository';
import { NotAuthenticatedError } from '../../../backend/repositories/baseRepository';
import { useAppStore } from './useAppStore';
import { logger } from '@/services/logging';
import type { Mood } from '@/shared/types';
import type { Recommendation } from '@/features/journey/models/Recommendation';
import type { Streak } from '@/features/journey/models/Streak';

const STORAGE_KEY = 'sync_queue';
const MAX_RETRIES = 5;

export interface SyncQueueItem {
  id: string;
  type: 'save_mood' | 'save_exercise_progress' | 'update_profile'
       | 'complete_lesson' | 'save_recommendation' | 'save_streak';
  payload: any;
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed';
  error?: string;
  retryCount: number;
}

export interface SyncState {
  pendingQueue: SyncQueueItem[];
  isSyncing: boolean;
  lastError: string | null;
  isOnline: boolean;
  initializeQueue: () => Promise<void>;
  enqueueItem: (
    type: SyncQueueItem['type'],
    payload: any,
    queryClient: QueryClient
  ) => Promise<void>;
  processQueue: (queryClient: QueryClient) => Promise<void>;
  clearQueue: () => Promise<void>;
  setOnlineStatus: (isOnline: boolean, queryClient?: QueryClient) => Promise<void>;
}

export async function checkOnline(): Promise<boolean> {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 3000);
    await fetch('https://www.google.com', { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
    clearTimeout(id);
    return true;
  } catch {
    return false;
  }
}

function isAlreadySynced(item: SyncQueueItem, queryClient: QueryClient): boolean {
  try {
    if (item.type === 'save_mood') {
      const { uid, entry } = item.payload;
      if (!uid || !entry?.id) return false;
      const cached = queryClient.getQueryData<any[]>(['moods', uid]);
      if (!cached) return false;
      return cached.some((m: any) => m.id === entry.id);
    }

    if (item.type === 'save_exercise_progress') {
      const { uid, exerciseId, streak } = item.payload;
      if (!uid || !exerciseId) return false;
      const cached = queryClient.getQueryData<any>(['exercises', uid]);
      if (!cached) return false;
      const existing = cached[exerciseId];
      return existing?.completed === true && existing?.streak >= streak;
    }

    if (item.type === 'complete_lesson') {
      const { uid, lessonId } = item.payload;
      if (!uid || !lessonId) return false;
      const cached = queryClient.getQueryData<any>(['journey', 'user-progress', uid]);
      if (!cached?.programProgress) return false;
      for (const prog of Object.values(cached.programProgress) as any[]) {
        if (prog.completedLessonIds?.includes(lessonId)) return true;
      }
      return false;
    }

    if (item.type === 'update_profile') {
      const { uid, updates } = item.payload;
      if (!uid || !updates) return false;
      const cached = queryClient.getQueryData<any>(['profile', uid]);
      if (!cached) return false;
      return Object.keys(updates).every((key) => cached[key] === updates[key]);
    }

    if (item.type === 'save_recommendation') {
      const { uid, recId } = item.payload;
      if (!uid || !recId) return false;
      const cached = queryClient.getQueryData<any[]>(['journey', 'recommendations', uid]);
      if (!cached) return false;
      return cached.some((r: any) => r.id === recId);
    }

    if (item.type === 'save_streak') {
      const { uid } = item.payload;
      if (!uid) return false;
      const cached = queryClient.getQueryData<any>(['journey', 'streak', uid]);
      return cached != null;
    }
  } catch {
    // If cache check fails, proceed with sync to be safe
  }
  return false;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  pendingQueue: [],
  isSyncing: false,
  lastError: null,
  isOnline: true,

  initializeQueue: async () => {
    try {
      const savedQueue = await storageService.getJSON<SyncQueueItem[]>(STORAGE_KEY);
      if (savedQueue && Array.isArray(savedQueue)) {
        const sanitized = savedQueue.map((item) =>
          item.status === 'syncing' ? { ...item, status: 'pending' as const } : item
        );
        set({ pendingQueue: sanitized });
      }
      const online = await checkOnline();
      set({ isOnline: online });
    } catch (err) {
      console.error('[useSyncStore] Queue initialization failed:', err);
    }
  },

  enqueueItem: async (type, payload, queryClient) => {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newItem: SyncQueueItem = {
      id,
      type,
      payload,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
    };

    logger.info('sync', 'Enqueue', { type, id });

    if (type === 'save_mood') {
      const { uid, entry } = payload;
      if (uid && entry) {
        await moodRepository.persistMoods(uid, [entry]);
      }
    }

    const updatedQueue = [...get().pendingQueue, newItem];
    set({ pendingQueue: updatedQueue });
    await storageService.setJSON(STORAGE_KEY, updatedQueue);

    if (type === 'save_mood') {
      const { uid, entry } = payload;
      if (uid && entry) {
        queryClient.setQueryData(['moods', uid], (old: any[] = []) => {
          if (old.some((m) => m.id === entry.id)) return old;
          return [...old, entry];
        });
        queryClient.invalidateQueries({ queryKey: ['journey', 'recommendations', uid] });
        queryClient.invalidateQueries({ queryKey: ['personalization', uid] });
      }
    } else if (type === 'save_exercise_progress' || type === 'complete_lesson') {
      const { uid, exerciseId, exercises, streak } = payload;
      if (uid) {
        const updates: Record<string, any> = {};
        if (exerciseId) {
          updates[exerciseId] = { completed: true, streak: streak ?? 1 };
          await journeyRepository.persistLocal(uid, {
            [exerciseId]: { completed: true, streak: streak ?? 1, lastCompletedAt: new Date() },
          });
        }
        if (exercises && Array.isArray(exercises)) {
          for (const ex of exercises) {
            updates[ex.exerciseId] = { completed: true, streak: ex.streak ?? 1 };
          }
          await journeyRepository.persistLocal(uid, Object.fromEntries(
            exercises.map((ex: any) => [ex.exerciseId, { completed: true, streak: ex.streak ?? 1, lastCompletedAt: new Date() }])
          ));
        }
        queryClient.setQueryData(['exercises', uid], (old: Record<string, any> = {}) => {
          return { ...old, ...updates };
        });
      }
    } else if (type === 'update_profile') {
      const { uid, updates } = payload;
      if (uid && updates) {
        const userStore = useAppStore.getState();
        const currentUser = userStore.session.user;
        if (currentUser && currentUser.uid === uid) {
          userStore.setUser({ ...currentUser, ...updates });
        }
      }
    } else if (type === 'save_recommendation') {
      const { uid, recommendation } = payload;
      if (uid && recommendation) {
        queryClient.setQueryData(['journey', 'recommendations', uid], (old: any[] = []) => {
          const exists = old.some((r) => r.id === recommendation.id);
          if (exists) return old.map((r) => r.id === recommendation.id ? recommendation : r);
          return [...old, recommendation];
        });
      }
    }

    void get().processQueue(queryClient);
  },

  processQueue: async (queryClient) => {
    if (get().isSyncing) return;

    const online = await checkOnline();
    set({ isOnline: online });
    if (!online) return;

    const queue = get().pendingQueue;
    if (queue.length === 0) return;

    set({ isSyncing: true, lastError: null });

    const updatedQueue = [...queue];
    let hasChanges = false;

    for (let i = 0; i < updatedQueue.length; i++) {
      const item = updatedQueue[i];
      if (item.status === 'syncing') continue;

      if (item.retryCount >= MAX_RETRIES) {
        updatedQueue[i] = {
          ...item,
          status: 'failed',
          error: `Exceeded max retries (${MAX_RETRIES})`,
        };
        logger.error('sync', 'Max retries exceeded', { type: item.type, id: item.id });
        hasChanges = true;
        continue;
      }

      if (isAlreadySynced(item, queryClient)) {
        updatedQueue.splice(i, 1);
        i--;
        hasChanges = true;
        continue;
      }

      updatedQueue[i] = { ...item, status: 'syncing' };
      set({ pendingQueue: [...updatedQueue] });

      try {
        if (item.type === 'save_mood') {
          const { uid, entry } = item.payload as { uid: string; entry: Mood };
          await moodRepository.syncToCloud(uid, entry);
          queryClient.invalidateQueries({ queryKey: ['moods', uid] });
          queryClient.invalidateQueries({ queryKey: ['journey', 'recommendations', uid] });
          queryClient.invalidateQueries({ queryKey: ['personalization', uid] });
        } else if (item.type === 'save_exercise_progress') {
          const { uid, exerciseId, streak } = item.payload;
          await journeyRepository.saveProgress(uid, exerciseId, streak);
          queryClient.invalidateQueries({ queryKey: ['exercises', uid] });
        } else if (item.type === 'complete_lesson') {
          const { uid, programId, lessonId, exercises } = item.payload;
          const exerciseIds = (exercises ?? []).map((ex: any) => ex.exerciseId);
          await journeyRepository.completeLessonAtomic(uid, programId, lessonId, exerciseIds);
          queryClient.invalidateQueries({ queryKey: ['journey', 'exercises', uid] });
          queryClient.invalidateQueries({ queryKey: ['journey', 'user-progress', uid] });
          queryClient.invalidateQueries({ queryKey: ['journey', 'legacy', uid] });
        } else if (item.type === 'update_profile') {
          const { uid, updates } = item.payload;
          const currentProfile = useAppStore.getState().session.user;
          if (currentProfile) {
            await profileRepository.updateProfile(uid, updates, currentProfile);
          }
        } else if (item.type === 'save_recommendation') {
          const { uid, recommendation } = item.payload as { uid: string; recommendation: Recommendation };
          await journeyRepository.saveRecommendation(uid, recommendation);
          queryClient.invalidateQueries({ queryKey: ['journey', 'recommendations', uid] });
        } else if (item.type === 'save_streak') {
          const { uid, streak } = item.payload as { uid: string; streak: Streak };
          await journeyRepository.saveStreak(uid, streak);
          queryClient.invalidateQueries({ queryKey: ['journey', 'streak', uid] });
        }

        logger.info('sync', 'Processed', { type: item.type, id: item.id });
        updatedQueue.splice(i, 1);
        i--;
        hasChanges = true;
      } catch (error) {
        if (error instanceof NotAuthenticatedError) {
          // Cloud writes require a real Supabase session. In fallback guest mode
          // (no session) the local copy is the source of truth, so drop the item
          // instead of retrying/failing. It will sync once the user authenticates.
          logger.info('sync', 'Skipped cloud sync (not authenticated)', { type: item.type, id: item.id });
          updatedQueue.splice(i, 1);
          i--;
          hasChanges = true;
          continue;
        }

        logger.error('sync', 'Process error', { type: item.type, id: item.id, error: String(error) });

        const isNetworkError =
          error instanceof Error &&
          (error.message.includes('network') ||
            error.message.includes('offline') ||
            error.message.includes('connection') ||
            error.message.includes('Failed to fetch'));

        if (isNetworkError) {
          updatedQueue[i] = {
            ...item,
            status: 'pending',
            retryCount: item.retryCount + 1,
          };
          set({ isOnline: false });
          break;
        } else {
          updatedQueue[i] = {
            ...item,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Permanent failure',
            retryCount: item.retryCount + 1,
          };
          set({ lastError: error instanceof Error ? error.message : 'Sync execution failed' });
        }
        hasChanges = true;
      }
    }

    if (hasChanges) {
      set({ pendingQueue: updatedQueue });
      await storageService.setJSON(STORAGE_KEY, updatedQueue);
    }

    set({ isSyncing: false });
  },

  clearQueue: async () => {
    set({ pendingQueue: [], lastError: null });
    await storageService.delete(STORAGE_KEY);
  },

  setOnlineStatus: async (isOnline, queryClient) => {
    set({ isOnline });
    if (isOnline && queryClient) {
      void get().processQueue(queryClient);
    }
  },
}));

export default useSyncStore;
