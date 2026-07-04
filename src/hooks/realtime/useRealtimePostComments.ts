import { useQuery } from '@tanstack/react-query';

export function useRealtimePostComments(postId: string | null) {
  return useQuery({
    queryKey: ['postComments', postId],
    queryFn: async () => {
      return [];
    },
    enabled: false,
  });
}
