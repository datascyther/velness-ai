import { useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from 'backend/client';
import { journeyRepository } from '@/repositories/JourneyRepository';
import { uniqueChannelName } from './channelName';
import type { Program } from '@/features/journey/models/Program';

export function useRealtimePrograms(uid: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['journey', 'programs', uid];
  const enabled = !!uid;

  useEffect(() => {
    if (!uid) return;

    const channel = supabase
      .channel(uniqueChannelName(`programs-changes-${uid}`))
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'programs' },
        () => {
          void queryClient.invalidateQueries({ queryKey });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [uid, queryClient]);

  const queryFn = useCallback(
    async (): Promise<Program[]> => {
      if (!uid) return [];

      const cached = queryClient.getQueryData<Program[]>(queryKey);
      if (cached && cached.length > 0) return cached;

      return journeyRepository.loadPrograms(uid);
    },
    [uid, queryClient, queryKey],
  );

  return useQuery({
    queryKey,
    queryFn,
    enabled,
    staleTime: 1000 * 60 * 30,
  });
}
