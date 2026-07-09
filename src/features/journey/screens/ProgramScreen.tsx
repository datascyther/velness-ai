import React, { useMemo, useCallback } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CheckCircle, Circle, Lock, Play, Star } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useJourney } from '@/shared/hooks/useJourney';
import { useJourneyStore } from '@/features/journey/store/useJourneyStore';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { SkeletonLoader } from '@/shared/components/SkeletonLoader';
import { ROUTES, buildRoute } from '@/core/config/routes';
import { spacing, borderRadius } from '@/core/theme';
import { DIFFICULTY, PROGRAM_STATUS } from '@/features/journey/constants';
import { DEFAULT_LESSONS } from '@/features/journey/data/programs';
import type { Program } from '@/features/journey/models';

type LessonStatus = 'locked' | 'available' | 'completed';

function ProgramSkeleton() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
      <View style={styles.header}>
        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <SkeletonLoader width="40%" height={18} borderRadius={4} />
        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.programHero}>
          <SkeletonLoader width="70%" height={26} borderRadius={6} className="mb-3" />
          <SkeletonLoader width="100%" height={14} borderRadius={4} className="mb-2" />
          <SkeletonLoader width="90%" height={14} borderRadius={4} className="mb-4" />
          <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg, alignItems: 'center' }}>
            <SkeletonLoader width={80} height={18} borderRadius={4} />
            <SkeletonLoader width={100} height={12} borderRadius={4} />
          </View>
          <View style={styles.progressSection}>
            <SkeletonLoader width="100%" height={6} borderRadius={3} />
            <SkeletonLoader width={60} height={10} borderRadius={3} />
          </View>
        </View>

        <SkeletonLoader width={100} height={20} borderRadius={4} className="mt-8 mb-4" />

        <SkeletonLoader width="100%" height={54} borderRadius={10} className="mb-6" />

        <View style={styles.lessonsList}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={[styles.lessonCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default, opacity: 0.5 }]}>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.05)' }} />
              <View style={styles.lessonInfo}>
                <SkeletonLoader width="60%" height={15} borderRadius={4} className="mb-2" />
                <SkeletonLoader width="30%" height={11} borderRadius={3} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ProgramScreen() {
  const { colors } = useTheme();
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const { programs, userProgress, isLoading, toggleFavorite } = useJourney();
  const setCurrentProgram = useJourneyStore((s) => s.setCurrentProgram);
  const setCurrentLesson = useJourneyStore((s) => s.setCurrentLesson);

  const isFavorite = useMemo(() => {
    return userProgress?.favorites?.includes(programId || '') ?? false;
  }, [userProgress, programId]);

  const program = useMemo(() => programs.find(p => p.id === programId), [programs, programId]);

  const lessons = useMemo(() => {
    const programLessons = DEFAULT_LESSONS.filter(l => l.programId === programId).sort((a, b) => a.order - b.order);
    const completedIds = userProgress?.programProgress[programId || '']?.completedLessonIds || [];
    let foundIncomplete = false;
    return programLessons.map(lesson => {
      const isCompleted = completedIds.includes(lesson.id);
      let status: LessonStatus;
      if (isCompleted) {
        status = 'completed';
      } else if (!foundIncomplete) {
        foundIncomplete = true;
        status = 'available';
      } else {
        status = 'locked';
      }
      return { ...lesson, status };
    });
  }, [programId, userProgress]);

  const firstAvailable = useMemo(() => lessons.find(l => l.status === 'available'), [lessons]);

  const percent = useMemo(() => {
    if (!userProgress?.programProgress[programId || '']) return 0;
    return userProgress.programProgress[programId || '']?.completionPercent ?? 0;
  }, [userProgress, programId]);

  const handleLessonPress = useCallback((lessonId: string) => {
    setCurrentProgram(programId || null);
    setCurrentLesson(lessonId);
    router.push(buildRoute(ROUTES.JOURNEY.LESSON, { programId: programId || '', lessonId }) as any);
  }, [programId, setCurrentProgram, setCurrentLesson]);

  const handleContinue = useCallback(() => {
    if (firstAvailable) {
      handleLessonPress(firstAvailable.id);
    }
  }, [firstAvailable, handleLessonPress]);

  const difficultyColor = useMemo(() => {
    if (!program) return colors.text.secondary;
    switch (program.difficulty) {
      case DIFFICULTY.BEGINNER: return colors.success;
      case DIFFICULTY.INTERMEDIATE: return colors.warning;
      case DIFFICULTY.ADVANCED: return colors.danger;
      default: return colors.text.secondary;
    }
  }, [program, colors]);

  if (isLoading) {
    return <ProgramSkeleton />;
  }

  if (!program) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
            <ArrowLeft size={24} color={colors.text.primary} />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text.secondary }]}>Program not found.</Text>
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
        <Text style={[styles.headerTitle, { color: colors.text.primary }]} numberOfLines={1}>{program.title}</Text>
        <Pressable
          onPress={() => toggleFavorite(programId || '')}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star
            size={22}
            color={isFavorite ? '#F59E0B' : colors.text.primary}
            fill={isFavorite ? '#F59E0B' : 'transparent'}
          />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.programHero}>
          <Text style={[styles.programTitle, { color: colors.text.primary }]}>{program.title}</Text>
          <Text style={[styles.programDescription, { color: colors.text.secondary }]}>{program.description}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.difficultyBadge, { backgroundColor: `${difficultyColor}20` }]}>
              <Text style={[styles.difficultyText, { color: difficultyColor }]}>{program.difficulty}</Text>
            </View>
            <Text style={[styles.metaText, { color: colors.text.secondary }]}>{program.duration} min · {program.lessonCount} lessons</Text>
          </View>
          <View style={styles.progressSection}>
            <ProgressBar percent={percent} height={6} color={colors.brand.primary} trackColor={colors.border.default} />
            <Text style={[styles.progressPercent, { color: colors.text.secondary }]}>{percent}% complete</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Lessons</Text>

        {firstAvailable && firstAvailable.status === 'available' && (
          <Pressable
            style={[styles.continueButton, { backgroundColor: colors.brand.primary }]}
            onPress={handleContinue}
            accessibilityRole="button"
            accessibilityLabel="Continue lesson"
          >
            <Play size={18} color={colors.brand.contrastText} fill={colors.brand.contrastText} />
            <Text style={[styles.continueText, { color: colors.brand.contrastText }]}>
              Continue: {firstAvailable.title}
            </Text>
          </Pressable>
        )}

        <View style={styles.lessonsList}>
          {lessons.map((lesson) => (
            <Pressable
              key={lesson.id}
              style={[styles.lessonCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default, opacity: lesson.status === 'locked' ? 0.5 : 1 }]}
              onPress={() => lesson.status !== 'locked' && handleLessonPress(lesson.id)}
              disabled={lesson.status === 'locked'}
              accessibilityRole="button"
            >
              {lesson.status === 'completed' ? (
                <CheckCircle size={22} color={colors.success} />
              ) : lesson.status === 'available' ? (
                <Circle size={22} color={colors.brand.primary} />
              ) : (
                <Lock size={22} color={colors.text.secondary} />
              )}
              <View style={styles.lessonInfo}>
                <Text style={[styles.lessonTitle, { color: colors.text.primary }]}>
                  Lesson {lesson.order}: {lesson.title}
                </Text>
                <Text style={[styles.lessonMeta, { color: colors.text.secondary }]}>
                  {lesson.duration} min · {lesson.exerciseIds.length} exercises
                </Text>
              </View>
            </Pressable>
          ))}
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
  programHero: { paddingVertical: spacing.xl },
  programTitle: { fontSize: 24, fontWeight: '700', marginBottom: spacing.sm },
  programDescription: { fontSize: 14, lineHeight: 20, marginBottom: spacing.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  difficultyBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.sm },
  difficultyText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  metaText: { fontSize: 13 },
  progressSection: { gap: spacing.xs },
  progressPercent: { fontSize: 12, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: spacing['2xl'], marginBottom: spacing.md },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  continueText: { fontSize: 15, fontWeight: '600' },
  lessonsList: { gap: spacing.sm },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 15, fontWeight: '600' },
  lessonMeta: { fontSize: 12, marginTop: 2 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 15 },
});

export default ProgramScreen;
