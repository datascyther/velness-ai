import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from 'backend/client';
import { journeyRepository } from '@/repositories/JourneyRepository';
import { uniqueChannelName } from './channelName';
import type { UserProgress } from '@/features/journey/models/Progress';

export function useRealtimeUserProgress(uid: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['journey', 'user-progress', uid];
  const enabled = !!uid;

  useEffect(() => {
    if (!uid) return;

    const channel = supabase
      .channel(uniqueChannelName(`user-progress-changes-${uid}`))
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
    queryFn: async (): Promise<UserProgress | null> => {
      if (!uid) return null;

      const cached = queryClient.getQueryData<UserProgress | null>(queryKey);
      if (cached) return cached;

      return journeyRepository.loadUserProgress(uid);
    },
    enabled,
    staleTime: Infinity,
  });
}
