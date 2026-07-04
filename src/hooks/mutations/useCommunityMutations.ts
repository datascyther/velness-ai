import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreatePost() {
  return useMutation({
    mutationFn: async () => {
      throw new Error('Community is disabled');
    },
  });
}

export function useDeletePost() {
  return useMutation({
    mutationFn: async () => {
      throw new Error('Community is disabled');
    },
  });
}

export function useAddComment() {
  return useMutation({
    mutationFn: async () => {
      throw new Error('Community is disabled');
    },
  });
}

export function useDeleteComment() {
  return useMutation({
    mutationFn: async () => {
      throw new Error('Community is disabled');
    },
  });
}

export function useToggleReaction() {
  return useMutation({
    mutationFn: async () => {
      throw new Error('Community is disabled');
    },
  });
}

export function useCreateReport() {
  return useMutation({
    mutationFn: async () => {
      throw new Error('Community is disabled');
    },
  });
}

export function useModerateReport() {
  return useMutation({
    mutationFn: async () => {
      throw new Error('Community is disabled');
    },
  });
}
