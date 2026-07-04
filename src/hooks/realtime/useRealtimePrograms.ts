import { useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRealtimeCollection } from '@/hooks/useRealtimeSubscription';
import { programsRef } from '@/lib/firestore';
import { isFirestoreReady } from '@/lib/firestore';
import { journeyRepository } from '@/repositories/JourneyRepository';
import { programFromDoc } from '@/features/journey/models/dto';
import type { Program } from '@/features/journey/models/Program';

export function useRealtimePrograms(uid: string | null) {
  const queryClient = useQueryClient();
  const enabled = !!(uid && isFirestoreReady());

  const programsQueryRef = useMemo(
    () => (uid && isFirestoreReady() ? programsRef() : null),
    [uid],
  );

  useRealtimeCollection<Program>(programsQueryRef, ['journey', 'programs', uid], enabled);

  const queryFn = useCallback(
    async (): Promise<Program[]> => {
      if (!uid) return [];

      const cached = queryClient.getQueryData<Program[]>(['journey', 'programs', uid]);
      if (cached && cached.length > 0) return cached;

      return journeyRepository.loadPrograms(uid);
    },
    [uid, queryClient],
  );

  return useQuery({
    queryKey: ['journey', 'programs', uid],
    queryFn,
    enabled,
    staleTime: 1000 * 60 * 30,
  });
}
