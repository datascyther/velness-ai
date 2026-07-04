import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/shared/hooks/useAuth';
import { moodRepository } from '@/repositories/MoodRepository';
import { journeyRepository } from '@/repositories/JourneyRepository';
import { useRealtimePreferences } from '@/hooks/realtime/useRealtimePreferences';
import { getTimeOfDay } from '@/prompts/mentalWellnessPrompt';
import { personalizationEngine } from './PersonalizationEngine';
import type { PersonalizationInputs, PersonalizationOutput } from './types';
import { DEFAULT_EXERCISES } from '@/features/journey/data/exercises';

export function usePersonalization() {
  const { user } = useAuth();
  const uid = user?.uid || null;
  const userName = (user as any)?.name || (user as any)?.displayName || 'User';

  const { data: preferences } = useRealtimePreferences(uid);
  const defaultPrefs = useMemo(
    () => ({
      theme: 'auto' as const,
      notifications: true,
      language: 'en' as const,
      tone: 'auto' as const,
    }),
    [],
  );

  return useQuery({
    queryKey: ['personalization', uid],
    queryFn: async (): Promise<PersonalizationOutput> => {
      if (!uid) {
        return emptyOutput();
      }

      const [moodHistory, userProgress, streak] = await Promise.all([
        moodRepository.loadMoods(uid),
        journeyRepository.loadUserProgress(uid),
        journeyRepository.loadStreak(uid),
      ]);

      const recentExercises = DEFAULT_EXERCISES.map((ex) => ({
        ...ex,
        completionStatus: 'available' as const,
        streak: 0,
        lastCompletedAt: null,
      }));

      const inputs: PersonalizationInputs = {
        userId: uid,
        userName: userName === 'User' ? 'there' : userName.split(' ')[0],
        moodHistory,
        userProgress,
        programProgress: userProgress.programProgress,
        streak,
        preferences: preferences ?? defaultPrefs,
        recentExercises,
        allExercises: DEFAULT_EXERCISES,
        timeOfDay: getTimeOfDay(),
      };

      return personalizationEngine.generate(inputs);
    },
    enabled: !!uid,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

function emptyOutput(): PersonalizationOutput {
  return {
    todaysRecommendation: null,
    continueJourney: null,
    suggestedExercise: null,
    personalReflection: null,
  };
}
