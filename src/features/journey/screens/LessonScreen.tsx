import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CheckCircle, Circle, Play, Timer, BookOpen } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/shared/hooks/useAuth';
import { useJourney } from '@/shared/hooks/useJourney';
import { useJourneyStore } from '@/features/journey/store/useJourneyStore';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ROUTES, buildRoute } from '@/core/config/routes';
import { spacing, borderRadius } from '@/core/theme';
import { COMPLETION_STATUS, EXERCISE_TYPE } from '@/features/journey/constants';
import { JourneyNavigationGuard } from '../services/JourneyNavigationGuard';
import { DEFAULT_LESSONS } from '@/features/journey/data/programs';
import type { ExerciseWithProgress } from '@/features/journey/models';
import { analyticsService } from '@/services/analytics';

import { useQueryClient } from '@tanstack/react-query';

function getExerciseIcon(type: string, color: string, size = 20) {
  switch (type) {
    case EXERCISE_TYPE.MEDITATION: return <Timer size={size} color={color} />;
    case EXERCISE_TYPE.BREATHING: return <BookOpen size={size} color={color} />;
    case EXERCISE_TYPE.JOURNALING: return <BookOpen size={size} color={color} />;
    case EXERCISE_TYPE.GRATITUDE: return <BookOpen size={size} color={color} />;
    default: return <Play size={size} color={color} />;
  }
}

export function LessonScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const uid = user?.uid || null;
  const { programId, lessonId } = useLocalSearchParams<{ programId: string; lessonId: string }>();
  const { exercises, completeLesson } = useJourney();
  const setCurrentLesson = useJourneyStore((s) => s.setCurrentLesson);
  const queryClient = useQueryClient();

  const lesson = useMemo(() => DEFAULT_LESSONS.find(l => l.id === lessonId), [lessonId]);

  const lessonExercises = useMemo(() => {
    return exercises
      .filter((ex: ExerciseWithProgress) => ex.lessonId === lessonId)
      .sort((a: ExerciseWithProgress, b: ExerciseWithProgress) => a.sortOrder - b.sortOrder);
  }, [exercises, lessonId]);

  const allCompleted = useMemo(() => {
    return lessonExercises.length > 0 && lessonExercises.every((ex: ExerciseWithProgress) => ex.completionStatus === COMPLETION_STATUS.COMPLETED);
  }, [lessonExercises]);

  const completedCount = useMemo(() => {
    return lessonExercises.filter((ex: ExerciseWithProgress) => ex.completionStatus === COMPLETION_STATUS.COMPLETED).length;
  }, [lessonExercises]);

  useEffect(() => {
    if (lessonId) {
      setCurrentLesson(lessonId);
    }
  }, [lessonId, setCurrentLesson]);

  const completingRef = useRef(false);

  const handleCompleteLesson = useCallback(async () => {
    if (!uid || !programId || !lessonId || completingRef.current) return;
    completingRef.current = true;
    try {
      await completeLesson(programId, lessonId);

      // Track CBT lesson completion
      const isCBT = !programId.includes('breathing') && !programId.includes('meditation') && !programId.includes('sleep');
      if (isCBT) {
        analyticsService.trackEvent('cbt_lesson_completed' as any, {
          program_id: programId,
          lesson_id: lessonId,
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['homeState'] });

      router.push(`/journey/completion?programId=${programId}&lessonId=${lessonId}` as any);
    } catch {
      completingRef.current = false;
    }
  }, [uid, programId, lessonId, completeLesson, queryClient]);

  useEffect(() => {
    if (allCompleted && uid && !completingRef.current) {
      handleCompleteLesson();
    }
  }, [allCompleted, uid, handleCompleteLesson]);

  const handleStartExercise = useCallback((exerciseId: string, type: string) => {
    if (type === EXERCISE_TYPE.JOURNALING || type === EXERCISE_TYPE.GRATITUDE) {
      router.push(`/journey/session/${exerciseId}` as any);
    } else {
      router.push(buildRoute(ROUTES.JOURNEY.EXERCISE, { exerciseId }) as any);
    }
  }, []);

  const { userProgress: fullUserProgress } = useJourney();
  const guard = useMemo(() => {
    return JourneyNavigationGuard.checkLessonAccessible(programId || '', lessonId || '', fullUserProgress);
  }, [programId, lessonId, fullUserProgress]);

  if (!lesson) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
            <ArrowLeft size={24} color={colors.text.primary} />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text.secondary }]}>Lesson not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!guard.allowed) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
            <ArrowLeft size={24} color={colors.text.primary} />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text.secondary, textAlign: 'center', paddingHorizontal: spacing.xl }]}>
            {guard.allowed === false ? guard.reason : ''}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]} numberOfLines={1}>{lesson.title}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.lessonHero}>
          <Text style={[styles.lessonTitle, { color: colors.text.primary }]}>{lesson.title}</Text>
          <Text style={[styles.lessonDescription, { color: colors.text.secondary }]}>{lesson.description}</Text>
          <View style={styles.progressSummary}>
            <Text style={[styles.progressText, { color: colors.text.secondary }]}>
              {completedCount} of {lessonExercises.length} exercises completed
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Lesson Guide</Text>

        <View style={[styles.guideCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]}>
          {lesson.learningObjective ? (
            <View style={[styles.guideItem, { borderBottomColor: colors.border.default }]}>
              <Text style={[styles.guideLabel, { color: colors.brand.primary }]}>Learning Goal</Text>
              <Text style={[styles.guideValue, { color: colors.text.secondary }]}>{lesson.learningObjective}</Text>
            </View>
          ) : null}

          <View style={[styles.guideItem, { borderBottomColor: colors.border.default }]}>
            <Text style={[styles.guideLabel, { color: colors.brand.primary }]}>Estimated Time</Text>
            <Text style={[styles.guideValue, { color: colors.text.secondary }]}>{lesson.duration} min</Text>
          </View>

          {lesson.preparation ? (
            <View style={[styles.guideItem, { borderBottomColor: colors.border.default }]}>
              <Text style={[styles.guideLabel, { color: colors.brand.primary }]}>Preparation</Text>
              <Text style={[styles.guideValue, { color: colors.text.secondary }]}>{lesson.preparation}</Text>
            </View>
          ) : null}

          {lesson.introduction ? (
            <View style={[styles.guideItem, { borderBottomColor: colors.border.default }]}>
              <Text style={[styles.guideLabel, { color: colors.brand.primary }]}>Guided Exercise</Text>
              <Text style={[styles.guideValue, { color: colors.text.secondary }]}>{lesson.introduction}</Text>
            </View>
          ) : null}

          {lesson.reflectionPrompt ? (
            <View style={[styles.guideItem, { borderBottomColor: colors.border.default }]}>
              <Text style={[styles.guideLabel, { color: colors.brand.primary }]}>Reflection</Text>
              <Text style={[styles.guideValue, { color: colors.text.secondary }]}>{lesson.reflectionPrompt}</Text>
            </View>
          ) : null}

          {lesson.takeaway ? (
            <View style={[styles.guideItem, { borderBottomColor: colors.border.default }]}>
              <Text style={[styles.guideLabel, { color: colors.brand.primary }]}>Takeaway</Text>
              <Text style={[styles.guideValue, { color: colors.text.secondary }]}>{lesson.takeaway}</Text>
            </View>
          ) : null}

          {lesson.completionSummary ? (
            <View style={[styles.guideItem, styles.guideItemLast, { borderBottomColor: colors.border.default }]}>
              <Text style={[styles.guideLabel, { color: colors.brand.primary }]}>Completion</Text>
              <Text style={[styles.guideValue, { color: colors.text.secondary }]}>{lesson.completionSummary}</Text>
            </View>
          ) : null}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Exercises</Text>

        <View style={styles.exercisesList}>
          {lessonExercises.map((exercise: ExerciseWithProgress) => {
            const isCompleted = exercise.completionStatus === COMPLETION_STATUS.COMPLETED;
            return (
              <View
                key={exercise.id}
                style={[styles.exerciseCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]}
              >
                <View style={styles.exerciseIcon}>
                  {getExerciseIcon(exercise.type, isCompleted ? colors.success : colors.brand.primary, 24)}
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={[styles.exerciseTitle, { color: colors.text.primary }]}>{exercise.title}</Text>
                  <Text style={[styles.exerciseMeta, { color: colors.text.secondary }]}>
                    {exercise.type} · {exercise.estimatedTime} min
                  </Text>
                </View>
                {isCompleted ? (
                  <CheckCircle size={22} color={colors.success} />
                ) : (
                  <Pressable
                    style={[styles.startButton, { backgroundColor: colors.brand.primary }]}
                    onPress={() => handleStartExercise(exercise.id, exercise.type)}
                    accessibilityRole="button"
                    accessibilityLabel={`Start ${exercise.title}`}
                  >
                    <Play size={16} color={colors.brand.contrastText} fill={colors.brand.contrastText} />
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  backButton: { padding: spacing.xs },
  headerTitle: { fontSize: 18, fontWeight: '600', flex: 1, textAlign: 'center' },
  headerSpacer: { width: 32 },
  scrollContent: { paddingBottom: spacing['5xl'], paddingHorizontal: spacing.xl },
  lessonHero: { paddingVertical: spacing.xl },
  lessonTitle: { fontSize: 24, fontWeight: '700', marginBottom: spacing.sm },
  lessonDescription: { fontSize: 14, lineHeight: 20, marginBottom: spacing.md },
  progressSummary: { marginTop: spacing.sm },
  progressText: { fontSize: 13, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.md },
  guideCard: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  guideItem: {
    borderBottomWidth: 1,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  guideItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  guideLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  guideValue: { fontSize: 14, lineHeight: 20 },
  exercisesList: { gap: spacing.sm },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  exerciseIcon: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  exerciseInfo: { flex: 1 },
  exerciseTitle: { fontSize: 15, fontWeight: '600' },
  exerciseMeta: { fontSize: 12, marginTop: 2, textTransform: 'capitalize' },
  startButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 15 },
});

export default LessonScreen;
