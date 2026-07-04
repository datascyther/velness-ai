import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRealtimeDocument } from '@/hooks/useRealtimeSubscription';
import { userProgressDocRef } from '@/lib/firestore';
import { isFirestoreReady } from '@/lib/firestore';
import { journeyRepository } from '@/repositories/JourneyRepository';
import type { UserProgress } from '@/features/journey/models/Progress';

export function useRealtimeUserProgress(uid: string | null) {
  const queryClient = useQueryClient();
  const enabled = !!(uid && isFirestoreReady());

  const docRef = useMemo(
    () => (uid && isFirestoreReady() ? userProgressDocRef(uid) : null),
    [uid],
  );

  useRealtimeDocument<UserProgress>(docRef, ['journey', 'user-progress', uid], enabled);

  return useQuery({
    queryKey: ['journey', 'user-progress', uid],
    queryFn: async (): Promise<UserProgress | null> => {
      if (!uid) return null;

      const cached = queryClient.getQueryData<UserProgress | null>(['journey', 'user-progress', uid]);
      if (cached) return cached;

      return journeyRepository.loadUserProgress(uid);
    },
    enabled,
    staleTime: Infinity,
  });
}
