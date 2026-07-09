// src/features/home/components/WeeklyHistoryCard.tsx
//
// Compact mood timeline card — ~40% shorter than the previous version.
// - 7 emoji dots in a single row (no large circles)
// - Inline empty state (2 lines + CTA, no full-height blank area)
// - Removed tab toggle (moved to a future detail view)
// - MoodTimeline SVG chart above the dots

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { BarChart2 } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { type Mood, type MoodRating, getMoodEmotion } from '@/shared/types';
import { EmotionAvatar } from '@/components/emotion/EmotionAvatar';
import { MoodTimeline } from './MoodTimeline';

interface WeeklyHistoryCardProps {
  moodEntries: Mood[];
  onCheckIn?: () => void;
  onPress?: () => void;
}

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const MOOD_COLORS: Record<number, string> = {
  1: '#FF453A',
  2: '#FF9F0A',
  3: '#8E8E93',
  4: '#5AC8FA',
  5: '#30D158',
};

const SVG_WIDTH = 300;
const SVG_HEIGHT = 56;

export const WeeklyHistoryCard = React.memo(({
  moodEntries,
  onCheckIn,
  onPress,
}: WeeklyHistoryCardProps) => {
  const { colors } = useTheme();

  const weekData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dayEntries = moodEntries.filter(
        (e) => new Date(e.timestamp).toDateString() === d.toDateString(),
      );
      const latest = dayEntries.length > 0 ? dayEntries[dayEntries.length - 1] : null;
      return { moodLevel: latest ? latest.rating : null, date: d };
    });
  }, [moodEntries]);

  const hasData = weekData.some((d) => d.moodLevel !== null);

  const hoverY = useSharedValue(0);

  React.useEffect(() => {
    if (!hasData) {
      hoverY.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      hoverY.value = 0;
    }
  }, [hasData]);

  const animatedHoverStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: hoverY.value }],
  }));

  // Calculate average and trend comparison
  const { averageMood, trendText, trendColor } = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);

    const currEntries = moodEntries.filter(
      (e) => new Date(e.timestamp) >= sevenDaysAgo && new Date(e.timestamp) <= now
    );
    const prevEntries = moodEntries.filter(
      (e) => new Date(e.timestamp) >= fourteenDaysAgo && new Date(e.timestamp) < sevenDaysAgo
    );

    const currAvg = currEntries.length > 0
      ? currEntries.reduce((sum, e) => sum + e.rating, 0) / currEntries.length
      : 0;

    const prevAvg = prevEntries.length > 0
      ? prevEntries.reduce((sum, e) => sum + e.rating, 0) / prevEntries.length
      : 0;

    const avgString = currAvg > 0 ? currAvg.toFixed(1) : '—';
    
    let trendStr = 'no change';
    let color = colors.text.secondary;
    if (currAvg > 0 && prevAvg > 0) {
      const diff = currAvg - prevAvg;
      const pct = Math.round((diff / prevAvg) * 100);
      if (pct > 0) {
        trendStr = `+${pct}% better`;
        color = colors.success;
      } else if (pct < 0) {
        trendStr = `${pct}% lower`;
        color = colors.danger;
      } else {
        trendStr = 'stable';
      }
    } else if (currAvg > 0) {
      trendStr = 'first week';
    }

    return { averageMood: avgString, trendText: trendStr, trendColor: color };
  }, [moodEntries, colors]);

  // Build SVG points from weekData
  const svgPoints = useMemo(() => {
    const colWidth = SVG_WIDTH / 7;
    return weekData.map((d, i) => {
      const x = colWidth * i + colWidth / 2;
      // Invert: rating 1 = bottom, 5 = top
      const y = d.moodLevel != null
        ? SVG_HEIGHT - 8 - ((d.moodLevel - 1) / 4) * (SVG_HEIGHT - 16)
        : SVG_HEIGHT / 2;
      return { x, y, moodLevel: d.moodLevel };
    });
  }, [weekData]);

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
      <Pressable
        onPress={onPress}
        style={[
          styles.card,
          { backgroundColor: colors.surface.primary, borderColor: colors.border.default },
        ]}
      >
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text.primary }]}>Mood History</Text>
            {hasData && (
              <Text style={[styles.averageText, { color: trendColor }]}>
                Avg: {averageMood} ({trendText})
              </Text>
            )}
          </View>
          <Text style={[styles.range, { color: colors.text.secondary }]}>7 days</Text>
        </View>

        {hasData ? (
          <>
            {/* Mini chart */}
            <View style={styles.chartContainer}>
              <MoodTimeline
                points={svgPoints}
                svgWidth={SVG_WIDTH}
                svgHeight={SVG_HEIGHT}
              />
            </View>

            {/* Day dots row */}
            <View style={styles.dotsRow}>
              {weekData.map((item, i) => {
                const rating = item.moodLevel as MoodRating | null;
                const isToday = i === 6;
                const color = rating ? MOOD_COLORS[rating] : null;

                return (
                  <Animated.View
                    key={i}
                    entering={ZoomIn.delay(i * 35).duration(300).springify().damping(16)}
                    style={styles.dayCol}
                  >
                    <View
                      style={[
                        styles.dot,
                        color
                          ? { backgroundColor: `${color}22`, borderColor: `${color}44` }
                          : { backgroundColor: 'transparent', borderColor: colors.border.default },
                        isToday && color && { borderColor: color },
                      ]}
                    >
                      {rating ? (
                        <EmotionAvatar
                          emotion={getMoodEmotion(rating)}
                          size={22}
                          animated={false}
                          showGlow={false}
                        />
                      ) : (
                        <View style={[styles.emptyDot, { backgroundColor: colors.border.default }]} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.dayLabel,
                        { color: isToday ? colors.text.primary : colors.text.secondary },
                        isToday && styles.dayLabelToday,
                      ]}
                    >
                      {isToday ? 'Now' : DAY_LETTERS[item.date.getDay()]}
                    </Text>
                  </Animated.View>
                );
              })}
            </View>
          </>
        ) : (
          /* Friendly empty state with illustration */
          <View style={styles.emptyContainer}>
            <Animated.View
              style={[
                styles.emptyIconWrap,
                { backgroundColor: `${colors.text.tertiary}12` },
                animatedHoverStyle,
              ]}
            >
              <BarChart2 size={24} color={colors.text.secondary} />
            </Animated.View>
            <View style={styles.emptyText}>
              <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                Your first check-in unlocks
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
                weekly insights.
              </Text>
            </View>
            {onCheckIn && (
              <Pressable
                onPress={onCheckIn}
                style={({ pressed }) => [
                  styles.emptyBtn,
                  { backgroundColor: colors.brand.primary },
                  pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] },
                ]}
                accessibilityRole="button"
              >
                <Text style={styles.emptyBtnText}>Check in</Text>
              </Pressable>
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
});

WeeklyHistoryCard.displayName = 'WeeklyHistoryCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    paddingBottom: 12,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  averageText: {
    fontSize: 11,
    fontWeight: '600',
  },
  range: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartContainer: {
    marginHorizontal: -4,
    marginBottom: 6,
    // Fixed height matching SVG_HEIGHT
    height: SVG_HEIGHT,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 15,
  },
  emptyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.4,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  dayLabelToday: {
    fontWeight: '700',
  },
  // Friendly empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
    minHeight: SVG_HEIGHT + 48, // Reserve layout space for future charts
  },
  emptyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    alignItems: 'center',
    gap: 2,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  emptyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default WeeklyHistoryCard;
