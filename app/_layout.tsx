import React, { useEffect } from 'react';
import '../src/global.css';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { VelnessProvider } from '@/core/providers/VelnessProvider';
import { ToastContainer } from '@/shared/components/Toast';
import { ThemeStatusBar } from '@/shared/components/ThemeStatusBar';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { crashReporting } from '@/services/crashReporting';
import { analyticsService } from '@/services/analytics';
import { storageService } from '@/services/storage';

const OLD_PERSIST_KEY = 'neeva-app-store';
const NEW_PERSIST_KEY = 'velness-app-store';

async function migratePersistedStore() {
  try {
    const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
    let oldData: string | null = null;

    if (isWeb && window.localStorage) {
      oldData = window.localStorage.getItem(OLD_PERSIST_KEY);
      if (oldData) {
        window.localStorage.setItem(NEW_PERSIST_KEY, oldData);
        window.localStorage.removeItem(OLD_PERSIST_KEY);
      }
    } else {
      try {
        const { getItemAsync, setItemAsync, deleteItemAsync } = require('expo-secure-store');
        oldData = await getItemAsync(OLD_PERSIST_KEY);
        if (oldData) {
          await setItemAsync(NEW_PERSIST_KEY, oldData);
          await deleteItemAsync(OLD_PERSIST_KEY);
        }
      } catch {}
    }

    await storageService.migrateFromOldStorage();
  } catch {}
}

export default function RootLayout() {
  useEffect(() => {
    migratePersistedStore().then(() => {
      crashReporting.init();
      analyticsService.init();
    });
  }, []);

  return (
    <ErrorBoundary>
      <VelnessProvider>
        <ThemeStatusBar />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ animation: 'fade' }} />
          <Stack.Screen name="auth/welcome" options={{ animation: 'fade' }} />
          <Stack.Screen name="auth/login" options={{ animation: 'fade' }} />
          <Stack.Screen name="auth/signup" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="auth/forgot-password" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="auth/email-verification" options={{ animation: 'fade' }} />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="journey/placeholder" options={{ animation: 'fade' }} />
          <Stack.Screen name="journey/library" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="journey/category/[categoryId]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="journey/program/[programId]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="journey/program/[programId]/lesson/[lessonId]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="journey/exercise/[exerciseId]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="journey/session/[sessionId]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="journey/completion" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="journey/progress" options={{ animation: 'slide_from_right' }} />
        </Stack>
        <ToastContainer />
      </VelnessProvider>
    </ErrorBoundary>
  );
}
