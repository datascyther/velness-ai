import React, { useCallback, useEffect } from 'react';
import {
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Vibration,
  Platform,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { typography } from '@/core/theme';
import { useTheme } from '@/hooks/useTheme';

export interface GradientButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  visible?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  colors?: readonly string[];
  style?: ViewStyle;
  className?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_SCALE = { damping: 15, stiffness: 400, mass: 0.6 };
const SPRING_OPACITY = { damping: 15, stiffness: 200 };

export const GradientButton = React.memo(({
  title,
  onPress,
  disabled = false,
  loading = false,
  visible = true,
  icon,
  size = 'md',
  colors: propColors,
  style,
  className = '',
}: GradientButtonProps) => {
  const { colors: themeColors } = useTheme();
  const colors = propColors || [themeColors.brand.primary, themeColors.brand.secondary];

  const scale = useSharedValue(1);
  const svOpacity = useSharedValue(1);
  const svShadowOpacity = useSharedValue(0.35);
  const svShadowRadius = useSharedValue(18);
  const svShadowHeight = useSharedValue(8);
  const svElevation = useSharedValue(8);

  useEffect(() => {
    svOpacity.value = withSpring(disabled ? 0.5 : 1.0, SPRING_OPACITY);
    if (!visible) {
      svShadowOpacity.value = withTiming(0, { duration: 0 });
      svShadowRadius.value = withTiming(0, { duration: 0 });
      svShadowHeight.value = withTiming(0, { duration: 0 });
      svElevation.value = withTiming(0, { duration: 0 });
    } else {
      const shadowOn = !(disabled || loading);
      svShadowOpacity.value = withSpring(shadowOn ? 0.35 : 0, SPRING_OPACITY);
      svShadowRadius.value = withSpring(shadowOn ? 18 : 0, SPRING_OPACITY);
      svShadowHeight.value = withSpring(shadowOn ? 8 : 0, SPRING_OPACITY);
      svElevation.value = withSpring(shadowOn ? 8 : 0, SPRING_OPACITY);
    }
  }, [disabled, loading, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: svOpacity.value,
    shadowOpacity: svShadowOpacity.value,
    shadowRadius: svShadowRadius.value,
    shadowOffset: {
      width: 0,
      height: svShadowHeight.value,
    },
    elevation: svElevation.value,
  }));

  const handlePressIn = useCallback(() => {
    if (!disabled && !loading) {
      const cfg = { damping: 15 };
      scale.value = withSpring(0.95, SPRING_SCALE);
      svShadowOpacity.value = withSpring(0.12, cfg);
      svShadowRadius.value = withSpring(6, cfg);
      svShadowHeight.value = withSpring(2, cfg);
      svElevation.value = withSpring(2, cfg);
    }
  }, [disabled, loading]);

  const handlePressOut = useCallback(() => {
    const cfg = { damping: 15 };
    scale.value = withSpring(1.0, SPRING_SCALE);
    if (disabled || loading || !visible) return;
    svShadowOpacity.value = withSpring(0.35, cfg);
    svShadowRadius.value = withSpring(18, cfg);
    svShadowHeight.value = withSpring(8, cfg);
    svElevation.value = withSpring(8, cfg);
  }, [disabled, loading, visible]);

  const handlePress = useCallback(async () => {
    if (disabled || loading) return;

    try {
      // Try high-quality native haptic impact
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      // Fallback to standard Vibration API if Haptics is unavailable
      try {
        if (Platform.OS === 'ios') {
          Vibration.vibrate(10);
        } else {
          Vibration.vibrate([0, 8]);
        }
      } catch (err) {
        console.debug('Haptics fallback failed:', err);
      }
    }

    onPress();
  }, [disabled, loading, onPress]);

  // Size specific styles
  const btnHeight = size === 'sm' ? 40 : size === 'md' ? 48 : 56;
  const btnRadius = size === 'sm' ? 12 : size === 'md' ? 16 : 20;
  const fontSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16;
  const iconLeftOffset = size === 'sm' ? 14 : size === 'md' ? 18 : 22;

  const activeShadowStyle = !disabled && !loading ? { shadowColor: themeColors.brand.primary } : {};
  const borderStyle = !disabled && !loading ? { borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)' } : {};

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        { height: btnHeight, borderRadius: btnRadius },
        activeShadowStyle,
        borderStyle,
        animatedStyle,
        style,
      ]}
      className={className}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {/* Background Gradient */}
      {!disabled && !loading && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="gradientBtnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={colors[0]} />
                <Stop offset="100%" stopColor={colors[1]} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" rx={btnRadius} fill="url(#gradientBtnGrad)" />
          </Svg>
        </View>
      )}

      {disabled && !loading && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: themeColors.background.secondary, borderRadius: btnRadius }]} pointerEvents="none" />
      )}

      {loading ? (
        <ActivityIndicator size="small" color={themeColors.brand.contrastText} />
      ) : (
        <View style={styles.contentRow}>
          {icon && (
            <View style={[styles.iconContainer, { left: iconLeftOffset }]} pointerEvents="none">
              {icon}
            </View>
          )}
          <Text style={[styles.text, { fontSize, color: themeColors.brand.contrastText }]}>{title}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    width: '100%',
    position: 'relative',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    position: 'relative',
    paddingHorizontal: 40,
  },
  iconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
    fontFamily: typography.fontFamily.display,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

export default GradientButton;
