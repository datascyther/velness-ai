/**
 * JourneyScreen — Guided Progression System
 *
 * This is NOT a content library.
 * This is a guided progression system.
 * Think less like Netflix. Think more like Duolingo.
 *
 * Information Hierarchy (strict priority order):
 *  1. Header — Identity + streak
 *  2. JourneyHero — Motivation + stats
 *  3. Continue Current Journey — Primary action
 *  4. Explore Practices — Secondary discovery
 *  5. Recommended Activities — Personalised suggestion
 *  6. Your Progress — Weekly accountability
 *
 * Every section has a reason to exist.
 */

import React, { useMemo, useCallback, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { Brain, Wind, Sparkles, Leaf } from 'lucide-react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/shared/hooks/useAuth';
import { useJourney } from '@/shared/hooks/useJourney';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ROUTES, buildRoute } from '@/core/config/routes';
import { spacing } from '@/core/theme';

import {
  JourneyHeader,
  JourneyHero,
  JourneySectionHeader,
  CurrentProgramCard,
  PracticeCategoryCard,
  RecommendationCard,
  AIRecommendationCard,
  WeeklyProgressTracker,
  PersonalReflectionCard,
} from '../components';
import { usePersonalization } from '@/services/ai/personalization/usePersonalization';

import type { Category } from '@/features/journey/models';
import { CATEGORY_ID } from '@/features/journey/constants';
import { DEFAULT_LESSONS } from '@/features/journey/data/programs';
import { DEFAULT_EXERCISES } from '@/features/journey/data/exercises';

// ── Practice categories data ───────────────────────────────────────────────

function getCategoryIcon(type: string, color: string) {
  const size = 24;
  switch (type) {
    case 'brain': return <Brain size={size} color={color} />;
    case 'wind': return <Wind size={size} color={color} />;
    case 'sparkles': return <Sparkles size={size} color={color} />;
    case 'leaf': return <Leaf size={size} color={color} />;
    default: return <Sparkles size={size} color={color} />;
  }
}

const categoryColors: Record<string, string> = {
  cbt: '#A78BFA',
  breathing: '#34D399',
  meditation: '#60A5FA',
  wellness: '#F472B6',
};

function getProgramCategoryIcon(categoryId: string, color: string) {
  switch (categoryId) {
    case 'cbt': return getCategoryIcon('brain', color);
    case 'breathing': return getCategoryIcon('wind', color);
    case 'meditation': return getCategoryIcon('leaf', color);
    case 'wellness': return getCategoryIcon('sparkles', color);
    default: return getCategoryIcon('sparkles', color);
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export function JourneyScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const uid = user?.uid || null;
  const [refreshing, setRefreshing] = useState(false);

  const displayName = useMemo(() => {
    const name = (user as any)?.name || (user as any)?.displayName || '';
    if (!name || name === 'User') return '';
    return name.split(' ')[0];
  }, [user]);

  const {
    journey,
    categories,
    recommendations,
    streak,
    weeklyProgress,
    exercisesCompleted,
    isLoading,
    isEmpty,
    error,
    resumeJourney,
    refresh,
    refreshRecommendation,
    startExercise,
    favorites,
    programs,
    activeGuidedProgress,
    userProgress,
  } = useJourney();

  const { data: personalization, isLoading: personalizationLoading } = usePersonalization();

  const activeProg = useMemo(() => {
    if (!journey || !programs) return null;
    return programs.find((p) => p.id === journey.programId);
  }, [journey, programs]);

  const minutesRemaining = useMemo(() => {
    if (!activeProg) return 8;
    return Math.max(Math.round(activeProg.duration * (1 - (journey?.completionPercent || 0) / 100)), 5);
  }, [activeProg, journey?.completionPercent]);

  const continueSubtitle = useMemo(() => {
    if (!journey) return undefined;
    if (activeGuidedProgress && activeGuidedProgress.status === 'in_progress') {
      const activeEx = DEFAULT_EXERCISES.find((ex) => ex.id === activeGuidedProgress.exercise_id);
      const activeLes = DEFAULT_LESSONS.find((l) => l.id === activeEx?.lessonId);
      if (activeEx && activeLes) {
        return `Lesson ${activeLes.order}, ${activeEx.title} (Step ${activeGuidedProgress.current_step + 1} of 11)`;
      }
    }
    return undefined;
  }, [journey, activeGuidedProgress]);

  const timelineData = useMemo(() => {
    if (!journey || !userProgress) return null;
    const progProg = userProgress.programProgress[journey.programId];
    if (!progProg) return null;
    
    return {
      programTitle: journey.title,
      currentLesson: progProg.currentLesson || 1,
      estimatedRemainingTime: progProg.estimatedRemainingTime ?? 8,
      completionPercentage: progProg.completionPercentage || 0,
      activeGuidedProgress: activeGuidedProgress && activeGuidedProgress.status === 'in_progress' ? activeGuidedProgress : null,
    };
  }, [journey, userProgress, activeGuidedProgress]);

  const categoryLabels: Record<string, string> = {
    cbt: 'CBT Program',
    breathing: 'Breathing Practice',
    meditation: 'Guided Meditation',
    wellness: 'Wellness Studio',
  };
  const categoryLabel = useMemo(() => {
    if (!activeProg) return 'CBT Program';
    return categoryLabels[activeProg.categoryId] || 'Wellness Program';
  }, [activeProg]);

  // ── Handlers ───────────────────────────────────────────────────────────

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } catch (error) {
      console.error('[JourneyScreen] Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const handleContinue = useCallback(() => {
    if (journey) {
      resumeJourney(journey);
    }
  }, [journey, resumeJourney]);

  const handleCategoryPress = useCallback((categoryId: string) => {
    const path = ROUTES.JOURNEY.CATEGORY.replace('[categoryId]', categoryId);
    router.push(path as any);
  }, []);

  const handleRecommendationStart = useCallback(() => {
    const rec = personalization?.todaysRecommendation;
    if (rec?.exerciseId) {
      startExercise(rec.exerciseId);
    } else if (recommendations.length > 0) {
      startExercise(recommendations[0].exerciseId);
    } else {
      startExercise('morning-breathing');
    }
  }, [personalization, recommendations, startExercise]);

  const handleViewAll = useCallback(() => {
    router.push(ROUTES.JOURNEY.LIBRARY as any);
  }, []);

  const handleRefreshRecommendation = useCallback(() => {
    refreshRecommendation();
  }, [refreshRecommendation]);

  // ── Render ─────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingSpinner />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <JourneyHeader streak={0} />
        <View style={styles.errorContainer}>
          <Text style={{ color: colors.text.secondary, textAlign: 'center' }}>
            Something went wrong loading your journey.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const weeklyProgressPercent = Math.min(Math.round((weeklyProgress / 7) * 100), 100);

  return (
    <ScreenContainer>
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
        {/* ── 1. Header ─────────────────────────────────────────── */}
        <JourneyHeader streak={streak} />

        {/* ── 2. JourneyHero ────────────────────────────────────── */}
        {!isEmpty && (
          <JourneyHero
            firstName={displayName}
            weeklyProgress={weeklyProgressPercent}
            exercisesCompleted={exercisesCompleted}
          />
        )}

        {/* ── 3. Continue Current Journey (HIGHEST PRIORITY) ──── */}
        <View style={styles.sectionSpacing}>
          <JourneySectionHeader
            title="Continue where you left off"
            actionText="View all"
            onActionPress={handleViewAll}
          />
          <View style={styles.cardPadding}>
            <CurrentProgramCard
              title={journey?.title || 'Managing Overthinking'}
              currentLesson={journey?.currentLesson || 1}
              totalLessons={journey?.totalLessons || 5}
              completionPercent={journey?.completionPercent || 0}
              minutesRemaining={minutesRemaining}
              category={categoryLabel.toUpperCase()}
              onContinue={handleContinue}
              subtitle={continueSubtitle}
            />

            {timelineData && (
              <View
                style={{
                  marginTop: spacing.md,
                  padding: spacing.lg,
                  borderRadius: 16,
                  backgroundColor: 'rgba(26, 20, 40, 0.6)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  gap: spacing.sm,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Active Timeline
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>
                    {timelineData.programTitle}
                  </Text>
                  <Text style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.5)' }}>
                    ({timelineData.completionPercentage}% complete)
                  </Text>
                </View>

                {/* Progress Visual Sequence */}
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginVertical: 4 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#A78BFA' }}>
                    Lesson {timelineData.currentLesson}
                  </Text>
                  <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.3)' }}>→</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#06B6D4' }}>
                    Exercise 1
                  </Text>
                  {timelineData.activeGuidedProgress && (
                    <>
                      <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.3)' }}>→</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#34D399' }}>
                        Step {timelineData.activeGuidedProgress.current_step + 1}
                      </Text>
                    </>
                  )}
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: 0.5 }}>
                    ESTIMATED TIME LEFT:
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#F59E0B' }}>
                    {timelineData.estimatedRemainingTime} min
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ── 4. Explore Practices ───────────────────────────── */}
        <View style={styles.sectionSpacing}>
          <JourneySectionHeader
            title="Explore practices"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((cat, idx) => (
              <View key={cat.id} style={idx < categories.length - 1 ? styles.categoryGap : undefined}>
                <PracticeCategoryCard
                  icon={getCategoryIcon(cat.iconType, cat.accentColor)}
                  title={cat.title}
                  description={cat.description}
                  countLabel={`${cat.exerciseCount} ${cat.id === CATEGORY_ID.WELLNESS ? 'Tools' : cat.id === CATEGORY_ID.CBT ? 'Lessons' : 'Sessions'}`}
                  accentColor={cat.accentColor}
                  width={140}
                  animationDelay={240 + idx * 60}
                  onPress={() => handleCategoryPress(cat.id)}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── 4b. Favorite Practices ─────────────────────────── */}
        {favorites && favorites.length > 0 && (
          <View style={styles.sectionSpacing}>
            <JourneySectionHeader
              title="Your favorite practices"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {favorites.map((favProg, idx) => {
                const accentColor = categoryColors[favProg.categoryId] || '#A78BFA';
                return (
                  <View key={favProg.id} style={idx < favorites.length - 1 ? styles.categoryGap : undefined}>
                    <PracticeCategoryCard
                      icon={getProgramCategoryIcon(favProg.categoryId, accentColor)}
                      title={favProg.title}
                      description={favProg.description}
                      countLabel={`${favProg.lessonCount} Lessons`}
                      accentColor={accentColor}
                      width={160}
                      animationDelay={100 + idx * 50}
                      onPress={() => router.push(buildRoute(ROUTES.JOURNEY.PROGRAM, { programId: favProg.id }) as any)}
                    />
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ── 5. Recommended Activities ──────────────────────── */}
        <View style={styles.sectionSpacing}>
          <JourneySectionHeader
            title="Recommended for you today"
            actionText="Refresh ↻"
            onActionPress={handleRefreshRecommendation}
          />
          <View style={styles.cardPadding}>
            {personalization?.todaysRecommendation ? (
              <AIRecommendationCard
                title={personalization.todaysRecommendation.title}
                description={personalization.todaysRecommendation.description}
                reason={personalization.todaysRecommendation.reason}
                durationMinutes={personalization.todaysRecommendation.durationMinutes}
                isAIGenerated={personalization.todaysRecommendation.source === 'ai'}
                onStart={handleRecommendationStart}
              />
            ) : recommendations.length > 0 ? (
              <RecommendationCard
                title={recommendations[0].title}
                description={recommendations[0].description}
                category={recommendations[0].reason.toUpperCase()}
                categoryColor="#F97316"
                durationMinutes={recommendations[0].durationMinutes}
                onStart={handleRecommendationStart}
              />
            ) : (
              <RecommendationCard
                title="5-Minute Breathing Space"
                description="Start your day with calm and clarity."
                category="MORNING RESET"
                categoryColor="#F97316"
                durationMinutes={5}
                onStart={handleRecommendationStart}
              />
            )}
          </View>
        </View>

        {/* ── 5b. Personal Reflection ─────────────────────── */}
        {personalization?.personalReflection && (
          <View style={styles.sectionSpacing}>
            <JourneySectionHeader
              title="A thought for you"
            />
            <View style={styles.cardPadding}>
              <PersonalReflectionCard
                prompt={personalization.personalReflection.prompt}
                context={personalization.personalReflection.context}
                onReflect={() => {
                  const path = `/chat?prompt=${encodeURIComponent(personalization.personalReflection!.prompt)}` as any;
                  router.push(path);
                }}
              />
            </View>
          </View>
        )}

        {/* ── 6. Your Progress ───────────────────────────────── */}
        <View style={styles.sectionSpacing}>
          <JourneySectionHeader
            title="Your progress"
            actionText="This week ▾"
          />
          <View style={styles.cardPadding}>
            <WeeklyProgressTracker
              activeDays={weeklyProgress}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 110,
    paddingHorizontal: spacing.xl,
  },
  sectionSpacing: {
    marginTop: spacing['2xl'],
  },

  cardPadding: {
    // Cards already have their own padding
  },
  categoriesContainer: {
    paddingRight: spacing.xl,
  },
  categoryGap: {
    marginRight: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
});

export default JourneyScreen;
