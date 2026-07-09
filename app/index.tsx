/**
 * Velness — App Entry Gateway
 *
 * Determines the initial screen based on authentication state:
 *   Not authenticated → Login
 *   Authenticated, not onboarded → Onboarding
 *   Authenticated, onboarded → Home tabs
 *
 * This runs on every app launch to restore the correct session.
 */

import { useEffect, useState } from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
import { Redirect } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useAppStore } from '@/core/store/useAppStore';

const { width } = Dimensions.get('window');

export default function AppEntry() {
  const [isChecking, setIsChecking] = useState(true);
  const isAuthenticated = useAppStore((state) => state.session.isAuthenticated);
  const onboardingCompleted = useAppStore((state) => state.session.onboardingCompleted);
  const authInitialized = useAppStore((state) => state.session.initialized);

  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);

  useEffect(() => {
    logoScale.value = withSequence(
      withTiming(1.05, { duration: 700, easing: Easing.out(Easing.back()) }),
      withTiming(1, { duration: 200 })
    );
    logoOpacity.value = withTiming(1, { duration: 500 });
    titleOpacity.value = withTiming(1, { duration: 600 });
    titleY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.circle) });
  }, []);

  useEffect(() => {
    if (authInitialized) {
      setIsChecking(false);
    }
  }, [authInitialized]);

  useEffect(() => {
    const timeout = setTimeout(() => setIsChecking(false), 5000);
    return () => clearTimeout(timeout);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  if (isChecking) {
    return (
      <View className="flex-1 bg-app-dark items-center justify-center">
        <Animated.View style={logoAnimatedStyle} className="items-center mb-8">
          <Image
            source={require('@/shared/assets/velness-logo.jpg')}
            style={{
              width: width * 0.45,
              height: width * 0.45,
              resizeMode: 'contain',
              borderRadius: 32,
            }}
          />
        </Animated.View>

        <Animated.View style={titleAnimatedStyle} className="items-center">
          <Text className="text-white text-3xl font-bold tracking-tight">
            Velness
          </Text>
          <Text className="text-white/40 text-sm mt-2 font-medium">
            Your AI wellness companion
          </Text>
        </Animated.View>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/welcome" />;
  }

  if (!onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
