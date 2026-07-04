import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import Animated, {
  FadeIn,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { spacing, borderRadius } from '@/core/theme';

export const WeeklyHistoryHeader = React.memo(() => {
  const { colors } = useTheme();

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.8, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.25, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={styles.header}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.titleContainer}>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.brand.primary}12` }]}>
          <TrendingUp size={15} color={colors.brand.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text.primary }]}>Weekly History</Text>
      </Animated.View>

      <Animated.View
        entering={FadeInRight.duration(400).delay(100)}
        style={[styles.badge, { backgroundColor: `${colors.brand.primary}08`, borderColor: `${colors.brand.primary}15` }]}
      >
        <View style={styles.liveSection}>
          <View style={styles.pulseRingContainer}>
            <Animated.View
              style={[
                styles.pulseRing,
                { borderColor: '#10B981' },
                ringStyle,
              ]}
            />
          </View>
          <View style={[styles.liveDot, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.liveText, { color: '#10B981' }]}>LIVE</Text>
        </View>
        <View style={[styles.badgeDivider, { backgroundColor: colors.border.default }]} />
        <Text style={[styles.weekText, { color: colors.text.secondary }]}>This Week</Text>
      </Animated.View>
    </View>
  );
});

WeeklyHistoryHeader.displayName = 'WeeklyHistoryHeader';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md + 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs + 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 1,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  liveSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pulseRingContainer: {
    width: 0,
    height: 0,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    top: -8,
    left: -8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  badgeDivider: {
    width: 1,
    height: 12,
    marginHorizontal: 6,
    opacity: 0.3,
  },
  weekText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
