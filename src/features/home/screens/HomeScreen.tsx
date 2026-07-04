import React, { useState, useMemo, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/shared/hooks/useAuth';
import { useMoodEntries, useSaveMood } from '@/shared/hooks/useMood';
import { useJourney } from '@/shared/hooks/useJourney';
import { router } from 'expo-router';
import { ROUTES } from '@/core/config/routes';
import { moodRepository } from '@/repositories/MoodRepository';
import type { Mood, MoodRating } from '@/shared/types';
import { MOOD_MAP } from '@/shared/types';
import { SectionHeader } from '@/shared/components/SectionHeader';
import { spacing } from '@/core/theme';
import { useSyncRefresh } from '@/shared/hooks/useSyncRefresh';
import { useSyncStore } from '@/core/store/useSyncStore';
import { ReflectionInput } from '../components/ReflectionInput';
import { useTheme } from '@/hooks/useTheme';

import {
  HomeHeader,
  MoodSnapshotCard,
  CheckInCard,
  MoodSelector,
  WeeklyHistoryCard,
  ContinueJourneyCard,
  JourneyLoadingState,
  JourneyErrorState,
  EmptyJourneyState,
} from '../components';

export function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const uid = user?.uid || null;
  const queryClient = useQueryClient();

  const { data: moodEntries = [] } = useMoodEntries(uid);
  const saveMoodMutation = useSaveMood();

  const [selectedMood, setSelectedMood] = useState<MoodRating | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reflection, setReflection] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Sync focus & resume hook — processes pending queue, never blocks UI
  useSyncRefresh();

  // Sync Store UI selectors
  const pendingQueue = useSyncStore((state) => state.pendingQueue);
  const isSyncing = useSyncStore((state) => state.isSyncing);
  const isOnline = useSyncStore((state) => state.isOnline);
  const lastError = useSyncStore((state) => state.lastError);
  const processQueue = useSyncStore((state) => state.processQueue);

  const todayMood = useMemo(() => {
    const todayStr = new Date().toDateString();
    const todayEntries = moodEntries.filter(
      (entry) => new Date(entry.timestamp).toDateString() === todayStr
    );
    return todayEntries.length > 0 ? todayEntries[todayEntries.length - 1] : null;
  }, [moodEntries]);

  const handleCheckIn = useCallback(() => {
    setShowSelector(true);
  }, []);

  const handleSelectMood = useCallback((value: MoodRating) => {
    setSelectedMood(value);
  }, []);

  const handleSubmitMood = useCallback(async () => {
    if (selectedMood === null || !uid) return;

    const entry: Mood = {
      id: `mood-${Date.now()}`,
      rating: selectedMood,
      note: reflection,
      timestamp: new Date(),
    };

    try {
      await saveMoodMutation.mutateAsync({ uid, entry });
      setIsSuccess(true);
      setShowSelector(false);
      setReflection('');
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (error) {
      console.error('[HomeScreen] Check-in save error:', error);
    }
  }, [selectedMood, reflection, uid, saveMoodMutation]);

  const {
    journey,
    journeyLoading,
    journeyError,
    resumeJourney,
    refresh,
  } = useJourney();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // 1. Process pending sync queue
      await processQueue(queryClient);

      // 2. Start background cloud sync (not awaited — silently updates cache when done)
      if (uid) {
        void moodRepository.syncFromCloud(uid).then((merged) => {
          if (merged.length > 0) {
            queryClient.setQueryData(['moods', uid], merged);
          }
        });
      }

      // 3. Re-read local cache (fast — AsyncStorage, never blocks)
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['moods', uid] }),
        queryClient.refetchQueries({ queryKey: ['journey'] }),
      ]);
    } catch (error) {
      console.error('[HomeScreen] Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [uid, queryClient, processQueue]);

  const handleNotificationPress = useCallback(() => {
    console.log('[HomeScreen] Navigate to notification center');
  }, []);

  const handleCardPress = useCallback(() => {
    console.log('[HomeScreen] Mood snapshot card tapped');
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
      <StatusBar style="light" />

      <ScrollView
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
        <View>
          {/* Sync Status Banner */}
          {pendingQueue.length > 0 && (
            <View style={[styles.syncBanner, { backgroundColor: colors.surface.secondary, borderColor: colors.border.default }]}>
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
                    ? `Offline. ${pendingQueue.length} ${pendingQueue.length === 1 ? 'change' : 'changes'} pending.`
                    : lastError
                    ? 'Sync failed. Tap to retry.'
                    : `${pendingQueue.length} ${pendingQueue.length === 1 ? 'update' : 'updates'} pending.`}
                </Text>
              </View>
              {isOnline && !isSyncing && (
                <Text style={[styles.retryButton, { color: colors.brand.primary }]} onPress={() => void processQueue(queryClient)}>
                  Sync Now
                </Text>
              )}
            </View>
          )}

          <HomeHeader
            onNotificationPress={handleNotificationPress}
          />

          <View style={styles.sectionSpacing}>
            <MoodSnapshotCard
              mood={todayMood}
              onPress={handleCardPress}
            />
          </View>

          {!todayMood && (
            <View style={styles.sectionSpacing}>
              <CheckInCard onCheckIn={handleCheckIn} />
            </View>
          )}

          {showSelector && !todayMood && (
            <View style={styles.sectionSpacing}>
              <SectionHeader title="How are you feeling today?" />
              <MoodSelector
                selectedMood={selectedMood}
                onSelectMood={handleSelectMood}
              />
              {selectedMood !== null && (
                <View style={[styles.submitContainer, { backgroundColor: colors.surface.secondary, borderColor: colors.border.default }]}>
                  <Text style={[styles.submitText, { color: colors.text.secondary }]}>
                    You selected: {MOOD_MAP[selectedMood].emoji} {MOOD_MAP[selectedMood].label} — ready to check in?
                  </Text>
                  
                  {/* Reflection input text block */}
                  <ReflectionInput
                    value={reflection}
                    onChangeText={setReflection}
                  />

                  <View style={styles.submitRow}>
                    <Text
                      style={[styles.submitButton, { backgroundColor: colors.brand.primary, color: colors.brand.contrastText }]}
                      onPress={handleSubmitMood}
                    >
                      {saveMoodMutation.isPending ? 'Saving...' : 'Save check-in'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {isSuccess && (
            <View style={[styles.successCard, { backgroundColor: `${colors.success}1A`, borderColor: `${colors.success}33` }]}>
              <Text style={[styles.successText, { color: colors.success }]}>✓ Checked in! Great start to your day.</Text>
            </View>
          )}
        </View>

        <View style={styles.sectionSpacing}>
          <WeeklyHistoryCard
            moodEntries={moodEntries}
            onCheckIn={handleCheckIn}
          />
        </View>

        <View style={styles.sectionSpacing}>
          <SectionHeader title="Continue Your Journey" />
          {journeyLoading ? (
            <JourneyLoadingState />
          ) : journeyError ? (
            <JourneyErrorState onRetry={refresh} />
          ) : !journey ? (
            <EmptyJourneyState onStart={() => router.push(ROUTES.TABS.JOURNEY)} />
          ) : (
            <ContinueJourneyCard
              title={journey.title}
              currentStep={journey.currentLesson}
              totalSteps={journey.totalLessons}
              percent={journey.completionPercent}
              onContinue={() => resumeJourney(journey)}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0B12',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 110,
    paddingHorizontal: spacing.xl,
  },
  sectionSpacing: {
    marginTop: 20,
  },
  submitContainer: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  submitText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 10,
    textAlign: 'center',
  },
  submitRow: {
    alignItems: 'center',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#6C4CF1',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  successCard: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
    marginTop: 12,
  },
  successText: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '500',
    textAlign: 'center',
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(26, 20, 40, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    marginBottom: 5,
  },
  syncBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  syncBannerText: {
    color: '#E9D5FF',
    fontSize: 13,
    fontWeight: '500',
  },
  retryButton: {
    color: '#A78BFA',
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});

export default HomeScreen;
