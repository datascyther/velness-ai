/**
 * HomeScreen — The narrative home experience, powered by the Home Intelligence
 * Layer (HomeService.fetchHomeState()).
 *
 * Scroll order = user story:
 *   1. HomeHeader          (top bar — brand + notifications badge)
 *   2. HeroCard            (large gradient — greeting + adaptive content)
 *   3. QuickActionsBar     (5 one-tap circular buttons)
 *   4. Two-column row      (ContinueJourneyCard + TodaysMissionCard)
 *   5. Reflection          (today's journal entry or write prompt)
 *   6. WeeklyHistoryCard   (compact mood timeline)
 *   7. SmartRecommendation (contextual "because…" card)
 *   8. Progress            (aggregate completion stats)
 *   9. Mood check-in flow  (selector + reflection + submit)
 *  10. SyncStatusBanner    (offline / pending queue indicator)
 */
import React, { useState, useCallback, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

import { router } from 'expo-router';
import { buildRoute, ROUTES } from '@/core/config/routes';
import { useAuth } from '@/shared/hooks/useAuth';
import { useSaveMood } from '@/shared/hooks/useMood';
import { moodRepository } from '@/repositories/MoodRepository';
import type { Mood, MoodRating } from '@/shared/types';
import { MOOD_MAP, getMoodEmotion } from '@/shared/types';
import { EmotionAvatar, SparkleMark } from '@/components/emotion/EmotionAvatar';
import { SectionHeader } from '@/shared/components/SectionHeader';
import { spacing } from '@/core/theme';
import { useSyncRefresh } from '@/shared/hooks/useSyncRefresh';
import { useSyncStore } from '@/core/store/useSyncStore';
import { ReflectionInput } from '../components/ReflectionInput';
import { useTheme } from '@/hooks/useTheme';

import {
  HomeHeader,
  MoodSelector,
  JourneyLoadingState,
  JourneyErrorState,
  DailyGoalsCard,
  AchievementsWidget,
} from '../components';

import { HeroCard } from '../components/HeroCard';
import { QuickActionsBar } from '../components/QuickActionsBar';
import {
  resolveQuickActionRoute,
  type QuickActionFeature,
} from '../services/quickActionResolver';
import { ContinueJourneyCard } from '../components/ContinueJourneyCard';
import { TodaysMissionCard } from '../components/TodaysMissionCard';
import { WeeklyHistoryCard } from '../components/WeeklyHistoryCard';
import { SmartRecommendationCard } from '../components/SmartRecommendationCard';

import {
  useHomeState,
  HOME_STATE_QUERY_KEY,
} from '@/features/home/hooks/useHomeState';
import { missionService } from '../../../../backend/services/MissionService';
import { journalService } from '../../../../backend/services/JournalService';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const BG_ORB = SCREEN_W * 1.2;

export function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const uid = user?.uid || null;
  const queryClient = useQueryClient();

  const { data: home, isLoading, error } = useHomeState();

  const { data: journals = [] } = useQuery({
    queryKey: ['journals_list', uid],
    queryFn: () => journalService.list(),
    enabled: !!uid,
  });

  const greeting = home?.greeting;
  const mission = home?.todaysMission ?? null;
  const journey = home?.journey ?? null;
  const reflection = home?.reflection;
  const mood = home?.mood;
  const recommendation = home?.recommendation;
  const progress = home?.progress;
  const notifications = home?.notifications;

  // ── Ambient Background Motion ────────────────────────────────────────────────
  const ambientT = useSharedValue(0);
  const reduced = useReducedMotion();
  React.useEffect(() => {
    if (reduced) {
      ambientT.value = 0.5;
      return;
    }
    const ease = Easing.inOut(Easing.ease);
    ambientT.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 24000, easing: ease }),
        withTiming(0, { duration: 24000, easing: ease }),
      ),
      -1,
      false,
    );
  }, [ambientT, reduced]);

  const bgOrbAStyle = useAnimatedStyle(() => {
    const tx = -SCREEN_W * 0.3 + ambientT.value * (SCREEN_W * 0.4);
    const ty = -SCREEN_H * 0.1 + ambientT.value * (SCREEN_H * 0.2);
    return {
      transform: [{ translateX: tx }, { translateY: ty }] as any,
    };
  });

  const bgOrbBStyle = useAnimatedStyle(() => {
    const tx = SCREEN_W * 0.4 - ambientT.value * (SCREEN_W * 0.5);
    const ty = SCREEN_H * 0.6 - ambientT.value * (SCREEN_H * 0.3);
    return {
      transform: [{ translateX: tx }, { translateY: ty }] as any,
    };
  });

  // ── Local state ──────────────────────────────────────────────────────────────
  const saveMoodMutation = useSaveMood();
  const [selectedMood, setSelectedMood] = useState<MoodRating | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reflectionNote, setReflectionNote] = useState('');
  const [isSavingReflection, setIsSavingReflection] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Refs for the Quick-Action "Journal" target (the inline reflection composer).
  const scrollRef = useRef<ScrollView>(null);
  const reflectionSectionRef = useRef<View>(null);
  const reflectionY = useRef(0);
  const reflectionInputRef = useRef<{ focus: () => void } | null>(null);

  // ── Sync ─────────────────────────────────────────────────────────────────────
  useSyncRefresh();
  const pendingQueue = useSyncStore((s) => s.pendingQueue);
  const isSyncing = useSyncStore((s) => s.isSyncing);
  const isOnline = useSyncStore((s) => s.isOnline);
  const lastError = useSyncStore((s) => s.lastError);
  const processQueue = useSyncStore((s) => s.processQueue);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleCheckIn = useCallback(() => setShowSelector(true), []);

  const handleSelectMood = useCallback((value: MoodRating) => setSelectedMood(value), []);

  const handleSubmitMood = useCallback(async () => {
    if (selectedMood === null || !uid) return;
    const entry: Mood = {
      id: `mood-${Date.now()}`,
      rating: selectedMood,
      note: reflectionNote,
      timestamp: new Date(),
    };
    try {
      await saveMoodMutation.mutateAsync({ uid, entry });
      setIsSuccess(true);
      setShowSelector(false);
      setReflectionNote('');
      void queryClient.invalidateQueries({ queryKey: HOME_STATE_QUERY_KEY });
      setTimeout(() => setIsSuccess(false), 2500);
    } catch (err) {
      console.error('[HomeScreen] Check-in save error:', err);
    }
  }, [selectedMood, reflectionNote, uid, saveMoodMutation, queryClient]);

  const handleHeroCta = useCallback(() => {
    if (!mood?.today) {
      handleCheckIn();
    } else if (journey) {
      router.push(ROUTES.JOURNEY.HOME);
    } else {
      router.push(ROUTES.TABS.JOURNEY);
    }
  }, [mood?.today, journey, handleCheckIn]);

  const resumeJourney = useCallback(() => {
    router.push(ROUTES.JOURNEY.HOME);
  }, []);

  const handleMissionPress = useCallback(() => {
    if (mission?.lessonId) {
      router.push(
        buildRoute(ROUTES.JOURNEY.LESSON, {
          programId: mission.programId ?? journey?.programId ?? '',
          lessonId: mission.lessonId,
        }),
      );
      return;
    }
    if (mission) {
      void missionService
        .completeMission(mission.id)
        .then(() => void queryClient.invalidateQueries({ queryKey: HOME_STATE_QUERY_KEY }))
        .catch((err) => console.error('[HomeScreen] mission complete error:', err));
    } else {
      resumeJourney();
    }
  }, [mission, journey, queryClient, resumeJourney]);

  const handleSaveReflection = useCallback(async () => {
    if (!reflectionNote.trim()) return;
    setIsSavingReflection(true);
    try {
      await journalService.create({
        title: `Reflection — ${new Date().toLocaleDateString()}`,
        body: reflectionNote,
      });
      setReflectionNote('');
      void queryClient.invalidateQueries({ queryKey: HOME_STATE_QUERY_KEY });
    } catch (err) {
      console.error('[HomeScreen] Reflection save error:', err);
    } finally {
      setIsSavingReflection(false);
    }
  }, [reflectionNote, queryClient]);

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: HOME_STATE_QUERY_KEY });
  }, [queryClient]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await processQueue(queryClient);
      if (uid) {
        void moodRepository.syncFromCloud(uid).then((merged) => {
          if (merged.length > 0) {
            queryClient.setQueryData(['moods', uid], merged);
          }
        });
      }
      await queryClient.invalidateQueries({ queryKey: HOME_STATE_QUERY_KEY });
    } catch (err) {
      console.error('[HomeScreen] Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, [uid, queryClient, processQueue]);

  const handleNotificationPress = useCallback(() => {
    console.log('[HomeScreen] Navigate to notification center');
  }, []);

  // ── Quick Actions (MODULE 2) ────────────────────────────────────────────────
  // Each handler routes to (or resumes) the relevant feature. Resume logic lives
  // in `resolveQuickActionRoute` (reads recent analytics events, falls back to
  // the feature index route).

  const openFeature = useCallback((feature: QuickActionFeature) => {
    void resolveQuickActionRoute(feature).then((route) => {
      router.push(route as never);
    });
  }, [router]);

  const handleBreathe = useCallback(() => openFeature('breathing'), [openFeature]);
  const handleMeditate = useCallback(() => openFeature('meditation'), [openFeature]);
  const handleSleep = useCallback(() => openFeature('sleep'), [openFeature]);

  // AI Chat: navigate to the Chat tab and pass a prefill prompt via route param.
  // ChatScreen reads `prefill` and feeds it into the composer (see ChatScreen.tsx).
  const handleOpenChat = useCallback(() => {
    router.push({
      pathname: ROUTES.TABS.CHAT,
      params: { prefill: "Hi. What's on your mind today?" },
    } as never);
  }, [router]);

  // Journal: no dedicated journal route exists — the reflection composer lives
  // inline on the Home screen. Scroll to it and focus the input.
  const handleOpenJournal = useCallback(() => {
    scrollRef.current?.scrollTo({ y: reflectionY.current, animated: true });
    reflectionInputRef.current?.focus();
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background.primary }]}
      edges={['top']}
    >
      <StatusBar style="light" />

      {/* Subtle Ambient Motion Background */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View style={[styles.bgOrb, bgOrbAStyle]}>
          <Svg width={BG_ORB} height={BG_ORB}>
            <Defs>
              <RadialGradient id="bgPurple" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#94A3B8" stopOpacity={0.05} />
                <Stop offset="60%" stopColor="#94A3B8" stopOpacity={0.01} />
                <Stop offset="100%" stopColor="#94A3B8" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#bgPurple)" />
          </Svg>
        </Animated.View>
        <Animated.View style={[styles.bgOrb, bgOrbBStyle]}>
          <Svg width={BG_ORB} height={BG_ORB}>
            <Defs>
              <RadialGradient id="bgCyan" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#06B6D4" stopOpacity={0.03} />
                <Stop offset="60%" stopColor="#06B6D4" stopOpacity={0.01} />
                <Stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#bgCyan)" />
          </Svg>
        </Animated.View>
      </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand.primary}
            colors={[colors.brand.primary]}
          />
        }
      >
        {/* ── 1. Top bar ──────────────────────────────────────────────────── */}
        <HomeHeader
          onNotificationPress={handleNotificationPress}
          unreadCount={notifications?.unreadCount ?? 0}
        />

        {/* ── Sync Banner (non-intrusive, only when pending) ──────────────── */}
        {pendingQueue.length > 0 && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={[
              styles.syncBanner,
              { backgroundColor: colors.surface.secondary, borderColor: colors.border.default },
            ]}
          >
            <View style={styles.syncBannerContent}>
              {isSyncing ? (
                <ActivityIndicator size="small" color={colors.brand.primary} style={{ marginRight: 8 }} />
              ) : (
                <View style={[styles.syncStatusDot, { backgroundColor: isOnline ? colors.success : colors.warning }]} />
              )}
              <Text style={[styles.syncBannerText, { color: colors.text.secondary }]}>
                {isSyncing
                  ? 'Syncing changes...'
                  : !isOnline
                  ? `Offline · ${pendingQueue.length} pending`
                  : lastError
                  ? 'Sync failed. Tap to retry.'
                  : `${pendingQueue.length} update${pendingQueue.length === 1 ? '' : 's'} pending`}
              </Text>
            </View>
            {isOnline && !isSyncing && (
              <Text
                style={[styles.retryButton, { color: colors.brand.primary }]}
                onPress={() => void processQueue(queryClient)}
              >
                Sync now
              </Text>
            )}
          </Animated.View>
        )}

        {/* ── 2. Hero Card ─────────────────────────────────────────────────── */}
        <HeroCard
          headline={greeting?.adaptive?.headline ?? greeting?.text ?? 'Welcome back'}
          subline={greeting?.adaptive?.subline ?? "Here's your day at a glance."}
          ctaLabel={greeting?.adaptive?.ctaLabel ?? 'Continue'}
          streak={mood?.streak ?? 0}
          dayCount={mood?.dayCount ?? 0}
          moment={greeting?.moment ?? 'default'}
          hasCheckedInToday={!!mood?.today}
          intention={greeting?.intention ?? ''}
          onCtaPress={handleHeroCta}
        />

        {/* ── 3. Quick Actions ─────────────────────────────────────────────── */}
        <View style={styles.sectionQuickActions}>
          <QuickActionsBar
            onBreathe={handleBreathe}
            onMeditate={handleMeditate}
            onSleep={handleSleep}
            onOpenChat={handleOpenChat}
            onOpenJournal={handleOpenJournal}
          />
        </View>

        {/* ── 3.5 Today's Progress / Daily Goals ───────────────────────────── */}
        <View style={styles.sectionProgress}>
          <DailyGoalsCard
            uid={uid}
            hasCheckedInToday={!!mood?.today}
            hasJournaledToday={!!reflection?.reflectedToday}
            recentEvents={home?.recentEvents ?? []}
            onCheckInPress={handleCheckIn}
            onJournalPress={() => {
              if (reflectionSectionRef.current) {
                scrollRef.current?.scrollTo({ y: reflectionY.current, animated: true });
              }
            }}
            onBreathePress={handleBreathe}
            onMeditatePress={handleMeditate}
          />
        </View>

        {/* ── 4. Journey + Today's Mission Row ─────────────────────────────── */}
        {isLoading ? (
          <View style={styles.sectionFocus}>
            <JourneyLoadingState />
          </View>
        ) : error ? (
          <View style={styles.sectionFocus}>
            <JourneyErrorState onRetry={refresh} />
          </View>
        ) : journey ? (
          <View style={[styles.sectionFocus, styles.twoCol]}>
            <ContinueJourneyCard
              title={journey.title}
              status={journey.status}
              lastActivity={journey.lastActivity?.toISOString() ?? null}
              currentStep={journey.currentLesson || 1}
              totalSteps={journey.totalLessons || 5}
              percent={journey.completionPercent || 0}
              onContinue={resumeJourney}
            />
            <TodaysMissionCard
              missionTitle={mission?.title ?? journey.title}
              missionDescription={mission?.description ?? undefined}
              estimatedTime={mission?.estimatedTime}
              reason={mission?.reason}
              onPress={handleMissionPress}
            />
          </View>
        ) : mission ? (
          <View style={styles.sectionFocus}>
            <TodaysMissionCard
              missionTitle={mission.title}
              missionDescription={mission.description ?? undefined}
              estimatedTime={mission.estimatedTime}
              reason={mission.reason}
              onPress={handleMissionPress}
            />
          </View>
        ) : null}

        {/* ── 5. Reflection (Journal) ─────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.sectionReflection}
          ref={reflectionSectionRef}
          onLayout={(e) => {
            reflectionY.current = e.nativeEvent.layout.y;
          }}
        >
          <View style={styles.reflectionHeader}>
            <Text style={[styles.reflectionKicker, { color: colors.text.tertiary }]}>
              Take a moment.
            </Text>
            <Text style={[styles.reflectionTitle, { color: colors.text.primary }]}>
              What's on your mind?
            </Text>
          </View>
          {reflection?.reflectedToday && reflection.latest ? (
            <View
              style={[
                styles.reflectionCard,
                { backgroundColor: colors.surface.secondary, borderColor: colors.border.default },
              ]}
            >
              <View style={styles.reflectionEyebrowRow}>
                <SparkleMark size={14} color={colors.text.tertiary} />
                <Text style={[styles.reflectionEyebrow, { color: colors.text.secondary }]}>
                  You reflected today
                </Text>
              </View>
              <Text style={[styles.reflectionBody, { color: colors.text.primary }]} numberOfLines={4}>
                {reflection.latest.body ?? reflection.latest.title}
              </Text>
            </View>
          ) : (
            <>
              <Text style={[styles.reflectionPrompt, { color: colors.text.secondary }]}>
                {reflection?.prompt ?? "Write one thought. That's enough."}
              </Text>
              <ReflectionInput value={reflectionNote} onChangeText={setReflectionNote} />
              <View style={styles.submitRow}>
                <Pressable
                  onPress={() => void handleSaveReflection()}
                  disabled={isSavingReflection || !reflectionNote.trim()}
                  style={({ pressed }) => [
                    styles.submitButton,
                    {
                      backgroundColor: isSavingReflection
                        ? `${colors.brand.primary}88`
                        : colors.brand.primary,
                    },
                    pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] },
                    !reflectionNote.trim() && { opacity: 0.5 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Save reflection"
                >
                  {isSavingReflection ? (
                    <ActivityIndicator size="small" color={colors.brand.contrastText} />
                  ) : (
                    <Text style={[styles.submitButtonText, { color: colors.brand.contrastText }]}>
                      Save reflection
                    </Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </Animated.View>

        {/* ── 6. Compact Mood Timeline ─────────────────────────────────────── */}
        <View style={styles.sectionMoodHistory}>
          <WeeklyHistoryCard
            moodEntries={mood?.entries ?? []}
            onCheckIn={handleCheckIn}
            onPress={() => router.push(ROUTES.JOURNEY.MOOD_TIMELINE as any)}
          />
        </View>

        {/* ── 6.5 Achievements ─────────────────────────────────────────────── */}
        <View style={styles.sectionAchievements}>
          <AchievementsWidget
            moodEntries={mood?.entries ?? []}
            streak={mood?.streak ?? 0}
            journals={journals}
            recentEvents={home?.recentEvents ?? []}
          />
        </View>

        {/* ── 7. Smart Recommendation ──────────────────────────────────────── */}
        {recommendation?.primary && recommendation?.reason && (
          <View style={styles.sectionRecommendation}>
            <SmartRecommendationCard
              reason={recommendation.reason}
              title={recommendation.primary.reason ?? recommendation.primary.source ?? 'Try something new'}
              subtitle={
                recommendation.primary.source !== recommendation.primary.reason
                  ? recommendation.primary.source
                  : undefined
              }
              onPress={() => console.log('[HomeScreen] Recommendation tapped')}
            />
          </View>
        )}

        {/* ── 8. Progress ───────────────────────────────────────────────────── */}
        {progress && (progress.completedLessons > 0 || progress.completedExercises > 0) && (
          <View style={styles.sectionProgress}>
            <SectionHeader title="Your Progress" />
            <View style={[styles.progressRow, { backgroundColor: colors.surface.secondary, borderColor: colors.border.default }]}>
              <View style={styles.progressStat}>
                <Text style={[styles.progressValue, { color: colors.text.primary }]}>
                  {progress.completedLessons}
                </Text>
                <Text style={[styles.progressLabel, { color: colors.text.secondary }]}>Lessons</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={[styles.progressValue, { color: colors.text.primary }]}>
                  {progress.completedExercises}
                </Text>
                <Text style={[styles.progressLabel, { color: colors.text.secondary }]}>Exercises</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={[styles.progressValue, { color: colors.text.primary }]}>
                  {progress.streakDays}
                </Text>
                <Text style={[styles.progressLabel, { color: colors.text.secondary }]}>Day streak</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── 9. Mood Check-in Flow ─────────────────────────────────────────── */}
        {showSelector && !mood?.today && (
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={styles.section}
          >
            <SectionHeader title="How are you feeling today?" />
            <MoodSelector
              selectedMood={selectedMood}
              onSelectMood={handleSelectMood}
            />
            {selectedMood !== null && (
              <View
                style={[
                  styles.submitContainer,
                  { backgroundColor: colors.surface.secondary, borderColor: colors.border.default },
                ]}
              >
                <View style={styles.submitRowInline}>
                  <EmotionAvatar
                    emotion={getMoodEmotion(selectedMood)}
                    size={20}
                    animated={false}
                    showGlow={false}
                  />
                  <Text style={[styles.submitText, { color: colors.text.secondary }]}>
                    You selected: {MOOD_MAP[selectedMood].label} — ready to check in?
                  </Text>
                </View>
              <ReflectionInput
                value={reflectionNote}
                onChangeText={setReflectionNote}
                inputRef={reflectionInputRef}
              />
                <View style={styles.submitRow}>
                  <Text
                    style={[
                      styles.submitButton,
                      { backgroundColor: colors.brand.primary, color: colors.brand.contrastText },
                    ]}
                    onPress={handleSubmitMood}
                  >
                    {saveMoodMutation.isPending ? 'Saving…' : 'Save check-in'}
                  </Text>
                </View>
              </View>
            )}
          </Animated.View>
        )}

        {/* ── Success toast ────────────────────────────────────────────────── */}
        {isSuccess && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={[
              styles.successCard,
              { backgroundColor: `${colors.success}1A`, borderColor: `${colors.success}33` },
            ]}
          >
            <Text style={[styles.successText, { color: colors.success }]}>
              ✓ Checked in! Great work today.
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0B12',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 120,
    paddingHorizontal: spacing.xl,
  },
  bgOrb: {
    position: 'absolute',
    width: BG_ORB,
    height: BG_ORB,
  },
  // ── Visual rhythm spacing (Phase 1) ──────────────────────────────────
  // Each section gets intentional spacing instead of uniform 16px.
  sectionQuickActions: {
    marginTop: 24,
  },
  sectionProgress: {
    marginTop: 32,
  },
  sectionFocus: {
    marginTop: 28,
  },
  sectionReflection: {
    marginTop: 36,
  },
  sectionMoodHistory: {
    marginTop: 28,
  },
  sectionAchievements: {
    marginTop: 32,
  },
  sectionRecommendation: {
    marginTop: 36,
  },
  section: {
    marginTop: 24,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 12,
  },

  // Sync banner
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  syncBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  syncStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 8,
  },
  syncBannerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  retryButton: {
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },

  // Reflection
  reflectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  reflectionEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  reflectionEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  submitRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reflectionBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  reflectionPrompt: {
    fontSize: 13,
    marginBottom: 8,
  },

  // Progress
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  progressLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // Check-in
  submitContainer: {
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  submitText: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  submitRow: {
    alignItems: 'center',
    marginTop: 10,
  },
  submitButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    minHeight: 44,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Success
  successCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginTop: 12,
  },
  successText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  reflectionHeader: {
    marginBottom: spacing.md,
  },
  reflectionKicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  reflectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
});

export default HomeScreen;
