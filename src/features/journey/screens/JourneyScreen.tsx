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
import { ROUTES } from '@/core/config/routes';
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
  } = useJourney();

  const { data: personalization, isLoading: personalizationLoading } = usePersonalization();

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
              currentLesson={journey?.currentLesson || 3}
              totalLessons={journey?.totalLessons || 8}
              completionPercent={journey?.completionPercent || 37}
              minutesRemaining={8}
              category="CBT PROGRAM"
              onContinue={handleContinue}
            />
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
