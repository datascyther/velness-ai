import React, { useEffect, useRef, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Check, TrendingUp, Trophy, ArrowRight, BarChart3, Star, Sparkles, BookOpen, ChevronRight, Award } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useJourney } from '@/shared/hooks/useJourney';
import { spacing, borderRadius } from '@/core/theme';
import { ROUTES, buildRoute } from '@/core/config/routes';
import { DEFAULT_LESSONS } from '@/features/journey/data/programs';

export function CompletionScreen() {
  const { colors } = useTheme();
  const { programId, lessonId } = useLocalSearchParams<{ programId?: string; lessonId?: string }>();
  const { programs, userProgress, streak, weeklyProgress, exercisesCompleted } = useJourney();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const [reflection, setReflection] = useState('');
  const [rating, setRating] = useState<number | null>(null);

  useEffect(() => {
    // Play completion success haptic on load
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.1, damping: 6, stiffness: 90, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1.0, damping: 10, stiffness: 100, useNativeDriver: true }),
    ]).start(() => {
      // Loop pulse scale animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1.0, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    });

    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [scaleAnim, fadeAnim]);

  // Find the completed program and lesson
  const currentProgram = useMemo(() => {
    return programs.find(p => p.id === programId);
  }, [programs, programId]);

  const currentLesson = useMemo(() => {
    return DEFAULT_LESSONS.find(l => l.id === lessonId);
  }, [lessonId]);

  // Dynamic achievement determination
  const achievementUnlocked = useMemo(() => {
    if (streak >= 3) {
      return {
        title: '3-Day Streak!',
        description: 'You\'ve completed exercises 3 days in a row.',
        icon: 'streak'
      };
    }
    if (exercisesCompleted === 1) {
      return {
        title: 'First Step taken!',
        description: 'Congratulations on completing your first exercise!',
        icon: 'trophy'
      };
    }
    if (currentProgram && userProgress?.programProgress[currentProgram.id]?.completionPercent === 100) {
      return {
        title: 'Program Mastered!',
        description: `You completed all lessons in ${currentProgram.title}!`,
        icon: 'star'
      };
    }
    return null;
  }, [streak, exercisesCompleted, currentProgram, userProgress]);

  // Calculate next recommendation (Answers "What should I do next?")
  const nextRecommendation = useMemo(() => {
    if (!currentProgram || !currentLesson) {
      return {
        title: 'Explore Journey Dashboard',
        description: 'Select your next practice catalog from the dashboard.',
        route: ROUTES.JOURNEY.HOME,
        label: 'Go to Journey',
      };
    }

    // 1. Next lesson in the same program
    const programLessons = DEFAULT_LESSONS.filter(l => l.programId === programId).sort((a, b) => a.order - b.order);
    const nextLesson = programLessons.find(l => l.order === currentLesson.order + 1);

    if (nextLesson) {
      return {
        title: `Lesson ${nextLesson.order}: ${nextLesson.title}`,
        description: nextLesson.description || 'Take the next step in this program.',
        route: buildRoute(ROUTES.JOURNEY.LESSON, { programId: programId!, lessonId: nextLesson.id }),
        label: 'Start Next Lesson',
      };
    }

    // 2. Next program in the same category
    const categoryPrograms = programs.filter(p => p.categoryId === currentProgram.categoryId && p.id !== programId);
    const nextProgram = categoryPrograms.find(p => {
      const progProg = userProgress?.programProgress[p.id];
      return !progProg || progProg.completionPercent < 100;
    }) || categoryPrograms[0];

    if (nextProgram) {
      return {
        title: `New Program: ${nextProgram.title}`,
        description: nextProgram.description,
        route: buildRoute(ROUTES.JOURNEY.PROGRAM, { programId: nextProgram.id }),
        label: 'Start Program',
      };
    }

    // 3. Fallback
    return {
      title: 'Explore Practice Catalogs',
      description: 'Continue building habits in CBT, Breathing, or Meditation.',
      route: ROUTES.JOURNEY.HOME,
      label: 'Explore Catalog',
    };
  }, [currentProgram, currentLesson, programs, programId, userProgress]);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.replace(nextRecommendation.route as any);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Animated Checkmark */}
        <View style={styles.headerSection}>
          <Animated.View style={[styles.checkmarkCircle, { backgroundColor: colors.success, transform: [{ scale: scaleAnim }] }]}>
            <Check size={44} color="#FFF" strokeWidth={3} />
          </Animated.View>
          <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
            <Text style={[styles.title, { color: colors.text.primary }]}>Lesson Complete!</Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              {currentLesson?.title || 'Great work! You are building consistency.'}
            </Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.contentBody, { opacity: fadeAnim }]}>
          
          {/* 1. Progress Update */}
          <Text style={[styles.sectionHeading, { color: colors.text.primary }]} accessibilityRole="header">Your Progress</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]} accessible={true} accessibilityLabel={`Current streak: ${streak} days`}>
              <Trophy size={18} color={colors.brand.primary} />
              <Text style={[styles.statValue, { color: colors.text.primary }]}>{streak}</Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Day Streak</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]} accessible={true} accessibilityLabel={`Total completed exercises: ${exercisesCompleted}`}>
              <TrendingUp size={18} color={colors.success} />
              <Text style={[styles.statValue, { color: colors.text.primary }]}>{exercisesCompleted}</Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Exercises</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]} accessible={true} accessibilityLabel={`Weekly active days: ${weeklyProgress}`}>
              <BarChart3 size={18} color={colors.warning} />
              <Text style={[styles.statValue, { color: colors.text.primary }]}>{weeklyProgress}</Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Active Days</Text>
            </View>
          </View>

          {/* Program Progress Completion Indicator */}
          {currentProgram && (
            <View style={[styles.programProgressCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]} accessible={true} accessibilityLabel={`${currentProgram.title} completion progress: ${userProgress?.programProgress[currentProgram.id]?.completionPercent ?? 0} percent`}>
              <Text style={[styles.programTag, { color: colors.brand.primary }]}>{currentProgram.title.toUpperCase()}</Text>
              <View style={styles.progressPercentRow}>
                <Text style={[styles.programProgressText, { color: colors.text.secondary }]}>Program Completion</Text>
                <Text style={[styles.programProgressVal, { color: colors.text.primary }]}>
                  {userProgress?.programProgress[currentProgram.id]?.completionPercent ?? 0}%
                </Text>
              </View>
              <View style={styles.progressBarWrapper}>
                <View style={[styles.progressBarFilled, { 
                  backgroundColor: colors.brand.primary, 
                  width: `${userProgress?.programProgress[currentProgram.id]?.completionPercent ?? 0}%` 
                }]} />
              </View>
            </View>
          )}

          {/* 2. Achievement Unlocked (If Applicable) */}
          {achievementUnlocked && (
            <View style={[styles.achievementCard, { backgroundColor: `${colors.warning}10`, borderColor: `${colors.warning}25` }]} accessible={true} accessibilityLabel={`Achievement unlocked: ${achievementUnlocked.title}. ${achievementUnlocked.description}`}>
              <Award size={24} color={colors.warning} />
              <View style={styles.achievementInfo}>
                <Text style={[styles.achievementTitle, { color: colors.text.primary }]}>{achievementUnlocked.title}</Text>
                <Text style={[styles.achievementDesc, { color: colors.text.secondary }]}>{achievementUnlocked.description}</Text>
              </View>
            </View>
          )}

          {/* 3. Reflection Section */}
          <Text style={[styles.sectionHeading, { color: colors.text.primary }]} accessibilityRole="header">Lesson Reflection</Text>
          <View style={[styles.reflectionCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]}>
            <Text style={[styles.reflectionPrompt, { color: colors.text.primary }]}>
              {currentLesson?.reflectionPrompt || 'How do you want to apply what you learned today in your life?'}
            </Text>
            <TextInput
              style={[styles.reflectionInput, { backgroundColor: colors.surface.secondary, color: colors.text.primary, borderColor: colors.border.default }]}
              placeholder="Reflect briefly on your session..."
              placeholderTextColor={colors.text.secondary}
              value={reflection}
              onChangeText={setReflection}
              multiline
              textAlignVertical="top"
              accessibilityLabel="Brief lesson reflection notes input"
              accessibilityHint="Type your main takeaway or reflection here"
            />
            <View style={styles.ratingRow} accessible={true} accessibilityLabel={`Lesson feedback rating. Current choice: ${rating ? `${rating} out of 5 stars` : 'None yet'}`}>
              <Text style={[styles.ratingLabel, { color: colors.text.secondary }]}>How helpful was this lesson?</Text>
              <View style={styles.starsGroup}>
                {[1, 2, 3, 4, 5].map((val) => (
                  <Pressable 
                    key={val} 
                    onPress={() => {
                      setRating(val);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${val} out of 5 stars`}
                    accessibilityState={{ selected: rating === val }}
                    accessibilityHint={`Rate the lesson as ${val} stars helpful`}
                  >
                    <Star 
                      size={22} 
                      color={rating && val <= rating ? colors.warning : colors.border.default} 
                      fill={rating && val <= rating ? colors.warning : 'transparent'} 
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* 4. Next Recommendation ("What should I do next?") */}
          <Text style={[styles.sectionHeading, { color: colors.text.primary }]} accessibilityRole="header">What should I do next?</Text>
          <View style={[styles.recommendationCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]} accessible={true}>
            <View style={styles.recHeader}>
              <Sparkles size={18} color={colors.brand.primary} />
              <Text style={[styles.recTag, { color: colors.brand.primary }]}>RECOMMENDED STEP</Text>
            </View>
            <Text style={[styles.recTitle, { color: colors.text.primary }]}>{nextRecommendation.title}</Text>
            <Text style={[styles.recDesc, { color: colors.text.secondary }]}>{nextRecommendation.description}</Text>
            
            <Pressable 
              style={[styles.primaryButton, { backgroundColor: colors.brand.primary, marginTop: spacing.md }]}
              onPress={handleContinue}
              accessibilityRole="button"
              accessibilityLabel={nextRecommendation.label}
              accessibilityHint={nextRecommendation.description}
            >
              <Text style={[styles.primaryButtonText, { color: colors.brand.contrastText }]}>{nextRecommendation.label}</Text>
              <ArrowRight size={18} color={colors.brand.contrastText} />
            </Pressable>
          </View>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: spacing['5xl'], paddingHorizontal: spacing.xl },
  headerSection: { alignItems: 'center', paddingVertical: spacing.xl },
  checkmarkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: spacing.xl },
  contentBody: { gap: spacing.lg, marginTop: spacing.sm },
  sectionHeading: { fontSize: 16, fontWeight: '700', letterSpacing: -0.1, marginTop: spacing.sm },
  
  // Stats
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingVertical: spacing.md,
    gap: 4,
  },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 11, fontWeight: '500' },

  // Program progress card
  programProgressCard: { borderRadius: borderRadius.lg, borderWidth: 1, padding: spacing.lg, gap: spacing.xs },
  programTag: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  progressPercentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  programProgressText: { fontSize: 12 },
  programProgressVal: { fontSize: 13, fontWeight: '700' },
  progressBarWrapper: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginTop: 4 },
  progressBarFilled: { height: 6 },

  // Achievements
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  achievementInfo: { flex: 1, gap: 2 },
  achievementTitle: { fontSize: 14, fontWeight: '700' },
  achievementDesc: { fontSize: 12 },

  // Reflection Card
  reflectionCard: { borderRadius: borderRadius.lg, borderWidth: 1, padding: spacing.lg, gap: spacing.sm },
  reflectionPrompt: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  reflectionInput: { borderRadius: borderRadius.md, borderWidth: 1, height: 90, padding: spacing.md, fontSize: 13, lineHeight: 18 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  ratingLabel: { fontSize: 12 },
  starsGroup: { flexDirection: 'row', gap: 4 },

  // Recommendations
  recommendationCard: { borderRadius: borderRadius.lg, borderWidth: 1, padding: spacing.lg, gap: spacing.xs },
  recHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 2 },
  recTag: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  recTitle: { fontSize: 15, fontWeight: '600' },
  recDesc: { fontSize: 13, lineHeight: 18 },
  
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  primaryButtonText: { fontSize: 15, fontWeight: '600' },
});

export default CompletionScreen;
