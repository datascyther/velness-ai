import { useQuery } from '@tanstack/react-query';

export function useRealtimeFeed(uid: string | null) {
  const key = ['feed', uid];

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      return [];
    },
    enabled: false,
  });
}
