import React, { useCallback } from 'react';
import {
  View,
  Text,
  Dimensions,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Svg, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/core/store/useAppStore';
import type { UserProfile } from '@/services/auth/types';
import { analyticsService } from '@/services/analytics';
import { spacing, colors, typography, borderRadius } from '@/theme/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function WelcomeScreen() {
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);
  const setEmailVerified = useAppStore((state) => state.setEmailVerified);
  const setOnboardingCompleted = useAppStore((state) => state.setOnboardingCompleted);
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';

  const handleSignIn = useCallback(() => {
    analyticsService.trackEvent('login_attempt', { action: 'welcome_login' });
    router.push('/auth/login');
  }, [router]);

  const handleSignUp = useCallback(() => {
    analyticsService.trackEvent('login_attempt', { action: 'welcome_signup' });
    router.push('/auth/signup');
  }, [router]);

  const handleGuestMode = useCallback(() => {
    analyticsService.trackEvent('login_attempt', { action: 'welcome_guest' });

    // Create a mock guest user profile to bypass auth
    const guestProfile: UserProfile = {
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
  }, [setUser, setEmailVerified, setOnboardingCompleted, router]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary, justifyContent: 'center', alignItems: 'center' }}>
      {/* Premium Radial Glow Background */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
        <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
          <Defs>
            <RadialGradient
              id="bgGlow"
              cx="50%"
              cy="35%"
              rx="90%"
              ry="65%"
            >
              <Stop offset="0%" stopColor={isDark ? "#FFFFFF" : "#FFFFFF"} stopOpacity={isDark ? 0.35 : 0.9} />
              <Stop offset="30%" stopColor={isDark ? "#2563EB" : "#F1F4F9"} stopOpacity={isDark ? 0.7 : 0.9} />
              <Stop offset="70%" stopColor={isDark ? "#0B1E78" : "#E5E7EB"} stopOpacity={isDark ? 0.9 : 1.0} />
              <Stop offset="100%" stopColor={isDark ? "#050C3A" : "#F8F9FC"} stopOpacity={1.0} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#bgGlow)" />
        </Svg>
      </View>

      <SafeAreaView className="flex-1 px-6 justify-between py-12">
        <View className="flex-1 justify-center items-center">
          <Animated.View
            entering={FadeInDown.duration(800).springify()}
            className="items-center"
          >
            {/* Circle surrounding the brain logo */}
            <View
              style={{
                width: 84,
                height: 84,
                borderRadius: borderRadius.lg,
                backgroundColor: colors.surface.primary,
                borderColor: colors.border.default,
                borderWidth: 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 16,
                elevation: 10,
              }}
            >
              <Image
                source={require('@/shared/assets/neeva-logo.png')}
                style={{
                  width: 84,
                  height: 84,
                  resizeMode: 'contain',
                }}
              />
            </View>

            {/* Brand Title */}
            <Text style={{ color: colors.text.primary, ...typography.titleLarge }} className="text-5xl font-bold tracking-tight mt-6">
              Neeva
            </Text>

            {/* Subtext */}
            <Text style={{ color: colors.text.secondary, ...typography.textSecondary, marginTop: spacing.md, paddingHorizontal: 8, lineHeight: 24 }}>
              Your personal AI wellness companion
            </Text>
          </Animated.View>

          {/* Buttons (At the bottom) */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(800).springify()}
            className="space-y-4 w-full"
          >
            {/* Sign In Button */}
            <Pressable
              onPress={handleSignIn}
              className="rounded-full py-4.5 items-center w-full active:opacity-90 shadow-lg shadow-black/20"
              style={{
                backgroundColor: colors.brand.primary,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <Text style={{ color: colors.brand.contrastText, ...typography.buttonPrimary }}>
                Sign In
              </Text>
            </Pressable>

            {/* Create Account Button */}
            <Pressable
              onPress={handleSignUp}
              className="rounded-full py-4.5 items-center w-full active:opacity-90"
              style={{
                borderColor: colors.brand.primary,
                borderWidth: 1.5,
                backgroundColor: 'transparent',
              }}
            >
              <Text style={{ color: colors.brand.primary, ...typography.buttonPrimary }}>
                Create Account
              </Text>
            </Pressable>

            {/* Explore as Guest Button */}
            <Pressable
              onPress={handleGuestMode}
              className="rounded-full py-4.5 items-center w-full active:opacity-90"
              style={{
                backgroundColor: colors.surface.secondary,
                borderColor: colors.border.default,
                borderWidth: 1,
                borderRadius: borderRadius.md,
              }}
            >
              <Text style={{ color: colors.text.primary, ...typography.textSecondary }}>
                Explore as Guest
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
</View>
  );
}

export default WelcomeScreen;