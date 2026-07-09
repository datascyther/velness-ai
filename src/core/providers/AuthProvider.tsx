import { useEffect } from 'react';
import { useAppStore } from '@/core/store/useAppStore';
import { authService } from '@/services/auth';
import { useProfileSync } from '@/hooks/useProfileSync';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useAppStore((state) => state.session.user);
  const uid = user?.uid ?? null;
  const setUser = useAppStore((state) => state.setUser);
  const clearSession = useAppStore((state) => state.clearSession);
  const setOnboardingCompleted = useAppStore((state) => state.setOnboardingCompleted);
  const setEmailVerified = useAppStore((state) => state.setEmailVerified);
  const setAuthInitialized = useAppStore((state) => state.setAuthInitialized);
  const initialize = useAppStore((state) => state.initialize);

  useProfileSync(uid);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (profile) => {
      if (profile) {
        setUser(profile);
        setEmailVerified(authService.isEmailVerified());
        const onboardingCompleted = await authService.isOnboardingCompleted();
        setOnboardingCompleted(onboardingCompleted);
      } else {
        clearSession();
      }
      setAuthInitialized(true);
    });

    return unsubscribe;
  }, [setUser, clearSession, setOnboardingCompleted, setEmailVerified, setAuthInitialized]);

  return <>{children}</>;
}

export default AuthProvider;
