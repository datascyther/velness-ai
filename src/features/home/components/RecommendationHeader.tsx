import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import {
  Sparkles,
  Heart,
  Sun,
  Moon,
  Compass,
  Feather,
} from 'lucide-react-native';
import { typography, spacing, borderRadius } from '@/core/theme';
import { useTheme } from '@/hooks/useTheme';

export interface RecommendationHeaderProps {
  title?: string;
  badgeText?: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);

// Helper to get custom badge style and Lucide icon dynamically
export const getBadgeStyleAndIcon = (badgeText: string) => {
  const text = badgeText.toLowerCase();

  if (text.includes('rescue')) {
    return {
      bg: 'rgba(244, 63, 94, 0.04)', // Softer Rose-500 tint
      border: 'rgba(244, 63, 94, 0.12)',
      color: '#FB7185', // Rose-400
      icon: Heart,
      gradient: ['#F43F5E', '#FB7185'] as const,
      glow: 'rgba(244, 63, 94, 0.15)',
    };
  }

  if (
    text.includes('harmony') ||
    text.includes('calm') ||
    text.includes('relax') ||
    text.includes('afternoon')
  ) {
    return {
      bg: 'rgba(6, 182, 212, 0.04)', // Softer Cyan-500 tint
      border: 'rgba(6, 182, 212, 0.12)',
      color: '#22D3EE', // Cyan-300
      icon: Compass,
      gradient: ['#06B6D4', '#22D3EE'] as const,
      glow: 'rgba(6, 182, 212, 0.15)',
    };
  }

  if (
    text.includes('morning') ||
    text.includes('focus') ||
    text.includes('clarity')
  ) {
    return {
      bg: 'rgba(245, 158, 11, 0.04)', // Softer Amber-500 tint
      border: 'rgba(245, 158, 11, 0.12)',
      color: '#FBBF24', // Amber-400
      icon: Sun,
      gradient: ['#D97706', '#FBBF24'] as const,
      glow: 'rgba(245, 158, 11, 0.15)',
    };
  }

  if (
    text.includes('evening') ||
    text.includes('wind down') ||
    text.includes('sleep')
  ) {
    return {
      bg: 'rgba(99, 102, 241, 0.04)', // Softer Indigo-500 tint
      border: 'rgba(99, 102, 241, 0.12)',
      color: '#818CF8', // Indigo-400
      icon: Moon,
      gradient: ['#4F46E5', '#818CF8'] as const,
      glow: 'rgba(99, 102, 241, 0.15)',
    };
  }

  if (text.includes('journey') || text.includes('step')) {
    return {
      bg: 'rgba(16, 185, 129, 0.04)', // Softer Emerald-500 tint
      border: 'rgba(16, 185, 129, 0.12)',
      color: '#34D399', // Emerald-400
      icon: Feather,
      gradient: ['#059669', '#34D399'] as const,
      glow: 'rgba(16, 185, 129, 0.15)',
    };
  }

  // Default (Mindfulness, AI Companion, etc.)
  return {
    bg: 'rgba(108, 76, 241, 0.04)', // Softer Purple-500 tint
    border: 'rgba(108, 76, 241, 0.12)',
    color: '#8B5CF6', // Purple-400
    icon: Sparkles,
    gradient: ['#6C4CF1', '#8B5CF6'] as const,
    glow: 'rgba(108, 76, 241, 0.15)',
  };
};

export const RecommendationHeader = React.memo(({
  title = 'Your Recommendation',
  badgeText,
}: RecommendationHeaderProps) => {
  const breathScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);
  const { colors } = useTheme();

  useEffect(() => {
    // Pulse animation mimicking a gentle breathing guide
    breathScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 4000 }),
        withTiming(1.0, { duration: 4000 })
      ),
      -1,
      true
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 4000 }),
        withTiming(0.3, { duration: 4000 })
      ),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: breathScale.value * 1.15 }],
      opacity: glowOpacity.value,
    };
  });

  const avatarAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: breathScale.value }],
    };
  });

  const badgeStyle = getBadgeStyleAndIcon(badgeText || '');
  const BadgeIcon = badgeStyle.icon;

  return (
    <View style={styles.container}>
      {/* Category badge introduces content at the top */}
      {badgeText ? (
        <View style={[styles.badgeContainer, { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border }]}>
          <BadgeIcon size={10} color={badgeStyle.color} />
          <Text style={[styles.badgeText, { color: badgeStyle.color }]}>
            {badgeText.toUpperCase()}
          </Text>
        </View>
      ) : null}

      {/* Row containing the title and the vertically centered breathing companion */}
      <View style={styles.titleRow}>
        <Text style={[styles.titleText, { color: colors.text.primary }]} allowFontScaling={true}>
          {title}
        </Text>

        {/* Velness Companion Avatar with Dynamic Breathing Glow */}
        <AnimatedView style={[styles.avatarContainer, avatarAnimatedStyle]}>
          <AnimatedView
            style={[
              styles.avatarGlow,
              glowStyle,
              { backgroundColor: badgeStyle.color, shadowColor: badgeStyle.color },
            ]}
          />
          <View style={[styles.avatarInner, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]}>
            <Svg width={36} height={36} viewBox="0 0 40 40">
              {/* Background face circle */}
              <Circle cx={20} cy={20} r={19} fill={colors.surface.secondary} stroke={badgeStyle.color} strokeWidth={1.2} />
              {/* Cute robot eyes */}
              <Circle cx={14} cy={17} r={2} fill={colors.brand.primary} />
              <Circle cx={26} cy={17} r={2} fill={colors.brand.primary} />
              {/* Robot smile path */}
              <Path
                d="M 14,24 A 6,6 0 0,0 26,24"
                fill="transparent"
                stroke={colors.brand.primary}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
              {/* Cute robot ears or side lights */}
              <Circle cx={3} cy={20} r={1.5} fill={badgeStyle.color} />
              <Circle cx={37} cy={20} r={1.5} fill={badgeStyle.color} />
            </Svg>
          </View>
        </AnimatedView>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: typography.fontFamily.sans,
    letterSpacing: 1.0,
    marginLeft: 5,
  },
  avatarContainer: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    zIndex: 1,
  },
  titleText: {
    flex: 1,
    marginRight: spacing.md,
    fontSize: 24,
    fontWeight: '900',
    fontFamily: typography.fontFamily.display,
    lineHeight: 30,
    letterSpacing: 0.2,
  },
});

export default RecommendationHeader;

