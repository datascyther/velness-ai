import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { profileRepository } from '../../backend/repositories/ProfileRepository';
import { authService } from '../../backend/services/AuthService';
import { useAppStore } from '@/core/store/useAppStore';

export function useProfileSync(uid: string | null) {
  const setUser = useAppStore((state) => state.setUser);
  const setTheme = useAppStore((state) => state.setTheme);

  const { data: profileRow } = useQuery({
    queryKey: ['profile', uid],
    queryFn: () => (uid ? profileRepository.getById(uid) : null),
    enabled: !!uid,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!profileRow) return;

    const authUser = authService.getCurrentUser();
    if (!authUser) return;

    setUser({
      uid: authUser.id,
      name: profileRow.display_name || authUser.email?.split('@')[0] || 'User',
      email: authUser.email || '',
      photoURL: profileRow.avatar_url || undefined,
      createdAt: new Date(profileRow.created_at),
      updatedAt: new Date(profileRow.updated_at),
      lastLoginAt: new Date(profileRow.last_login_at || profileRow.created_at),
      preferences: {
        theme: 'dark',
        notifications: true,
        language: (profileRow.locale as any) || 'en',
        tone: 'auto',
      },
      stats: {
        totalSessions: 0,
        totalMinutes: 0,
        streakDays: 0,
        lastActivityDate: new Date(),
      },
      onboardingCompleted: profileRow.onboarding_completed || false,
    });
  }, [profileRow, setUser]);
}
