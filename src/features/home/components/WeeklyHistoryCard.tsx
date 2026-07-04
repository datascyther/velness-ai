import React, { useMemo, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  Text,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Rect, RadialGradient } from 'react-native-svg';
import { Smile, Flame, Calendar, Lock } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius, shadows } from '@/core/theme';
import { type Mood, type MoodRating, MOOD_MAP } from '@/shared/types';
import { WeeklyHistoryHeader } from './WeeklyHistoryHeader';
import { MoodTimeline } from './MoodTimeline';
import { InsightLabel } from './InsightLabel';
import { EmptyState } from './EmptyState';

interface WeeklyHistoryCardProps {
  moodEntries: Mood[];
  isLoading?: boolean;
  onCheckIn?: () => void;
}

const GRAPH_HEIGHT = 120;
const GRAPH_PADDING_H = 20;
const CARD_H_PADDING = spacing.lg * 2;

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const LEVEL_COLORS: Record<number, string> = {
  1: '#FF2E5F',
  2: '#FFAE00',
  3: '#7E8E9F',
  4: '#8B5CF6',
  5: '#00E699',
};

function generateInsight(points: { moodLevel: number | null }[]): string {
  const valid = points.filter((p) => p.moodLevel !== null).map((p) => p.moodLevel!);
  if (valid.length === 0) return '';

  const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
  const variance = valid.reduce((a, b) => a + (b - avg) ** 2, 0) / valid.length;

  if (variance < 0.5) {
    return 'Your mood patterns are showing high stability. Reflect on the habits keeping you balanced.';
  }
  if (avg > 4) {
    return "You've had a highly positive cycle. Keep dedicating time to your self-care practices!";
  }
  if (avg > 3) {
    return "Your week reflects a healthy, balanced state of mindfulness. Stay centered.";
  }
  return "You have navigated several shifts this week. Be gentle with yourself and prioritize quiet reflection.";
}

const CARD_WIDTH = Dimensions.get('window').width - spacing.xl * 2 - CARD_H_PADDING;

export const WeeklyHistoryCard = React.memo(({
  moodEntries,
  isLoading = false,
  onCheckIn,
}: WeeklyHistoryCardProps) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = React.useState<'7days' | '30days'>('7days');

  const timelineData = useMemo(() => {
    const today = new Date();
    const data: { moodLevel: number | null; date: Date }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayEntries = moodEntries.filter(
        (e) => new Date(e.timestamp).toDateString() === d.toDateString()
      );
      const latest = dayEntries.length > 0 ? dayEntries[dayEntries.length - 1] : null;
      data.push({
        moodLevel: latest ? latest.rating : null,
        date: d,
      });
    }
    return data;
  }, [moodEntries]);

  const dynamicDayLabels = useMemo(() => {
    return timelineData.map((item, idx) => {
      if (idx === timelineData.length - 1) return 'TODAY';
      return DAY_NAMES[item.date.getDay()];
    });
  }, [timelineData]);

  const points = useMemo(() => {
    const svgWidth = CARD_WIDTH - GRAPH_PADDING_H * 2;
    const step = svgWidth / 6;
    const topY = 20;
    const bottomY = GRAPH_HEIGHT - 20;
    const range = bottomY - topY;

    return timelineData.map((item, idx) => {
      const x = GRAPH_PADDING_H + idx * step;
      const y = item.moodLevel !== null
        ? bottomY - ((item.moodLevel - 1) / 4) * range
        : bottomY;
      return { x, y, moodLevel: item.moodLevel };
    });
  }, [timelineData]);

  const hasData = useMemo(() => timelineData.some((d) => d.moodLevel !== null), [timelineData]);

  const insightText = useMemo(() => generateInsight(points), [points]);

  const stats = useMemo(() => {
    const validLevels = timelineData
      .filter((d) => d.moodLevel !== null)
      .map((d) => d.moodLevel!);

    const loggedCount = validLevels.length;

    let avgMood = '-';
    let avgValue = 0;
    if (loggedCount > 0) {
      avgValue = validLevels.reduce((a, b) => a + b, 0) / loggedCount;
      if (avgValue >= 4.5) avgMood = 'Excellent';
      else if (avgValue >= 3.8) avgMood = 'Good';
      else if (avgValue >= 2.8) avgMood = 'Balanced';
      else if (avgValue >= 1.8) avgMood = 'Fair';
      else avgMood = 'Low';
    }

    let streak = 0;
    const reverseTimeline = [...timelineData].reverse();
    const hasTodayOrYesterday = reverseTimeline[0].moodLevel !== null || reverseTimeline[1]?.moodLevel !== null;
    if (hasTodayOrYesterday) {
      for (const day of reverseTimeline) {
        if (day.moodLevel !== null) {
          streak++;
        } else {
          break;
        }
      }
    }

    return {
      loggedCount,
      avgMood,
      avgValue: avgValue > 0 ? avgValue.toFixed(1) : '0',
      streak,
      consistency: Math.round((loggedCount / 7) * 100),
    };
  }, [timelineData]);

  const shimmerTranslate = useSharedValue(-CARD_WIDTH);
  useEffect(() => {
    shimmerTranslate.value = withRepeat(
      withTiming(CARD_WIDTH, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );
  }, [shimmerTranslate]);

  const BackgroundGlow = () => (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="bgGlowTop" cx="90%" cy="0%" rx="60%" ry="60%">
            <Stop offset="0%" stopColor={colors.brand.secondary || '#8B5CF6'} stopOpacity={0.07} />
            <Stop offset="100%" stopColor={colors.brand.secondary || '#8B5CF6'} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="bgGlowBottom" cx="10%" cy="100%" rx="45%" ry="45%">
            <Stop offset="0%" stopColor="#06B6D4" stopOpacity={0.04} />
            <Stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#bgGlowTop)" />
        <Rect width="100%" height="100%" fill="url(#bgGlowBottom)" />
      </Svg>
    </View>
  );

  if (isLoading) {
    return (
      <Animated.View
        entering={FadeInDown.delay(200).duration(600).springify()}
        style={styles.container}
      >
        <View style={[styles.card, { backgroundColor: colors.surface.primary, borderColor: colors.border.default, ...shadows.glass }]}>
          <BackgroundGlow />
          <View style={styles.accentBar}>
            <Svg width="100%" height={3.5}>
              <Defs>
                <LinearGradient id="skeletonAccentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor={colors.brand.secondary || '#8B5CF6'} />
                  <Stop offset="50%" stopColor={colors.brand.primary} />
                  <Stop offset="100%" stopColor="#06B6D4" />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height={3.5} fill="url(#skeletonAccentGrad)" />
            </Svg>
          </View>
          <WeeklyHistoryHeader />
          <SkeletonBlock shimmerTranslate={shimmerTranslate} colors={colors} />
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInDown.delay(200).duration(600).springify()}
      style={styles.container}
    >
      <View style={[styles.card, { backgroundColor: colors.surface.primary, borderColor: colors.border.default, ...shadows.glass }]}>
        <BackgroundGlow />

        <View style={styles.accentBar}>
          <Svg width="100%" height={3.5}>
            <Defs>
              <LinearGradient id="cardAccentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={colors.brand.secondary || '#8B5CF6'} />
                <Stop offset="50%" stopColor={colors.brand.primary} />
                <Stop offset="100%" stopColor="#06B6D4" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height={3.5} fill="url(#cardAccentGrad)" />
          </Svg>
        </View>

        <WeeklyHistoryHeader />

        <View style={[styles.tabContainer, { backgroundColor: `${colors.brand.primary}05`, borderColor: colors.border.default }]}>
          <View style={styles.tabRow}>
            <Pressable
              style={[styles.tabButton, activeTab === '7days' && { backgroundColor: colors.surface.primary, ...shadows.sm }]}
              onPress={() => setActiveTab('7days')}
            >
              <Text style={[styles.tabText, { color: activeTab === '7days' ? colors.brand.primary : colors.text.secondary }]}>7 Days</Text>
            </Pressable>
            <Pressable
              style={styles.tabButton}
              onPress={() => setActiveTab('7days')}
              disabled
            >
              <View style={styles.lockRow}>
                <Text style={[styles.tabText, { color: colors.text.secondary, opacity: 0.5 }]}>30 Days</Text>
                <Lock size={11} color={colors.text.secondary} opacity={0.5} style={styles.lockIcon} />
              </View>
            </Pressable>
          </View>
        </View>

        {!hasData ? (
          <EmptyState onCheckIn={onCheckIn} />
        ) : (
          <>
            {/* Unified Timeline Zone */}
            <View style={[styles.timelineZone, { borderColor: `${colors.brand.primary}08` }]}>
              {/* Day columns with mood badges, staggered entrance */}
              <View style={styles.dayHeaderRow}>
                {timelineData.map((item, i) => {
                  const rating = item.moodLevel as MoodRating | null;
                  const moodInfo = rating ? MOOD_MAP[rating] : null;
                  return (
                    <Animated.View
                      key={i}
                      entering={FadeInUp.delay(i * 60).duration(350).springify().damping(16).stiffness(140)}
                      style={styles.dayColumn}
                    >
                      <Text style={[styles.dayLabel, {
                        color: i === timelineData.length - 1 ? colors.brand.primary : colors.text.secondary,
                        fontWeight: i === timelineData.length - 1 ? '700' : '500',
                      }]}>
                        {dynamicDayLabels[i]}
                      </Text>
                      {rating ? (
                        <View style={[styles.moodBadge, {
                          backgroundColor: `${LEVEL_COLORS[rating]}15`,
                          borderColor: `${LEVEL_COLORS[rating]}25`,
                        }]}>
                          <Text style={styles.moodEmoji}>{moodInfo?.emoji}</Text>
                          <Text style={[styles.moodRatingText, { color: LEVEL_COLORS[rating] }]}>
                            {rating}
                          </Text>
                        </View>
                      ) : (
                        <View style={[styles.moodBadge, styles.moodBadgeEmpty, {
                          backgroundColor: `${colors.text.secondary}10`,
                          borderColor: `${colors.border.default}50`,
                        }]}>
                          <Text style={[styles.moodEmojiEmpty]}>--</Text>
                        </View>
                      )}
                    </Animated.View>
                  );
                })}
              </View>

              {/* Mood Timeline SVG */}
              <View style={styles.graphContainer}>
                <MoodTimeline
                  points={points}
                  svgWidth={CARD_WIDTH}
                  svgHeight={GRAPH_HEIGHT}
                />
              </View>
            </View>

            {/* Stats Row */}
            <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.statsContainer}>
              <StatCard
                icon={<Smile size={14} color={colors.brand.primary} />}
                label="Avg Mood"
                value={stats.avgMood}
                subValue={stats.avgValue}
                valueColor={colors.text.primary}
                bgColor={`${colors.brand.primary}06`}
                borderColor={`${colors.brand.primary}12`}
              />

              <StatCard
                icon={<Flame size={14} color="#F59E0B" />}
                label="Streak"
                value=""
                subValue={`Day${stats.streak !== 1 ? 's' : ''}`}
                animateValue={stats.streak}
                valueColor={colors.text.primary}
                bgColor="rgba(245, 158, 11, 0.06)"
                borderColor="rgba(245, 158, 11, 0.12)"
              />

              <StatCard
                icon={<Calendar size={14} color="#10B981" />}
                label="Checked In"
                value=""
                subValue="/7 Days"
                animateValue={stats.loggedCount}
                valueColor={colors.text.primary}
                bgColor="rgba(16, 185, 129, 0.06)"
                borderColor="rgba(16, 185, 129, 0.12)"
              />
            </Animated.View>

            {/* Consistency Progress */}
            <Animated.View entering={FadeInUp.delay(380).duration(500)} style={[styles.goalContainer, { backgroundColor: `${colors.brand.primary}04`, borderColor: colors.border.default }]}>
              <View style={styles.goalHeader}>
                <Text style={[styles.goalTitle, { color: colors.text.primary }]}>Consistency</Text>
                <View style={styles.goalPercentBadge}>
                  <Text style={[styles.goalPercent, { color: colors.brand.primary }]}>{stats.consistency}%</Text>
                </View>
              </View>
              <View style={[styles.progressBarTrack, { backgroundColor: colors.surface.secondary }]}>
                <AnimatedBarFill percentage={stats.consistency} color={colors.brand.primary} />
              </View>
            </Animated.View>

            {/* AI Insight */}
            <Animated.View entering={FadeInUp.delay(460).duration(500)}>
              <InsightLabel text={insightText} />
            </Animated.View>
          </>
        )}
      </View>
    </Animated.View>
  );
});

WeeklyHistoryCard.displayName = 'WeeklyHistoryCard';

/* ─── Animated Counter ─── */
function AnimatedNumber({ target, duration = 900, delay = 0, style }: {
  target: number;
  duration?: number;
  delay?: number;
  style?: any;
}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) {
      setDisplay(0);
      return;
    }

    const timer = setTimeout(() => {
      startRef.current = null;
      const animate = (timestamp: number) => {
        if (startRef.current === null) startRef.current = timestamp;
        const elapsed = timestamp - startRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(0 + (target - 0) * eased));
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };
      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);

  return <Text style={style}>{display}</Text>;
}

/* ─── Animated Progress Bar Fill ─── */
function AnimatedBarFill({ percentage, color }: { percentage: number; color: string }) {
  const widthAnim = useSharedValue(0);

  useEffect(() => {
    widthAnim.value = 0;
    widthAnim.value = withSpring(percentage, {
      damping: 20,
      stiffness: 90,
      mass: 0.5,
    });
  }, [percentage, widthAnim]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${widthAnim.value}%`,
  }));

  return (
    <Animated.View style={[styles.progressBarFill, fillStyle]}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor="#A78BFA" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#progressGrad)" />
      </Svg>
    </Animated.View>
  );
}

/* ─── Stat Card ─── */
function StatCard({
  icon,
  label,
  value,
  subValue,
  animateValue,
  valueColor,
  bgColor,
  borderColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  animateValue?: number;
  valueColor: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <Animated.View
      entering={FadeInUp.springify().damping(14).stiffness(120)}
      style={[styles.statItem, { backgroundColor: bgColor, borderColor }]}
    >
      <View style={styles.statIconWrapper}>{icon}</View>
      <View style={styles.statValueRow}>
        {animateValue !== undefined ? (
          <AnimatedNumber target={animateValue} style={[styles.statValue, { color: valueColor }]} />
        ) : (
          <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
        )}
        {subValue ? <Text style={styles.statSubValue}>{subValue}</Text> : null}
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

/* ─── Skeleton ─── */
function SkeletonBlock({ shimmerTranslate, colors }: { shimmerTranslate: any; colors: any }) {
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslate.value }],
  }));

  return (
    <View>
      {/* Day columns skeleton */}
      <View style={styles.skeletonPreviewRow}>
        {Array.from({ length: 7 }).map((_, i) => (
          <View key={i} style={styles.skeletonDayCol}>
            <View style={[styles.skeletonLabel, { backgroundColor: colors.surface.secondary }]} />
            <View style={[styles.skeletonPill, { backgroundColor: `${colors.brand.primary}06` }]} />
          </View>
        ))}
      </View>

      {/* Graph skeleton */}
      <View style={[styles.skeletonTimeline, { height: GRAPH_HEIGHT }]}>
        <View style={styles.skeletonRow}>
          {Array.from({ length: 7 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.skeletonCircle,
                { backgroundColor: colors.surface.secondary, borderColor: colors.border.default },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Stats skeleton */}
      <View style={styles.statsContainer}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.skeletonStatCard, { backgroundColor: `${colors.brand.primary}06` }]}>
            <View style={styles.shimmerOverlay}>
              <Animated.View style={[StyleSheet.absoluteFill, shimmerStyle]}>
                <SkeletonShimmer />
              </Animated.View>
            </View>
          </View>
        ))}
      </View>

      {/* Goal skeleton */}
      <View style={[styles.skeletonGoal, { backgroundColor: `${colors.brand.primary}06` }]} />
    </View>
  );
}

function SkeletonShimmer() {
  return (
    <Svg width="200%" height="100%">
      <Defs>
        <LinearGradient id="skShimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="transparent" />
          <Stop offset="50%" stopColor="rgba(255,255,255,0.15)" />
          <Stop offset="100%" stopColor="transparent" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#skShimmer)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  card: {
    borderRadius: borderRadius['2xl'] + 2,
    borderWidth: 1,
    padding: spacing.lg + 2,
    overflow: 'hidden',
    position: 'relative',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3.5,
    overflow: 'hidden',
  },
  tabContainer: {
    borderRadius: borderRadius.md + 2,
    borderWidth: 1,
    padding: 3,
    marginBottom: spacing.md,
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.xs * 1.3 + 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm + 2,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lockIcon: {
    marginLeft: 2,
  },

  /* ─── Timeline Zone ─── */
  timelineZone: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingTop: spacing.md + 2,
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: GRAPH_PADDING_H,
    marginBottom: spacing.xs,
  },
  dayColumn: {
    alignItems: 'center',
    width: 28,
    gap: 3,
  },
  dayLabel: {
    fontSize: 9,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  /* ─── Mood Badge ─── */
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  moodBadgeEmpty: {
    opacity: 0.5,
  },
  moodEmoji: {
    fontSize: 10,
    lineHeight: 12,
  },
  moodEmojiEmpty: {
    fontSize: 8,
    letterSpacing: -0.5,
    color: '#999',
  },
  moodRatingText: {
    fontSize: 8,
    fontWeight: '800',
  },
  graphContainer: {
    alignItems: 'center',
  },

  /* ─── Stats ─── */
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md + 2,
  },
  statItem: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm + 3,
    paddingHorizontal: spacing.xs + 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statIconWrapper: {
    marginBottom: 1,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  statSubValue: {
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.55,
    color: '#888',
  },
  statLabel: {
    fontSize: 8.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    opacity: 0.6,
    color: '#888',
  },

  /* ─── Consistency ─── */
  goalContainer: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md + 2,
    marginTop: spacing.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs * 1.5 + 2,
  },
  goalTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  goalPercentBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  goalPercent: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 7,
    borderRadius: 3.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3.5,
    overflow: 'hidden',
  },

  /* ─── Skeleton ─── */
  skeletonPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: GRAPH_PADDING_H + 2,
    marginBottom: spacing.sm,
  },
  skeletonDayCol: {
    alignItems: 'center',
    width: 28,
    gap: 6,
  },
  skeletonLabel: {
    width: 24,
    height: 8,
    borderRadius: 2,
  },
  skeletonPill: {
    width: 28,
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
  },
  skeletonStatCard: {
    flex: 1,
    height: 64,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  skeletonGoal: {
    height: 48,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  skeletonTimeline: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xs,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: GRAPH_PADDING_H,
  },
  skeletonCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
});

export default WeeklyHistoryCard;
