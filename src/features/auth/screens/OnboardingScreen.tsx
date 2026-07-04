import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/core/store/useAppStore';
import { useTheme } from '@/hooks/useTheme';
import { spacing, colors, typography } from '@/theme/tokens';

export function OnboardingScreen() {
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);
  const setEmailVerified = useAppStore((state) => state.setEmailVerified);
  const setOnboardingCompleted = useAppStore((state) => state.setOnboardingCompleted);
  const { colors } = useTheme();

  const handleGetStarted = () => {
    // Dummy implementation - in real app you'd progress through steps
    const guestProfile: any = {
      uid: `guest-${Date.now()}`,
      name: 'Guest User',
      email: `guest-${Date.now()}@example.com`,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      preferences: { theme: 'light', notifications: false, language: 'en', tone: 'auto' },
      stats: { totalSessions: 1, totalMinutes: 0, streakDays: 0, lastActivityDate: new Date() },
    };
    setUser(guestProfile);
    setEmailVerified(true);
    setOnboardingCompleted(true);
    const store = useAppStore.getState();
    store.setPreviousGuestUid(guestProfile.uid);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
        <Image
          source={require('@/shared/assets/neeva-logo.png')}
          style={{ width: 120, height: 120, marginBottom: spacing.md }}
        />
        <Text style={{ ...typography.headingLarge, color: colors.text.primary, textAlign: 'center' }}>
          Welcome to Neeva
        </Text>
        <Text style={{ ...typography.textSecondary, textAlign: 'center', marginVertical: spacing.md }}>
          Your personal AI wellness companion
        </Text>
        <Pressable
          onPress={handleGetStarted}
          style={{
            backgroundColor: colors.brand.primary,
            paddingVertical: 14,
            paddingHorizontal: 32,
            borderRadius: 12,
            marginTop: 24,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
            Get Started
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default OnboardingScreen;