import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown, ZoomIn, FadeIn } from 'react-native-reanimated';
import { Calendar, CalendarDays } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius, shadows } from '@/core/theme';
import { type Mood, type MoodRating, MOOD_MAP } from '@/shared/types';
import { WeeklyHistoryHeader } from './WeeklyHistoryHeader';
import { EmptyState } from './EmptyState';
import { DayLabel } from './DayLabel';

interface WeeklyHistoryCardProps {
  moodEntries: Mood[];
  isLoading?: boolean;
  onCheckIn?: () => void;
}

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const MOOD_COLORS: Record<number, string> = {
  1: '#FF453A',
  2: '#FF9F0A',
  3: '#8E8E93',
  4: '#5AC8FA',
  5: '#30D158',
};

const withAlpha = (hex: string, alpha: string) => `${hex}${alpha}`;

export const WeeklyHistoryCard = React.memo(({
  moodEntries,
  isLoading = false,
  onCheckIn,
}: WeeklyHistoryCardProps) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'7days' | '30days'>('7days');

  const timelineData = useMemo(() => {
    const today = new Date();
    const numDays = activeTab === '7days' ? 7 : 30;
    const data: { moodLevel: number | null; date: Date }[] = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayEntries = moodEntries.filter(
        (e) => new Date(e.timestamp).toDateString() === d.toDateString()
      );
      const latest = dayEntries.length > 0 ? dayEntries[dayEntries.length - 1] : null;
      data.push({ moodLevel: latest ? latest.rating : null, date: d });
    }
    return data;
  }, [moodEntries, activeTab]);

  const hasData = useMemo(() => timelineData.some((d) => d.moodLevel !== null), [timelineData]);

  if (isLoading) {
    return (
      <Animated.View
        entering={FadeInDown.delay(200).duration(600).springify()}
        style={styles.container}
      >
        <View style={[styles.card, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]}>
          <WeeklyHistoryHeader />
          <View style={styles.skeletonBody}>
            <View style={styles.skeletonRow}>
              {Array.from({ length: 7 }).map((_, i) => (
                <View key={i} style={styles.skeletonDay}>
                  <View style={[styles.skeletonCircle, { backgroundColor: colors.surface.secondary }]} />
                  <View style={[styles.skeletonLabel, { backgroundColor: colors.surface.secondary }]} />
                </View>
              ))}
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInDown.delay(200).duration(600).springify()}
      style={styles.container}
    >
      <View style={[styles.card, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]}>
        <WeeklyHistoryHeader />

        <View
          style={[
            styles.segment,
            { backgroundColor: colors.surface.secondary, borderColor: colors.border.default },
          ]}
        >
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === '7days' }}
            style={({ pressed }) => [
              styles.segmentTab,
              activeTab === '7days' && { backgroundColor: colors.surface.primary },
              activeTab === '7days' && shadows.sm,
              pressed && activeTab === '7days' && styles.segmentPressed,
            ]}
            onPress={() => setActiveTab('7days')}
          >
            <Calendar
              size={14}
              color={activeTab === '7days' ? colors.brand.primary : colors.text.secondary}
              style={styles.segmentIcon}
            />
            <Text
              style={[
                styles.segmentText,
                { color: activeTab === '7days' ? colors.brand.primary : colors.text.secondary },
              ]}
            >
              Week
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === '30days' }}
            style={({ pressed }) => [
              styles.segmentTab,
              activeTab === '30days' && { backgroundColor: colors.surface.primary },
              activeTab === '30days' && shadows.sm,
              pressed && activeTab === '30days' && styles.segmentPressed,
            ]}
            onPress={() => setActiveTab('30days')}
          >
            <CalendarDays
              size={14}
              color={activeTab === '30days' ? colors.brand.primary : colors.text.secondary}
              style={styles.segmentIcon}
            />
            <Text
              style={[
                styles.segmentText,
                { color: activeTab === '30days' ? colors.brand.primary : colors.text.secondary },
              ]}
            >
              Month
            </Text>
          </Pressable>
        </View>

        {!hasData ? (
          <EmptyState onCheckIn={onCheckIn} />
        ) : activeTab === '7days' ? (
          <SevenDayTimeline data={timelineData} />
        ) : (
          <ThirtyDayTimeline data={timelineData} />
        )}
      </View>
    </Animated.View>
  );
});

WeeklyHistoryCard.displayName = 'WeeklyHistoryCard';

function SevenDayTimeline({ data }: { data: { moodLevel: number | null; date: Date }[] }) {
  const { colors } = useTheme();

  return (
    <View style={styles.weekWrap}>
      {/* subtle engineered baseline */}
      <View style={[styles.weekBaseline, { backgroundColor: colors.surface.secondary }]} />
      <Animated.View entering={FadeIn.duration(300)} style={styles.timeline}>
        {data.map((item, i) => {
          const rating = item.moodLevel as MoodRating | null;
          const moodInfo = rating ? MOOD_MAP[rating] : null;
          const color = rating ? MOOD_COLORS[rating] : null;
          const isToday = i === data.length - 1;

          return (
            <Animated.View
              key={i}
              entering={ZoomIn.delay(i * 50).duration(350).springify().damping(14).stiffness(120)}
              style={styles.dayColumn}
            >
              <DayLabel label={isToday ? 'Now' : DAY_NAMES[item.date.getDay()]} isToday={isToday} />
              {rating ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${moodInfo?.label} mood`}
                  style={({ pressed }) => [
                    styles.moodCircle,
                    { backgroundColor: withAlpha(color, '18'), borderColor: withAlpha(color, '30') },
                    isToday && { borderColor: color, ...shadows.sm },
                    pressed && styles.moodPressed,
                  ]}
                >
                  <Text style={styles.moodEmoji}>{moodInfo?.emoji}</Text>
                </Pressable>
              ) : (
                <View
                  style={[
                    styles.moodCircle,
                    styles.moodEmpty,
                    { borderColor: colors.border.default, backgroundColor: 'transparent' },
                  ]}
                />
              )}
            </Animated.View>
          );
        })}
      </Animated.View>
    </View>
  );
}

function ThirtyDayTimeline({ data }: { data: { moodLevel: number | null; date: Date }[] }) {
  const { colors } = useTheme();
  const COLUMNS = 7;
  const TOTAL_CELLS = 35;

  return (
    <View style={styles.monthWrap}>
      <Animated.View entering={FadeIn.duration(300)} style={styles.gridContainer}>
        {Array.from({ length: Math.ceil(TOTAL_CELLS / COLUMNS) }).map((_, ri) => (
          <View key={ri} style={styles.gridRow}>
            {Array.from({ length: COLUMNS }).map((_, ci) => {
              const globalIndex = ri * COLUMNS + ci;
              const item = globalIndex < data.length ? data[globalIndex] : null;
              const rating = item?.moodLevel ?? null;
              const color = rating ? MOOD_COLORS[rating] : null;
              const isEmpty = item === null;

              return (
                <Animated.View
                  key={ci}
                  entering={
                    globalIndex < data.length
                      ? ZoomIn.delay(globalIndex * 15).duration(250).springify().damping(16)
                      : undefined
                  }
                  style={styles.gridCell}
                >
                  {!isEmpty ? (
                    rating ? (
                      <View
                        style={[
                          styles.gridDot,
                          { backgroundColor: color },
                          { shadowColor: color, ...shadows.sm },
                        ]}
                      />
                    ) : (
                      <View style={[styles.gridDotEmpty, { borderColor: colors.border.default }]} />
                    )
                  ) : (
                    <View style={styles.gridCellSpacer} />
                  )}
                </Animated.View>
              );
            })}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  card: {
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    padding: spacing.lg,
    overflow: 'hidden',
  },

  segment: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: 3,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    gap: 3,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  segmentPressed: {
    opacity: 0.85,
  },
  segmentIcon: {
    marginRight: 2,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  weekWrap: {
    position: 'relative',
  },
  weekBaseline: {
    height: 1,
    marginHorizontal: 8,
    marginBottom: spacing.sm,
    opacity: 1,
  },

  timeline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  dayColumn: {
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    minWidth: 28,
  },
  moodCircle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmpty: {
    borderStyle: 'dashed',
  },
  moodPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  moodEmoji: {
    fontSize: 18,
  },

  monthWrap: {
    paddingBottom: spacing.xs,
  },

  gridContainer: {
    paddingVertical: spacing.xs,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  gridCell: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCellSpacer: {
    width: 12,
    height: 12,
  },
  gridDot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
  },
  gridDotEmpty: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },

  skeletonBody: {
    paddingVertical: spacing.md,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skeletonDay: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  skeletonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  skeletonLabel: {
    width: 20,
    height: 7,
    borderRadius: 2,
  },
});

export default WeeklyHistoryCard;
