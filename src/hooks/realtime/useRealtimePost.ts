import { useQuery } from '@tanstack/react-query';

export function useRealtimePost(postId: string | null) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      return null;
    },
    enabled: false,
  });
}
