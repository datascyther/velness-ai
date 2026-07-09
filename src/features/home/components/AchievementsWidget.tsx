import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Smile, Zap, BookOpen, Sparkles, Sun, Lock } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/core/theme';
import Animated, {
  FadeInDown,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';

interface AchievementsWidgetProps {
  moodEntries: any[];
  streak: number;
  journals: any[];
  recentEvents: any[];
}

export const AchievementsWidget = React.memo(({
  moodEntries,
  streak,
  journals,
  recentEvents,
}: AchievementsWidgetProps) => {
  const { colors } = useTheme();

  // Dynamic achievement calculations (Phase 8)
  const achievements = useMemo(() => {
    // 1. First Check-in
    const firstCheckIn = moodEntries.length >= 1;

    // 2. 3 Day Streak
    const threeDayStreak = streak >= 3;

    // 3. Completed CBT
    const completedCBT = recentEvents.some((e) => e.event_name === 'cbt_lesson_completed');

    // 4. First Reflection
    const firstReflection = journals.length >= 1;

    // 5. Morning Habit: checked in or completed exercise before 10 AM
    const morningHabit = moodEntries.some((e) => {
      const hr = new Date(e.timestamp).getHours();
      return hr < 10;
    }) || recentEvents.some((e) => {
      const hr = new Date(e.created_at).getHours();
      return hr < 10;
    });

    return [
      {
        id: 'first_checkin',
        label: 'First Check-in',
        description: 'Log your first mood',
        unlocked: firstCheckIn,
        icon: Smile,
        color: '#30D158',
      },
      {
        id: 'three_streak',
        label: '3 Day Streak',
        description: 'Stay consistent 3 days',
        unlocked: threeDayStreak,
        icon: Zap,
        color: '#FF9F0A',
      },
      {
        id: 'completed_cbt',
        label: 'CBT Complete',
        description: 'Finish a CBT lesson',
        unlocked: completedCBT,
        icon: BookOpen,
        color: '#EC4899',
      },
      {
        id: 'first_reflection',
        label: 'First Reflection',
        description: 'Write a journal entry',
        unlocked: firstReflection,
        icon: Sparkles,
        color: '#5AC8FA',
      },
      {
        id: 'morning_habit',
        label: 'Morning Habit',
        description: 'Activity before 10 AM',
        unlocked: morningHabit,
        icon: Sun,
        color: '#FFD60A',
      },
    ];
  }, [moodEntries, streak, journals, recentEvents]);

  const completedCount = achievements.filter((a) => a.unlocked).length;

  // Gentle pulsing glow shared by all unlocked badges.
  const reduced = useReducedMotion();
  const glowPulse = useSharedValue(0);
  React.useEffect(() => {
    if (reduced) {
      glowPulse.value = 0.4;
      return;
    }
    const ease = Easing.inOut(Easing.ease);
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2600, easing: ease }),
        withTiming(0, { duration: 2600, easing: ease }),
      ),
      -1,
      true,
    );
  }, [reduced]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + glowPulse.value * 0.5,
    transform: [{ scale: 1 + glowPulse.value * 0.12 }],
  }));

  const progressVal = useSharedValue(0);
  React.useEffect(() => {
    progressVal.value = withTiming(completedCount / achievements.length, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [completedCount, achievements.length]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressVal.value * 100}%`,
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(250).duration(500)}
      style={[
        styles.card,
        { backgroundColor: colors.surface.primary, borderColor: colors.border.default },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Achievements</Text>
        <Text style={[styles.completedText, { color: colors.text.secondary }]}>
          {completedCount} / {achievements.length} completed
        </Text>
      </View>

      {/* Progress Track */}
      <View style={[styles.progressTrack, { backgroundColor: colors.surface.secondary }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.brand.primary,
            },
            progressStyle,
          ]}
        />
      </View>

      {/* Collectible badge grid */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgeScroll}
      >
        {achievements.map((ach, idx) => {
          const Icon = ach.icon;
          return (
            <Animated.View
              key={ach.id}
              entering={
                ach.unlocked
                  ? ZoomIn.delay(idx * 60).springify().damping(14)
                  : FadeInDown.delay(idx * 40).duration(400)
              }
              style={styles.badgeWrapper}
            >
              <View style={styles.badgeCircleWrap}>
                {ach.unlocked && (
                  <Animated.View
                    style={[styles.badgeGlow, { borderColor: ach.color }, glowStyle]}
                    pointerEvents="none"
                  />
                )}
              <View
                style={[
                  styles.badgeCircle,
                  ach.unlocked
                    ? {
                        backgroundColor: `${ach.color}18`,
                        borderColor: ach.color,
                        shadowColor: ach.color,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.25,
                        shadowRadius: 8,
                      }
                    : {
                        backgroundColor: `${colors.text.tertiary}08`,
                        borderColor: colors.border.default,
                      },
                ]}
              >
                {ach.unlocked ? (
                  <Icon size={20} color={ach.color} />
                ) : (
                  <View style={styles.lockOverlay}>
                    <Lock size={14} color={colors.text.tertiary} />
                  </View>
                )}
              </View>
              </View>
              <Text
                style={[
                  styles.badgeLabel,
                  {
                    color: ach.unlocked ? colors.text.primary : colors.text.tertiary,
                  },
                ]}
                numberOfLines={2}
              >
                {ach.label}
              </Text>
              <Text
                style={[
                  styles.badgeDesc,
                  { color: colors.text.secondary },
                ]}
                numberOfLines={1}
              >
                {ach.unlocked ? 'Unlocked' : ach.description}
              </Text>
            </Animated.View>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.lg,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.md + 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeScroll: {
    gap: spacing.md + 4,
    paddingRight: spacing.sm,
  },
  badgeWrapper: {
    alignItems: 'center',
    width: 90,
    gap: 6,
  },
  badgeCircleWrap: {
    position: 'relative',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeGlow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
  },
  badgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockOverlay: {
    opacity: 0.5,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  badgeDesc: {
    fontSize: 10,
    textAlign: 'center',
  },
});

export default AchievementsWidget;
