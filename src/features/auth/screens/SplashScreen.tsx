import React, { useEffect, useRef } from 'react';
import { View, Text, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useAuth } from '@/shared/hooks/useAuth';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/theme/tokens';

interface SplashScreenProps {
  onComplete: (destination: 'auth' | 'home') => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const { colors } = useTheme();
  const { initialized, isAuthenticated, initialize } = useAuth();
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const hasNavigated = useRef(false);

  // Initialization
  useEffect(() => {
    initialize().catch(console.error);
  }, [initialize]);

  // Animation sequence
  useEffect(() => {
    logoScale.value = withSequence(
      withTiming(1.1, { duration: 600, easing: Easing.out(Easing.back()) }),
      withTiming(1, { duration: 200 })
    );
    logoOpacity.value = withTiming(1, { duration: 400 });

    setTimeout(() => {
      subtitleOpacity.value = withTiming(1, { duration: 400 });
    }, 300);
  }, [logoScale, logoOpacity, subtitleOpacity]);

  // Navigate once initialized
  useEffect(() => {
    if (initialized && !hasNavigated.current) {
      hasNavigated.current = true;
      const timer = setTimeout(() => {
        runOnJS(onComplete)(isAuthenticated ? 'home' : 'auth');
      }, 1200);
      return () => clearTimeout(timer);
    };
  }, [initialized, isAuthenticated, onComplete]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background.primary,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
      }}
    >
      {/* Animated Logo */}
      <Animated.View style={{ ...logoAnimatedStyle, marginBottom: spacing.lg }}>
        <Image
          source={require('@/shared/assets/velness-logo.jpg')}
          style={{
            width: 120,
            height: 120,
            resizeMode: 'contain',
            borderRadius: 24,
          }}
        />
      </Animated.View>

      {/* Title */}
      <Text style={{ ...typography.titleLarge, color: colors.text.primary, marginBottom: spacing.sm }}>
        Velness
      </Text>

      {/* Subtitle */}
      <Animated.View style={{ ...subtitleAnimatedStyle, marginBottom: spacing.md }}>
        <Text style={{ ...typography.textSecondary, textAlign: 'center', color: colors.text.secondary, opacity: 0.5 }}>
          Your personal wellness companion
        </Text>
      </Animated.View>

      {/* Loading indicator */}
      {!initialized && (
        <LoadingSpinner size={24} color="#8B5CF6" />
      )}
    </View>
  );
}

export default SplashScreen;