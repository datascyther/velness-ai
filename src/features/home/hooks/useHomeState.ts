// src/features/home/hooks/useHomeState.ts
//
// React-Query wrapper around HomeService.fetchHomeState().
// HomeScreen calls this hook; the service owns all aggregation.

import { useQuery } from '@tanstack/react-query';
import { homeService } from '@/features/home/services/HomeService';

/** Stable query key — invalidate with ['homeState'] to force a refresh. */
export const HOME_STATE_QUERY_KEY = ['homeState'] as const;

export function useHomeState() {
  return useQuery({
    queryKey: HOME_STATE_QUERY_KEY,
    queryFn: () => homeService.fetchHomeState(),
    staleTime: 30_000, // 30 s — reduce redundant re-fetches while app is open
  });
}
