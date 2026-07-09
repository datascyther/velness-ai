import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Check, Circle, Plus, Minus, Droplet, Sparkles, Smile, BookOpen, Heart, PartyPopper } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/core/theme';
import Animated, {
  FadeInDown,
  ZoomIn,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface DailyGoalsCardProps {
  uid: string | null;
  hasCheckedInToday: boolean;
  hasJournaledToday: boolean;
  recentEvents: any[];
  onCheckInPress: () => void;
  onJournalPress: () => void;
  onBreathePress: () => void;
  onMeditatePress: () => void;
}

export const DailyGoalsCard = React.memo(({
  uid,
  hasCheckedInToday,
  hasJournaledToday,
  recentEvents,
  onCheckInPress,
  onJournalPress,
  onBreathePress,
  onMeditatePress,
}: DailyGoalsCardProps) => {
  const { colors } = useTheme();
  const [waterCups, setWaterCups] = useState(0);
  const [loadingWater, setLoadingWater] = useState(true);

  // Check if breathing or meditation completed today
  const didBreathing = useMemo(() => {
    const todayStr = new Date().toDateString();
    return recentEvents.some(
      (e) =>
        (e.event_name === 'breathing_session_completed' || e.event_name === 'breathing_session_started') &&
        new Date(e.created_at).toDateString() === todayStr
    );
  }, [recentEvents]);

  const didMeditation = useMemo(() => {
    const todayStr = new Date().toDateString();
    return recentEvents.some(
      (e) =>
        (e.event_name === 'meditation_session_completed' || e.event_name === 'meditation_session_started') &&
        new Date(e.created_at).toDateString() === todayStr
    );
  }, [recentEvents]);

  const waterCompleted = waterCups >= 8;

  // Keyed by user ID + date string so it resets daily per user
  const waterKey = useMemo(() => {
    if (!uid) return '';
    return `water_cups_${uid}_${new Date().toDateString()}`;
  }, [uid]);

  // Load water cups
  useEffect(() => {
    if (!waterKey) return;
    setLoadingWater(true);
    AsyncStorage.getItem(waterKey)
      .then((val) => {
        if (val) {
          setWaterCups(parseInt(val, 10));
        } else {
          setWaterCups(0);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingWater(false));
  }, [waterKey]);

  // Water increment
  const handleAddWater = async () => {
    if (!waterKey) return;
    const newCups = Math.min(8, waterCups + 1);
    setWaterCups(newCups);
    await AsyncStorage.setItem(waterKey, newCups.toString());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  };

  // Water decrement
  const handleRemoveWater = async () => {
    if (!waterKey) return;
    const newCups = Math.max(0, waterCups - 1);
    setWaterCups(newCups);
    await AsyncStorage.setItem(waterKey, newCups.toString());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  // 5 Goals Completion State
  const goals = useMemo(() => [
    {
      id: 'mood',
      label: 'Mood Check-in',
      completed: hasCheckedInToday,
      onPress: onCheckInPress,
      icon: Smile,
      color: '#30D158',
    },
    {
      id: 'journal',
      label: 'Daily Reflection',
      completed: hasJournaledToday,
      onPress: onJournalPress,
      icon: BookOpen,
      color: '#5AC8FA',
    },
    {
      id: 'breathing',
      label: 'Breathing Session',
      completed: didBreathing,
      onPress: onBreathePress,
      icon: WindIconCustom,
      color: '#2DD4BF',
    },
    {
      id: 'meditation',
      label: 'Meditation Practice',
      completed: didMeditation,
      onPress: onMeditatePress,
      icon: Heart,
      color: '#FF9F0A',
    },
    {
      id: 'water',
      label: `Water Intake (${waterCups}/8 cups)`,
      completed: waterCompleted,
      isWater: true,
      icon: Droplet,
      color: '#0A84FF',
    },
  ], [hasCheckedInToday, hasJournaledToday, didBreathing, didMeditation, waterCups, waterCompleted, colors]);

  const completedCount = goals.filter(g => g.completed).length;
  const isAllComplete = completedCount === 5;

  return (
    <Animated.View
      entering={FadeInDown.delay(150).duration(500)}
      layout={Layout.springify()}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface.primary,
          borderColor: isAllComplete ? colors.success : colors.border.default,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {isAllComplete && (
            <Animated.View entering={ZoomIn.springify().damping(12)}>
              <PartyPopper size={16} color={colors.success} />
            </Animated.View>
          )}
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {isAllComplete ? "Today's Complete" : "Today's Progress"}
          </Text>
        </View>
        <Text style={[styles.subtitle, { color: isAllComplete ? colors.success : colors.text.secondary }]}>
          {isAllComplete ? 'Great work!' : `${completedCount} of 5 completed`}
        </Text>
      </View>

      {/* Animated progress track (Phase 4) */}
      <View style={styles.boxTrack}>
        {Array.from({ length: 5 }).map((_, idx) => {
          const isCompleted = idx < completedCount;
          return (
            <AnimatedBox
              key={idx}
              isCompleted={isCompleted}
              color={isAllComplete ? colors.success : colors.brand.primary}
              borderColor={colors.border.default}
            />
          );
        })}
      </View>

      {/* Checklist items */}
      <View style={styles.list}>
        {goals.map((goal) => {
          const Icon = goal.icon;
          return (
            <View key={goal.id} style={[styles.row, { borderColor: colors.border.default }]}>
              <Pressable
                onPress={goal.isWater ? undefined : goal.onPress}
                style={({ pressed }) => [
                  styles.rowPressable,
                  pressed && !goal.isWater && { opacity: 0.7 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${goal.label}. Status: ${goal.completed ? 'completed' : 'pending'}`}
              >
                {goal.completed ? (
                  <Animated.View entering={ZoomIn.springify().damping(12)}>
                    <Check size={20} color={goal.color} strokeWidth={3} />
                  </Animated.View>
                ) : (
                  <Circle size={20} color={colors.text.tertiary} />
                )}
                
                <View style={styles.labelContainer}>
                  <Text style={[
                    styles.label,
                    { color: goal.completed ? colors.text.primary : colors.text.secondary },
                    goal.completed && styles.completedLabel,
                  ]}>
                    {goal.label}
                  </Text>
                </View>
              </Pressable>

              {/* Water logging actions — larger touch targets */}
              {goal.isWater && (
                <View style={styles.waterActions}>
                  <Pressable
                    onPress={handleRemoveWater}
                    style={({ pressed }) => [
                      styles.waterBtn,
                      { borderColor: colors.border.default },
                      pressed && { opacity: 0.6, transform: [{ scale: 0.92 }] },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Remove water cup"
                  >
                    <Minus size={16} color={colors.text.secondary} />
                  </Pressable>
                  <Pressable
                    onPress={handleAddWater}
                    style={({ pressed }) => [
                      styles.waterBtn,
                      { borderColor: colors.border.default, backgroundColor: colors.surface.secondary },
                      pressed && { opacity: 0.6, transform: [{ scale: 0.92 }] },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Add water cup"
                  >
                    <Plus size={16} color={colors.text.secondary} />
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
});

// Custom simple Wind/Breath icon
function WindIconCustom({ size, color }: { size: number, color: string }) {
  return <Sparkles size={size} color={color} />;
}

// Sub-component for animating boxes — smooth spring fill
function AnimatedBox({ isCompleted, color, borderColor }: { isCompleted: boolean; color: string; borderColor: string }) {
  const scale = useSharedValue(1);
  const fillWidth = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(isCompleted ? 1.06 : 1, { damping: 12, stiffness: 200 });
    fillWidth.value = withTiming(isCompleted ? 1 : 0, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [isCompleted]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillWidth.value * 100}%`,
    backgroundColor: color,
  }));

  return (
    <Animated.View
      style={[
        styles.box,
        { borderColor: isCompleted ? color : borderColor },
        animatedStyle,
      ]}
    >
      <Animated.View style={[styles.boxFill, fillStyle]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  boxTrack: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  box: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  boxFill: {
    height: '100%',
    borderRadius: 4,
  },
  list: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  completedLabel: {
    fontWeight: '500',
  },
  waterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  waterBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DailyGoalsCard;
