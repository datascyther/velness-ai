import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { NeevaProvider } from '@/core/providers/NeevaProvider';
import { ToastContainer } from '@/shared/components/Toast';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { crashReporting } from '@/services/crashReporting';
import { analyticsService } from '@/services/analytics';

export default function RootLayout() {
  useEffect(() => {
    crashReporting.init();
    analyticsService.init();
  }, []);

  return (
    <ErrorBoundary>
      <NeevaProvider>
        <StatusBar style="light" />
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
      </NeevaProvider>
    </ErrorBoundary>
  );
}
