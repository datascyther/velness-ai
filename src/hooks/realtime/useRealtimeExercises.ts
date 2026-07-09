import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from 'backend/client';
import { journeyRepository } from '@/repositories/JourneyRepository';
import { uniqueChannelName } from './channelName';

export interface ExerciseProgressDoc {
  id: string;
  completed: boolean;
  streak: number;
  lastCompletedAt?: Date;
}

export function useRealtimeExercises(uid: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['exercises', uid];
  const enabled = !!uid;

  useEffect(() => {
    if (!uid) return;

    const channel = supabase
      .channel(uniqueChannelName(`exercises-changes-${uid}`))
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'progress',
          filter: `user_id=eq.${uid}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [uid, queryClient]);

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!uid) return [];
      const progress = await journeyRepository.loadExerciseProgress(uid);
      return Object.entries(progress).map(([id, p]) => ({
        id,
        completed: p.completed,
        streak: p.streak,
        lastCompletedAt: p.lastCompletedAt,
      })) as ExerciseProgressDoc[];
    },
    enabled,
    staleTime: Infinity,
    select: (data: ExerciseProgressDoc[]) => {
      const record: Record<string, ExerciseProgressDoc> = {};
      data.forEach((doc) => {
        record[doc.id] = doc;
      });
      return record;
    },
  });
}
