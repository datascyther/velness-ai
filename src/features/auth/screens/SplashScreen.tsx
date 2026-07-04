import React, { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
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
import { Sparkles } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius, typography, colors } from '@/theme/tokens';

interface SplashScreenProps {
  onComplete: (destination: 'auth' | 'home') => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
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
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: borderRadius.md,
            backgroundColor: colors.surface.primary,
            borderWidth: 1,
            borderColor: colors.border.default,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Sparkles size={48} color="#8B5CF6" />
        </View>
      </Animated.View>

      {/* Title */}
      <Text style={{ ...typography.titleLarge, color: colors.text.primary, marginBottom: spacing.sm }}>
        Neeva
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