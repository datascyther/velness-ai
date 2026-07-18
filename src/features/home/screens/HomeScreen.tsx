/**
 * HomeScreen — The narrative home experience, powered by the Home Intelligence
 * Layer (HomeService.fetchHomeState()).
 *
 * Scroll order = user story:
 *   1. HomeHeader          (top bar — brand + notifications badge)
 *   2. HeroCard            (large gradient — greeting + adaptive content)
 *   3. QuickActionsBar     (5 one-tap circular buttons)
 *   4. Reflection          (today's journal entry or write prompt)
 *   5. WeeklyHistoryCard   (compact mood timeline)
 *   6. SmartRecommendation (contextual "because…" card)
 *   7. Progress            (aggregate completion stats)
 *   8. Mood check-in flow  (selector + reflection + submit)
 *   9. SyncStatusBanner    (offline / pending queue indicator)
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
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
  interpolate,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

import { router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { ROUTES } from '@/core/config/routes';
import { useAuth } from '@/shared/hooks/useAuth';
import { useSaveMood } from '@/shared/hooks/useMood';
import { moodRepository } from '@/repositories/MoodRepository';
import type { Mood, MoodRating } from '@/shared/types';
import { getMoodLabel, getMoodEmoji } from '@/shared/types';
import { useCheckInPresence } from '@/shared/hooks/useCheckInPresence';
import { SparkleMark } from '@/components/emotion/EmotionAvatar';
import { SectionHeader } from '@/shared/components/SectionHeader';
import { spacing, typography, borderRadius } from '@/core/theme';
import { useSyncRefresh } from '@/shared/hooks/useSyncRefresh';
import { useSyncStore } from '@/core/store/useSyncStore';
import { ReflectionInput } from '../components/ReflectionInput';
import { GradientButton } from '@/shared/components/GradientButton';
import { useTheme } from '@/hooks/useTheme';

import {
  HomeHeader,
} from '../components';

import { HomeSkeleton } from '../components/HomeSkeleton';
import { CheckInPanel } from '../components/CheckInPanel';
import { HeroCard } from '../components/HeroCard';
import { QuickActionsBar } from '../components/QuickActionsBar';
import {
  resolveQuickActionRoute,
  type QuickActionFeature,
} from '../services/quickActionResolver';
import { WeeklyHistoryCard } from '../components/WeeklyHistoryCard';
import { SmartRecommendationCard } from '../components/SmartRecommendationCard';

import {
  useHomeState,
  HOME_STATE_QUERY_KEY,
} from '@/features/home/hooks/useHomeState';
import { journalService } from '../../../../backend/services/JournalService';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const BG_ORB = SCREEN_W * 1.2;

export function HomeScreen() {
  const { colors } = useTheme();
  const { lastCheckIn, setLastCheckIn } = useCheckInPresence();
  const { user } = useAuth();
  const uid = user?.uid || null;
  const queryClient = useQueryClient();
  const isFocused = useIsFocused();

  const { data: home, isPending, isFetching } = useHomeState();

  const { data: journals = [] } = useQuery({
    queryKey: ['journals_list', uid],
    queryFn: () => journalService.list(),
    enabled: !!uid,
  });

  const greeting = home?.greeting;
  const reflection = home?.reflection;
  const mood = home?.mood;
  const recommendation = home?.recommendation;
  const progress = home?.progress;
  const notifications = home?.notifications;

  // ── Ambient Background Motion ────────────────────────────────────────────────
  const ambientT = useSharedValue(0);
  const reduced = useReducedMotion();
  // While the cold-start skeleton is up, keep the orbs parked at a static
  // frame so the background loop never competes with the incoming content
  // for frames. Resume the gentle drift once real data arrives.
  // Also pause when this tab is not focused to avoid wasting GPU cycles.
  React.useEffect(() => {
    if (reduced || !isFocused) {
      ambientT.value = ambientT.value;
      return;
    }
    if (isPending) {
      ambientT.value = 0;
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
  }, [ambientT, reduced, isPending, isFocused]);

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
  // Tracks whether the user dismissed the auto check-in prompt without
  // checking in, so we don't re-pop it on every render/refetch.
  const [dismissedAutoCheckIn, setDismissedAutoCheckIn] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reflectionNote, setReflectionNote] = useState('');
  const [isSavingReflection, setIsSavingReflection] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-check-in prompt: when a (new) user opens the app and hasn't checked
  // in today, pop the mood check-in panel automatically between the quick
  // actions and the reflection card. Opens once the home data resolves; a
  // manual dismiss (without checking in) suppresses it for the session.
  const autoPromptShownRef = useRef(false);
  useEffect(() => {
    if (autoPromptShownRef.current) return;
    if (mood === undefined) return; // still loading
    if (!mood?.today && !dismissedAutoCheckIn) {
      autoPromptShownRef.current = true;
      setShowSelector(true);
    } else {
      autoPromptShownRef.current = true;
    }
  }, [mood, dismissedAutoCheckIn]);

  // Reflect an existing today check-in into shared presence so other screens
  // show it immediately.
  useEffect(() => {
    if (mood?.today && !lastCheckIn) {
      setLastCheckIn({
        rating: mood.today.rating,
        label: getMoodLabel(mood.today.rating),
        emoji: getMoodEmoji(mood.today.rating),
        timestamp: mood.today.timestamp.toString(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood?.today]);


  // Refs for the Quick-Action "Journal" target (the inline reflection composer).
  const scrollRef = useRef<ScrollView>(null);
  const reflectionSectionRef = useRef<View>(null);
  const reflectionY = useRef(0);
  const reflectionInputRef = useRef<{ focus: () => void } | null>(null);

  // Save-reflection button: appears smoothly whenever the user is composing
  // text (or just saved). The node stays PERMANENTLY mounted — we only animate
  // opacity + translateY and toggle pointerEvents — never display/conditional
  // mount — to avoid the documented Fabric responder/handle crash
  // (see CheckInPanel.tsx). When hidden it is fully transparent (opacity 0) so
  // its shadow cannot bleed onto the canvas as a smudge.
  const SAVE_BTN_SPRING = { damping: 28, stiffness: 220, mass: 0.9, overshootClamping: true };
  const saveBtnVis = useSharedValue(0);
  const hasComposedText = reflectionNote.trim().length > 0;
  const saveBtnVisible = hasComposedText || reflectionSaved;
  useEffect(() => {
    saveBtnVis.value = withSpring(saveBtnVisible ? 1 : 0, SAVE_BTN_SPRING);
  }, [saveBtnVisible, reflectionSaved]);

  const saveBtnStyle = useAnimatedStyle(() => ({
    opacity: saveBtnVis.value,
    transform: [{ translateY: interpolate(saveBtnVis.value, [0, 1], [8, 0]) }],
    pointerEvents: saveBtnVisible ? 'auto' : 'none',
  }));

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
      setLastCheckIn({
        rating: selectedMood,
        label: getMoodLabel(selectedMood),
        emoji: getMoodEmoji(selectedMood),
        timestamp: new Date().toISOString(),
      });
      setIsSuccess(true);
      setShowSelector(false);
      setReflectionNote('');
      void queryClient.invalidateQueries({ queryKey: HOME_STATE_QUERY_KEY });
      setTimeout(() => setIsSuccess(false), 2500);
    } catch (err) {
      console.error('[HomeScreen] Check-in save error:', err);
    }
  }, [selectedMood, reflectionNote, uid, saveMoodMutation, queryClient]);

  const handleSaveReflection = useCallback(async () => {
    const note = reflectionNote.trim();
    if (!note || isSavingReflection) return;
    setIsSavingReflection(true);
    setReflectionSaved(false);
    try {
      await journalService.create({
        title: `Reflection — ${new Date().toLocaleDateString()}`,
        body: note,
      });
      setReflectionNote('');
      setReflectionSaved(true);
      void queryClient.invalidateQueries({ queryKey: HOME_STATE_QUERY_KEY });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setReflectionSaved(false), 2000);
    } catch (err) {
      console.error('[HomeScreen] Reflection save error:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSavingReflection(false);
    }
  }, [reflectionNote, isSavingReflection, queryClient]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await processQueue(queryClient);
      if (uid) {
        void moodRepository
          .syncFromCloud(uid)
          .then((merged) => {
            if (merged.length > 0) {
              queryClient.setQueryData(['moods', uid], merged);
            }
          })
          .catch((err) => console.warn('[HomeScreen] mood sync failed:', err));
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
    void resolveQuickActionRoute(feature)
      .then((route) => {
        router.push(route as never);
      })
      .catch((err) => console.warn('[HomeScreen] quick action route failed:', err));
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

      {isPending ? (
        // Cold start (no cached home state yet) — show a cohesive shimmer
        // placeholder with the ambient motion behind it so the transition
        // into the live UI feels continuous rather than a blank flash.
        <HomeSkeleton />
      ) : (
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
          streak={mood?.streak ?? 0}
          dayCount={mood?.dayCount ?? 0}
          moment={greeting?.moment ?? 'default'}
          hasCheckedInToday={!!mood?.today}
          intention={greeting?.intention ?? ''}
          checkInQuote={
            lastCheckIn
              ? `“Feeling ${lastCheckIn.label} — checked in today.”`
              : '“How are you feeling today?”'
          }
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

        {/* ── 4. Mood Check-in (compact card; opens the soft selector) ─────── */}
        <CheckInPanel
          visible={showSelector}
          selectedMood={selectedMood}
          onSelectMood={handleSelectMood}
          reflectionNote={reflectionNote}
          onReflectionChange={setReflectionNote}
          reflectionInputRef={reflectionInputRef}
          isSaving={saveMoodMutation.isPending}
          onSubmit={handleSubmitMood}
          onDismiss={() => {
            setShowSelector(false);
            setDismissedAutoCheckIn(true);
          }}
        />
        {/* Success confirmation renders as a separate, stable node (never
           replaces the panel) so a save-tap can't unmount/mount a host view
           mid-responder and null the Fabric handle. */}
        {isSuccess && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={[
              styles.successCard,
              { backgroundColor: `${colors.success}1A`, borderColor: `${colors.success}33` },
            ]}
          >
            <Text style={[styles.successText, { color: colors.success }]}>
              ✓ Checked in — {getMoodLabel(selectedMood as MoodRating)} work today.
            </Text>
          </Animated.View>
        )}

        {/* ── 5. Reflection (Journal) ─────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.duration(300)}
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
            <Text style={[styles.reflectionPrompt, { color: colors.text.secondary }]}>
              {reflection?.prompt ?? "Write one thought. That's enough."}
            </Text>
          )}
          <ReflectionInput value={reflectionNote} onChangeText={setReflectionNote} />
          <Animated.View style={[styles.submitRow, saveBtnStyle]}>
            <GradientButton
              title={reflectionSaved ? "Saved ✓" : "Save reflection"}
              onPress={() => void handleSaveReflection()}
              disabled={isSavingReflection || !reflectionNote.trim() || reflectionSaved}
              loading={isSavingReflection}
              visible={saveBtnVisible}
              size="lg"
            />
          </Animated.View>
        </Animated.View>

        {/* ── 5. Compact Mood Timeline ─────────────────────────────────────── */}
        <View style={styles.sectionMoodHistory}>
          <WeeklyHistoryCard
            moodEntries={mood?.entries ?? []}
            onCheckIn={handleCheckIn}
            onPress={() => router.push(ROUTES.JOURNEY.MOOD_TIMELINE as any)}
          />
        </View>

        {/* ── 6. Smart Recommendation ──────────────────────────────────────── */}
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

        {/* ── 7. Progress ───────────────────────────────────────────────────── */}
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
        </ScrollView>
      )}
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
  // ── Visual rhythm spacing ─────────────────────────────────────────────
  // Hero → Actions → Check-in → Reflection form a deliberate cluster with
  // tight, consistent rhythm; later sections open up with more breath.
  sectionQuickActions: {
    marginTop: 24,
  },
  sectionProgress: {
    marginTop: 32,
  },
  // Check-in card sits snugly under the action buttons.
  sectionCheckIn: {
    marginTop: 20,
  },
  // Reflection tightens to the check-in (they read as one "pause & reflect"
  // block), then the timeline opens with more space.
  sectionReflection: {
    marginTop: 20,
  },
  sectionMoodHistory: {
    marginTop: 32,
  },
  sectionRecommendation: {
    marginTop: 36,
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

  submitRow: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    marginTop: spacing.sm,
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
