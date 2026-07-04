/**
 * Auth Service
 *
 * Wraps Firebase Authentication behind a clean interface.
 * Screens never call Firebase directly — always through this service.
 */

import { Platform } from 'react-native';
import {
  signInWithPopup,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { profileRepository } from '@/repositories/ProfileRepository';
import { storageService } from '@/services/storage';
import { analyticsService } from '@/services/analytics';
import type { UserProfile, AuthCredentials, SignUpData } from './types';

const STORAGE_KEYS = {
  SESSION_TOKEN: 'auth_session_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  ONBOARDING_COMPLETED: 'onboarding_completed',
} as const;

// ─── Firebase error code mapping ─────────────────────────────────────────

const FIREBASE_ERROR_MAP: Record<string, string> = {
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/popup-closed-by-user': 'Sign in was cancelled.',
  'auth/requires-recent-login': 'Please sign in again to continue.',
};

function requireAuth(): Auth {
  if (!auth) {
    throw new Error(
      'Firebase is not configured. Add EXPO_PUBLIC_FIREBASE_API_KEY to .env or run npm run firebase:sync-env.',
    );
  }
  return auth;
}

function mapFirebaseError(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    return FIREBASE_ERROR_MAP[code] || 'Something went wrong. Please try again.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

class AuthService {
  private currentUser: FirebaseUser | null = null;
  private userProfile: UserProfile | null = null;
  private listeners: Array<(user: UserProfile | null) => void> = [];
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;
  private authStateUnsubscribe: (() => void) | null = null;

  constructor() {
    this.initializationPromise = this.initialize();
  }

  private async hydrateProfile(user: FirebaseUser): Promise<UserProfile> {
    try {
      const profile = await profileRepository.loadProfile(user);
      if (profile) return profile;
      return profileRepository.createProfile(user);
    } catch {
      return {
        uid: user.uid,
        name: user.displayName || 'User',
        email: user.email || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        preferences: { theme: 'dark', notifications: true, language: 'en', tone: 'auto' },
        stats: { totalSessions: 1, totalMinutes: 0, streakDays: 0, lastActivityDate: new Date() },
      };
    }
  }

  private async initialize(): Promise<void> {
    if (!auth) {
      this.initialized = true;
      this.notifyListeners(null);
      return;
    }

    return new Promise((resolve) => {
      let ready = false;

      this.authStateUnsubscribe = onAuthStateChanged(
        auth,
        async (user) => {
          this.currentUser = user;
          if (user) {
            this.userProfile = await this.hydrateProfile(user);
          } else {
            this.userProfile = null;
          }

          this.notifyListeners(this.userProfile);

          if (!ready) {
            ready = true;
            this.initialized = true;
            resolve();
          }
        },
        (error) => {
          console.error('[AuthService] onAuthStateChanged error:', error);
          if (!ready) {
            ready = true;
            this.initialized = true;
            this.notifyListeners(null);
            resolve();
          }
        },
      );
    });
  }

  isConfigured(): boolean {
    return isFirebaseConfigured();
  }

  async waitForInitialization(): Promise<void> {
    if (this.initialized) return;
    await this.initializationPromise;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async signInWithEmail({ email, password }: AuthCredentials): Promise<UserProfile> {
    try {
      const result = await signInWithEmailAndPassword(requireAuth(), email, password);
      this.currentUser = result.user;
      await this.storeTokens(result.user);

      this.userProfile = await profileRepository.loadProfile(result.user);
      if (!this.userProfile) {
        this.userProfile = await profileRepository.createProfile(result.user);
      }

      if (this.userProfile) {
        this.userProfile = await profileRepository.updateProfile(
          result.user.uid,
          { lastLoginAt: new Date() },
          this.userProfile
        );
      }

      this.notifyListeners(this.userProfile);
      analyticsService.trackEvent('auth_signin', { method: 'email' });

      if (!this.userProfile) throw new Error('Failed to load profile');
      return this.userProfile;
    } catch (error) {
      throw new Error(mapFirebaseError(error));
    }
  }

  async signInWithGoogle(): Promise<UserProfile> {
    if (Platform.OS !== 'web') {
      throw new Error('Google sign-in in Expo Go is not configured yet. Use email/password for now.');
    }

    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.setCustomParameters({ prompt: 'select_account', access_type: 'online' });

    try {
      const result = await signInWithPopup(requireAuth(), provider);
      this.currentUser = result.user;
      await this.storeTokens(result.user);

      this.userProfile = await profileRepository.loadProfile(result.user);
      if (!this.userProfile) {
        this.userProfile = await profileRepository.createProfile(result.user);
      }

      if (this.userProfile) {
        this.userProfile = await profileRepository.updateProfile(
          result.user.uid,
          { lastLoginAt: new Date() },
          this.userProfile
        );
      }

      this.notifyListeners(this.userProfile);
      analyticsService.trackEvent('auth_signin', { method: 'google' });

      if (!this.userProfile) {
        throw new Error('Failed to load profile after Google sign-in');
      }
      return this.userProfile;
    } catch (popupError: any) {
      if (popupError.code === 'auth/popup-blocked') {
        await signInWithRedirect(requireAuth(), provider);
        throw new Error('Redirecting to Google sign-in...');
      }
      throw new Error(mapFirebaseError(popupError));
    }
  }

  async signUp(data: SignUpData): Promise<UserProfile> {
    try {
      const result = await createUserWithEmailAndPassword(requireAuth(), data.email, data.password);
      this.currentUser = result.user;

      await updateProfile(result.user, { displayName: data.name });
      await this.storeTokens(result.user);

      this.userProfile = await profileRepository.createProfile(result.user, data.name);

      // Send verification email
      try {
        await sendEmailVerification(result.user);
      } catch {
        // Non-critical: verification email may fail silently
      }

      this.notifyListeners(this.userProfile);
      analyticsService.trackEvent('auth_signup', { method: 'email' });

      return this.userProfile;
    } catch (error) {
      throw new Error(mapFirebaseError(error));
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(requireAuth());
      this.userProfile = null;
      this.currentUser = null;
      await this.clearTokens();
      this.notifyListeners(null);
      analyticsService.trackEvent('auth_signout');
    } catch (error) {
      throw new Error(mapFirebaseError(error));
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(requireAuth(), email);
      analyticsService.trackEvent('password_reset', {});
    } catch (error) {
      throw new Error(mapFirebaseError(error));
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    if (!this.currentUser || !this.userProfile) {
      throw new Error('No user logged in');
    }
    this.userProfile = await profileRepository.updateProfile(
      this.currentUser.uid,
      updates,
      this.userProfile
    );
    this.notifyListeners(this.userProfile);
  }

  /**
   * Send email verification to the current user.
   */
  async sendVerificationEmail(): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }
    try {
      await sendEmailVerification(this.currentUser);
    } catch (error) {
      throw new Error(mapFirebaseError(error));
    }
  }

  /**
   * Reload the current user and check email verification status.
   */
  async checkEmailVerified(): Promise<boolean> {
    if (!this.currentUser) return false;
    try {
      await this.currentUser.reload();
      return this.currentUser.emailVerified;
    } catch {
      return false;
    }
  }

  /**
   * Check if the current user's email is verified (cached value).
   */
  isEmailVerified(): boolean {
    return this.currentUser?.emailVerified ?? false;
  }

  /**
   * Restore session from Firebase auto-restore.
   */
  async restoreSession(): Promise<UserProfile | null> {
    if (this.currentUser && this.userProfile) {
      return this.userProfile;
    }
    if (!this.initialized) {
      await this.waitForInitialization();
    }
    return this.userProfile;
  }

  /**
   * Check if onboarding has been completed.
   */
  async isOnboardingCompleted(): Promise<boolean> {
    const stored = await storageService.get(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return stored === 'true';
  }

  /**
   * Mark onboarding as completed.
   */
  async markOnboardingCompleted(): Promise<void> {
    await storageService.set(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
  }

  getProfile(): UserProfile | null {
    return this.userProfile;
  }

  getCurrentFirebaseUser(): FirebaseUser | null {
    return this.currentUser;
  }

  onAuthStateChanged(listener: (user: UserProfile | null) => void): () => void {
    this.listeners.push(listener);
    if (this.userProfile) listener(this.userProfile);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  /**
   * Migrate guest user data to a permanent account.
   * Transfers exercise progress, user progress, and mood data
   * from the guest UID to the new Firebase UID.
   */
  async migrateGuestAccount(guestUid: string, newUid: string): Promise<void> {
    if (!guestUid || !newUid || guestUid === newUid) return;

    try {
      const { doc, getDoc, setDoc, getDocs, collection, writeBatch } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      if (!db) return;

      const batch = writeBatch(db);

      // Transfer exercise progress
      const guestExercisesSnap = await getDocs(collection(db, 'users', guestUid, 'exercises'));
      for (const exerciseDoc of guestExercisesSnap.docs) {
        const newRef = doc(db, 'users', newUid, 'exercises', exerciseDoc.id);
        batch.set(newRef, exerciseDoc.data(), { merge: true });
      }

      // Transfer user progress document
      const guestProgressSnap = await getDoc(doc(db, 'users', guestUid, 'progress', 'journey'));
      if (guestProgressSnap.exists()) {
        const newRef = doc(db, 'users', newUid, 'progress', 'journey');
        batch.set(newRef, guestProgressSnap.data(), { merge: true });
      }

      // Transfer recommendations
      const guestRecSnap = await getDocs(collection(db, 'users', guestUid, 'recommendations'));
      for (const recDoc of guestRecSnap.docs) {
        const newRef = doc(db, 'users', newUid, 'recommendations', recDoc.id);
        batch.set(newRef, recDoc.data(), { merge: true });
      }

      // Transfer streaks
      const guestStreakSnap = await getDocs(collection(db, 'users', guestUid, 'streaks'));
      for (const streakDoc of guestStreakSnap.docs) {
        const newRef = doc(db, 'users', newUid, 'streaks', streakDoc.id);
        batch.set(newRef, streakDoc.data(), { merge: true });
      }

      // Transfer moods
      const guestMoodsSnap = await getDocs(collection(db, 'users', guestUid, 'moods'));
      for (const moodDoc of guestMoodsSnap.docs) {
        const newRef = doc(db, 'users', newUid, 'moods', moodDoc.id);
        batch.set(newRef, moodDoc.data(), { merge: true });
      }

      await batch.commit();

      // Clear local cache for guest UID, migrate to new UID
      const { storageService } = await import('@/services/storage');
      const guestProgressKey = `journey_progress_${guestUid}`;
      const guestUserProgressKey = `journey_user_progress_${guestUid}`;
      const guestData = await storageService.getJSON(guestProgressKey);
      if (guestData) {
        await storageService.setJSON(`journey_progress_${newUid}`, guestData);
        await storageService.delete(guestProgressKey);
      }
      const guestUserData = await storageService.getJSON(guestUserProgressKey);
      if (guestUserData) {
        await storageService.setJSON(`journey_user_progress_${newUid}`, guestUserData);
        await storageService.delete(guestUserProgressKey);
      }

      await import('@/services/logging').then(({ logger }) => {
        logger.info('auth', 'Guest account migrated', { guestUid, newUid });
      });
    } catch (error) {
      const { logger } = await import('@/services/logging');
      logger.error('auth', 'Guest migration failed', { guestUid, newUid, error: String(error) });
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────

  private async storeTokens(user: FirebaseUser): Promise<void> {
    try {
      const tokenResult = await user.getIdTokenResult();
      await storageService.setSecure(STORAGE_KEYS.SESSION_TOKEN, tokenResult.token);
      if (user.refreshToken) {
        await storageService.setSecure(STORAGE_KEYS.REFRESH_TOKEN, user.refreshToken);
      }
    } catch {
      // Token storage is non-critical
    }
  }

  private async clearTokens(): Promise<void> {
    await storageService.deleteSecure(STORAGE_KEYS.SESSION_TOKEN);
    await storageService.deleteSecure(STORAGE_KEYS.REFRESH_TOKEN);
  }

  private notifyListeners(user: UserProfile | null): void {
    this.listeners.forEach((listener) => listener(user));
  }
}

export const authService = new AuthService();
export default authService;
