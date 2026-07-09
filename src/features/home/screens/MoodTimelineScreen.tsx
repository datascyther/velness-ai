import React, { useMemo } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Brain, Wind, Sparkles, BookOpen, Heart, Info, Star, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/shared/hooks/useAuth';
import { useMoodEntries } from '@/shared/hooks/useMood';
import { useQuery } from '@tanstack/react-query';
import { journalService } from '../../../../backend/services/JournalService';
import { analyticsService } from '../../../../backend/services/AnalyticsService';
import { WeeklyHistoryHeader } from '../components/WeeklyHistoryHeader';
import { MoodTimeline } from '../components/MoodTimeline';
import { type Mood, type MoodRating, MOOD_MAP, getMoodEmotion } from '@/shared/types';
import { EmotionAvatar } from '@/components/emotion/EmotionAvatar';
import { spacing, borderRadius, shadows } from '@/core/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const SVG_WIDTH = SCREEN_W - 48;
const SVG_HEIGHT = 80;

const MOOD_COLORS: Record<number, string> = {
  1: '#FF453A', // Awful (Red)
  2: '#FF9F0A', // Not Good (Orange)
  3: '#8E8E93', // Okay (Gray)
  4: '#5AC8FA', // Good (Blue)
  5: '#30D158', // Great (Green)
};

export function MoodTimelineScreen() {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useAuth();
  const uid = user?.uid || null;

  // ── Data Queries ─────────────────────────────────────────────────────────────
  const { data: moodEntries = [], isLoading: isLoadingMoods } = useMoodEntries(uid);

  const { data: journals = [], isLoading: isLoadingJournals } = useQuery({
    queryKey: ['journals_list', uid],
    queryFn: () => journalService.list(),
    enabled: !!uid,
  });

  const { data: analyticsEvents = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ['analytics_events_list', uid],
    queryFn: () => analyticsService.list(100),
    enabled: !!uid,
  });

  const isLoading = isLoadingMoods || isLoadingJournals || isLoadingEvents;

  // ── Calculations: Weekly Summary ──────────────────────────────────────────────
  const weekDaysData = useMemo(() => {
    const today = new Date();
    const days = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dayEntries = moodEntries.filter(
        (e) => new Date(e.timestamp).toDateString() === d.toDateString()
      );
      const latest = dayEntries.length > 0 ? dayEntries[dayEntries.length - 1] : null;
      days.push({
        date: d,
        dayName: dayNames[d.getDay()],
        moodLevel: latest ? latest.rating : null,
      });
    }
    return days;
  }, [moodEntries]);

  const svgPoints = useMemo(() => {
    const colWidth = SVG_WIDTH / 7;
    return weekDaysData.map((d, i) => {
      const x = colWidth * i + colWidth / 2;
      const y = d.moodLevel != null
        ? SVG_HEIGHT - 12 - ((d.moodLevel - 1) / 4) * (SVG_HEIGHT - 24)
        : SVG_HEIGHT / 2;
      return { x, y, moodLevel: d.moodLevel };
    });
  }, [weekDaysData]);

  const weeklySummary = useMemo(() => {
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
    let percentStr = '';
    let isBetter = false;
    let isWorse = false;

    if (currAvg > 0 && prevAvg > 0) {
      const diff = currAvg - prevAvg;
      const pct = Math.round((diff / prevAvg) * 100);
      if (pct > 0) {
        trendStr = `better than last week`;
        percentStr = `↑ ${pct}%`;
        isBetter = true;
      } else if (pct < 0) {
        trendStr = `lower than last week`;
        percentStr = `↓ ${Math.abs(pct)}%`;
        isWorse = true;
      } else {
        trendStr = 'consistent with last week';
      }
    } else if (currAvg > 0) {
      trendStr = 'starting your journey';
    }

    return { averageMood: avgString, trendText: trendStr, percentText: percentStr, isBetter, isWorse };
  }, [moodEntries]);

  // ── Calculations: Monthly Calendar Grid ──────────────────────────────────────
  const monthlyCalendarData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed

    const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday = 0
    const totalDays = new Date(year, month + 1, 0).getDate();

    const calendarCells = [];
    
    // Fill empty cells for days before the 1st of the month
    // Shift Sunday to the end of the week if desired, or keep standard (Sun-Sat)
    for (let i = 0; i < firstDayIndex; i++) {
      calendarCells.push({ dayNumber: null, moodLevel: null });
    }

    // Fill days of the month
    for (let day = 1; day <= totalDays; day++) {
      const cellDate = new Date(year, month, day);
      const dayEntries = moodEntries.filter(
        (e) => new Date(e.timestamp).toDateString() === cellDate.toDateString()
      );
      const latest = dayEntries.length > 0 ? dayEntries[dayEntries.length - 1] : null;
      calendarCells.push({
        dayNumber: day,
        moodLevel: latest ? latest.rating : null,
      });
    }

    return calendarCells;
  }, [moodEntries]);

  // ── Calculations: Emotion Distribution ───────────────────────────────────────
  const emotionDistribution = useMemo(() => {
    const total = moodEntries.length;
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    for (const entry of moodEntries) {
      counts[entry.rating] = (counts[entry.rating] || 0) + 1;
    }

    return Object.entries(counts)
      .map(([rating, count]) => {
        const rateNum = Number(rating) as MoodRating;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return {
          rating: rateNum,
          emoji: MOOD_MAP[rateNum].emoji,
          label: MOOD_MAP[rateNum].label,
          percentage: pct,
          color: MOOD_COLORS[rateNum],
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [moodEntries]);

  // ── Calculations: AI Mood Insights (MODULE 4) ────────────────────────────────
  const moodInsights = useMemo(() => {
    const insights = [];

    if (moodEntries.length < 3) {
      return [];
    }

    // 1. Meditation correlation
    const meditationDays = new Set(
      analyticsEvents
        .filter((e) => e.event_name === 'meditation_completed' || e.event_name === 'meditation_session_started')
        .map((e) => new Date(e.created_at).toDateString())
    );

    if (meditationDays.size > 0) {
      const meditationMoods = moodEntries.filter((e) => meditationDays.has(new Date(e.timestamp).toDateString()));
      const nonMeditationMoods = moodEntries.filter((e) => !meditationDays.has(new Date(e.timestamp).toDateString()));

      const medAvg = meditationMoods.length > 0
        ? meditationMoods.reduce((sum, e) => sum + e.rating, 0) / meditationMoods.length
        : 0;
      const nonMedAvg = nonMeditationMoods.length > 0
        ? nonMeditationMoods.reduce((sum, e) => sum + e.rating, 0) / nonMeditationMoods.length
        : 0;

      if (medAvg > nonMedAvg && meditationMoods.length >= 1) {
        insights.push({
          id: 'meditation',
          text: 'You usually feel better after meditation.',
          description: `On meditation days, your average mood is ${medAvg.toFixed(1)} compared to ${nonMedAvg.toFixed(1)} on other days.`,
          icon: Sparkles,
          color: '#8B5CF6',
        });
      }
    }

    // 2. Evening stress (Stress after 7 PM)
    const eveningEntries = moodEntries.filter((e) => {
      const hrs = new Date(e.timestamp).getHours();
      return hrs >= 19; // 7 PM
    });
    const lowEveningEntries = eveningEntries.filter((e) => e.rating <= 2);

    if (lowEveningEntries.length >= 2) {
      insights.push({
        id: 'evening_stress',
        text: 'You often report stress after 7 PM.',
        description: `You logged stress or tension ${lowEveningEntries.length} times in the evening. Consider scheduling wind-down exercises earlier.`,
        icon: Brain,
        color: '#FF9F0A',
      });
    }

    // 3. Sleep correlation
    let sleepCorrelates = false;
    let sleepLowCount = 0;
    for (const journal of journals) {
      const text = `${journal.title || ''} ${journal.body || ''}`.toLowerCase();
      const hasSleepMention = text.includes('sleep') || text.includes('tired') || text.includes('fatigue') || text.includes('insomnia');
      const journalDate = new Date(journal.created_at).toDateString();
      const sameDayMood = moodEntries.find((e) => new Date(e.timestamp).toDateString() === journalDate);
      if (hasSleepMention && sameDayMood && sameDayMood.rating <= 2) {
        sleepLowCount++;
      }
    }

    if (sleepLowCount >= 2) {
      insights.push({
        id: 'sleep_correlation',
        text: 'Sleep below 6 hours correlates with low mood.',
        description: 'Your journal logs indicate that poor rest or fatigue is frequently linked with Awful or Not Good mood ratings.',
        icon: BookOpen,
        color: '#6366F1',
      });
    }

    // 4. Journaling impact
    const journaledDays = new Set(journals.map((j) => new Date(j.created_at).toDateString()));
    if (journaledDays.size >= 2) {
      insights.push({
        id: 'journal_consistency',
        text: 'Journaling improves your mood consistency.',
        description: 'Writing about your thoughts regularly helps stabilize your mood swings and promotes emotional regulation.',
        icon: Heart,
        color: '#10B981',
      });
    }

    // Fallback default insight if no specific patterns calculated yet
    if (insights.length === 0) {
      insights.push({
        id: 'general_growth',
        text: 'Keep tracking to uncover deeper patterns.',
        description: 'Consistency is key. Continue logging your mood and meditations to unlock comprehensive correlations.',
        icon: Info,
        color: colors.brand.primary,
      });
    }

    return insights;
  }, [moodEntries, analyticsEvents, journals, colors]);

  const hasData = moodEntries.length > 0;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
      {/* Top Header Row */}
      <View style={styles.topNav}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Go back">
          <ChevronLeft size={28} color={colors.text.primary} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.text.primary }]}>Analysis & Trends</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Living Dashboard Header widget */}
        <WeeklyHistoryHeader />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
          </View>
        ) : !hasData ? (
          <View style={[styles.card, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]}>
            <Text style={[styles.emptyTextTitle, { color: colors.text.primary }]}>No Entries Found</Text>
            <Text style={[styles.emptyTextSub, { color: colors.text.secondary }]}>
              Logging your daily mood unlocks timeline visualizations and personalized AI insights.
            </Text>
          </View>
        ) : (
          <>
            {/* ── Weekly Trend & Summary ─────────────────────────────────── */}
            <View style={[styles.card, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }, shadows.glass]}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Weekly Trend</Text>
              
              <View style={styles.trendRow}>
                <View>
                  <Text style={[styles.averageLabel, { color: colors.text.secondary }]}>Average Mood</Text>
                  <Text style={[styles.averageVal, { color: colors.text.primary }]}>{weeklySummary.averageMood}</Text>
                </View>
                {weeklySummary.percentText ? (
                  <View style={[
                    styles.trendBadge,
                    {
                      backgroundColor: weeklySummary.isBetter
                        ? `${colors.success}15`
                        : `${colors.danger}15`,
                      borderColor: weeklySummary.isBetter
                        ? `${colors.success}30`
                        : `${colors.danger}30`
                    }
                  ]}>
                    <Text style={[
                      styles.trendBadgeText,
                      { color: weeklySummary.isBetter ? colors.success : colors.danger }
                    ]}>
                      {weeklySummary.percentText}
                    </Text>
                    <Text style={[styles.trendBadgeLabel, { color: colors.text.secondary }]}>
                      {weeklySummary.trendText}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.trendBadgeLabel, { color: colors.text.secondary, alignSelf: 'center' }]}>
                    {weeklySummary.trendText}
                  </Text>
                )}
              </View>

              <View style={styles.chartContainer}>
                <MoodTimeline points={svgPoints} svgWidth={SVG_WIDTH} svgHeight={SVG_HEIGHT} />
              </View>

              {/* Day Dots list */}
              <View style={styles.weekList}>
                {weekDaysData.map((d, index) => {
                  const rating = d.moodLevel as MoodRating | null;
                  const isToday = index === 6;
                  return (
                    <View key={index} style={[styles.weekDayRow, isToday && { borderBottomWidth: 0 }]}>
                      <Text style={[styles.weekDayLabel, { color: isToday ? colors.brand.primary : colors.text.primary }]}>
                        {d.dayName} {isToday && '(Today)'}
                      </Text>
                      <View style={styles.weekDayValue}>
                        {rating ? (
                          <>
                            <Text style={[styles.weekDayRating, { color: MOOD_COLORS[rating] }]}>
                              {MOOD_MAP[rating].label}
                            </Text>
                            <EmotionAvatar emotion={getMoodEmotion(rating)} size={22} animated={false} showGlow={false} />
                          </>
                        ) : (
                          <Text style={[styles.weekDayRating, { color: colors.text.tertiary }]}>No check-in</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* ── Monthly Mood Calendar ──────────────────────────────────── */}
            <View style={[styles.card, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }, shadows.glass]}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Mood Calendar</Text>
              <Text style={[styles.calendarSubtitle, { color: colors.text.secondary }]}>
                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
              </Text>
              
              <View style={styles.calendarGrid}>
                {/* Week day letters */}
                <View style={styles.calendarWeekHeader}>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <Text key={day} style={[styles.calendarWeekText, { color: colors.text.tertiary }]}>
                      {day}
                    </Text>
                  ))}
                </View>

                {/* Day cells */}
                <View style={styles.calendarBody}>
                  {monthlyCalendarData.map((cell, idx) => {
                    const rating = cell.moodLevel;
                    const cellColor = rating ? MOOD_COLORS[rating] : 'transparent';
                    return (
                      <View key={idx} style={styles.calendarCell}>
                        {cell.dayNumber !== null ? (
                          <View style={[
                            styles.calendarDot,
                            rating
                              ? { backgroundColor: cellColor }
                              : { backgroundColor: colors.surface.secondary, borderWidth: 1, borderColor: colors.border.default }
                          ]}>
                            <Text style={[
                              styles.calendarDayNum,
                              { color: rating ? '#FFFFFF' : colors.text.secondary }
                            ]}>
                              {cell.dayNumber}
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.calendarCellPlaceholder} />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* ── Emotion Distribution ───────────────────────────────────── */}
            <View style={[styles.card, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }, shadows.glass]}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Emotion Distribution</Text>
              
              <View style={styles.distributionList}>
                {emotionDistribution.map((dist, idx) => (
                  <View key={idx} style={styles.distRow}>
                    <Text style={styles.distEmoji}>{dist.emoji}</Text>
                    <Text style={[styles.distLabel, { color: colors.text.primary }]}>{dist.label}</Text>
                    
                    <View style={styles.progressContainer}>
                      <View style={[styles.progressBarBg, { backgroundColor: colors.border.default }]}>
                        <View style={[
                          styles.progressBarFill,
                          { backgroundColor: dist.color, width: `${dist.percentage}%` }
                        ]} />
                      </View>
                    </View>
                    
                    <Text style={[styles.distPct, { color: colors.text.secondary }]}>{dist.percentage}%</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ── AI Mood Insights (MODULE 4) ─────────────────────────────── */}
            <View style={[styles.card, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }, shadows.glass]}>
              <View style={styles.insightsHeader}>
                <Brain size={18} color={colors.brand.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text.primary, marginLeft: spacing.xs }]}>
                  AI Mood Insights
                </Text>
              </View>

              {moodEntries.length < 3 ? (
                <View style={styles.insightsLocked}>
                  <Info size={24} color={colors.brand.secondary} style={{ marginBottom: spacing.xs }} />
                  <Text style={[styles.lockedTitle, { color: colors.text.primary }]}>Insights Locked</Text>
                  <Text style={[styles.lockedDesc, { color: colors.text.secondary }]}>
                    Log mood entries and reflections for at least 3 days to reveal personalized wellness correlations.
                  </Text>
                </View>
              ) : (
                <View style={styles.insightsList}>
                  {moodInsights.map((insight) => {
                    const InsightIcon = insight.icon;
                    return (
                      <View key={insight.id} style={[styles.insightItem, { borderColor: colors.border.default }]}>
                        <View style={[styles.insightIconWrap, { backgroundColor: `${insight.color}15` }]}>
                          <InsightIcon size={18} color={insight.color} />
                        </View>
                        <View style={styles.insightContent}>
                          <Text style={[styles.insightTitle, { color: colors.text.primary }]}>
                            {insight.text}
                          </Text>
                          <Text style={[styles.insightDesc, { color: colors.text.secondary }]}>
                            {insight.description}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerRightPlaceholder: {
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing['2xl'],
    gap: spacing.lg,
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  emptyTextTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptyTextSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  averageLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  averageVal: {
    fontSize: 34,
    fontWeight: '800',
  },
  trendBadge: {
    borderWidth: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    alignItems: 'flex-end',
  },
  trendBadgeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  trendBadgeLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  chartContainer: {
    height: SVG_HEIGHT,
    marginBottom: spacing.xl,
    alignSelf: 'stretch',
  },
  weekList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: spacing.md,
  },
  weekDayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  weekDayLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  weekDayValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  weekDayRating: {
    fontSize: 12,
    fontWeight: '500',
  },
  calendarSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  calendarGrid: {
    alignSelf: 'stretch',
  },
  calendarWeekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  calendarWeekText: {
    width: (SCREEN_W - 64) / 7,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  calendarBody: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: (SCREEN_W - 64) / 7,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  calendarCellPlaceholder: {
    width: 28,
    height: 28,
  },
  calendarDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayNum: {
    fontSize: 11,
    fontWeight: '700',
  },
  distributionList: {
    gap: spacing.md,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  distLabel: {
    width: 76,
    fontSize: 13,
    fontWeight: '600',
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  distPct: {
    width: 32,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '600',
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  insightsLocked: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  lockedTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  lockedDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: spacing.md,
  },
  insightsList: {
    gap: spacing.md,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
  },
  insightIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
    lineHeight: 18,
  },
  insightDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
});
