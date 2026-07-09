import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CheckCircle, Star, Trophy, TrendingUp, BarChart3, Sparkles, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useJourney } from '@/shared/hooks/useJourney';
import { spacing, borderRadius } from '@/core/theme';
import { ROUTES, buildRoute } from '@/core/config/routes';
import { DEFAULT_LESSONS } from '@/features/journey/data/programs';

const ENCOURAGEMENTS = [
  'Every moment counts. Great job showing up!',
  'You\'re building a powerful habit. Keep going!',
  'Small steps lead to big changes. Well done!',
  'Your mind and body thank you for this.',
  'Progress, not perfection. You\'re doing amazing!',
];

function MoodButton({ value, selected, onSelect, color }: { value: number; selected: number | null; onSelect: (v: number) => void; color: string }) {
  return (
    <Pressable
      style={[styles.moodButton, { borderColor: selected === value ? color : 'transparent', backgroundColor: selected === value ? `${color}20` : 'transparent' }]}
      onPress={() => {
        onSelect(value);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }}
      accessibilityRole="button"
      accessibilityLabel={`${value} out of 5 stars`}
      accessibilityState={{ selected: selected === value }}
      accessibilityHint={`Rate your post-exercise mood as ${value} stars`}
    >
      <Star size={22} color={selected !== null && value <= selected ? color : 'rgba(255,255,255,0.2)'} fill={selected !== null && value <= selected ? color : 'transparent'} />
    </Pressable>
  );
}

export function SessionSummaryScreen() {
  const { colors } = useTheme();
  const { exerciseId, title, duration, type } = useLocalSearchParams<{ exerciseId?: string; title?: string; duration?: string; type?: string }>();
  const { exercises, streak, weeklyProgress, exercisesCompleted } = useJourney();
  const [mood, setMood] = useState<number | null>(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.1, damping: 6, stiffness: 90, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1.0, damping: 10, stiffness: 100, useNativeDriver: true }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1.0, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    });
  }, [scaleAnim]);

  const encouragement = useMemo(() => {
    return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
  }, []);

  const currentExercise = useMemo(() => {
    return exercises.find(ex => ex.id === exerciseId);
  }, [exercises, exerciseId]);

  // Determine next recommendation (Answers "What should I do next?")
  const nextRecommendation = useMemo(() => {
    if (!currentExercise) {
      return {
        title: 'Return to Journey Dashboard',
        description: 'Choose your next mental fitness practice.',
        route: ROUTES.JOURNEY.HOME,
        label: 'Go to Journey',
      };
    }

    const lessonId = currentExercise.lessonId;
    const lessonExercises = exercises
      .filter(ex => ex.lessonId === lessonId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    
    // Find the next uncompleted exercise in the lesson
    const nextEx = lessonExercises.find(ex => ex.sortOrder > currentExercise.sortOrder && ex.completionStatus !== 'completed');

    if (nextEx) {
      const isSession = nextEx.type === 'journaling' || nextEx.type === 'gratitude';
      return {
        title: `Next Exercise: ${nextEx.title}`,
        description: `${nextEx.type.toUpperCase()} · ${nextEx.estimatedTime} min`,
        route: isSession ? `/journey/session/${nextEx.id}` : `/journey/exercise/${nextEx.id}`,
        label: 'Start Next Exercise',
      };
    }

    // If all exercises in the lesson are complete, go back to the lesson page to finish it
    const lessonObj = DEFAULT_LESSONS.find(l => l.id === lessonId);
    if (lessonObj) {
      return {
        title: `Complete Lesson: ${lessonObj.title}`,
        description: 'Verify your reflection and claim your lesson completion badge!',
        route: buildRoute(ROUTES.JOURNEY.LESSON, { programId: lessonObj.programId, lessonId: lessonObj.id }),
        label: 'Go to Lesson Completion',
      };
    }

    return {
      title: 'Explore Journey Dashboard',
      description: 'Find more guided courses in your dashboard.',
      route: ROUTES.JOURNEY.HOME,
      label: 'Go to Journey',
    };
  }, [currentExercise, exercises]);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.replace(nextRecommendation.route as any);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Animated Check */}
        <View style={styles.headerSection} accessible={true} accessibilityLabel="Exercise completed successfully">
          <Animated.View style={[styles.iconCircle, { backgroundColor: colors.success, transform: [{ scale: scaleAnim }] }]}>
            <CheckCircle size={44} color="#FFF" />
          </Animated.View>
          <Text style={[styles.title, { color: colors.text.primary }]}>Exercise Complete!</Text>
          <Text style={[styles.exerciseName, { color: colors.brand.primary }]}>
            {title ? decodeURIComponent(title) : 'Exercise'}
          </Text>
          <Text style={[styles.durationText, { color: colors.text.secondary }]}>
            {duration || 0} min · {type || 'exercise'}
          </Text>
        </View>

        <View style={styles.contentBody}>
          
          {/* Progress Update */}
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

          {/* Encouragement Card */}
          <View style={[styles.encouragementCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]} accessible={true} accessibilityLabel="Daily encouragement">
            <Text style={[styles.encouragementText, { color: colors.text.primary }]}>{encouragement}</Text>
          </View>

          {/* Reflection: Mood Rating */}
          <Text style={[styles.sectionHeading, { color: colors.text.primary }]} accessibilityRole="header">Reflection</Text>
          <View style={[styles.reflectionCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]}>
            <Text style={[styles.moodLabel, { color: colors.text.secondary }]}>How do you feel after this exercise?</Text>
            <View style={styles.moodRow} accessible={true} accessibilityLabel={`Mood rating selector. Current choice: ${mood ? `${mood} out of 5 stars` : 'None yet'}`}>
              {[1, 2, 3, 4, 5].map((v) => (
                <MoodButton key={v} value={v} selected={mood} onSelect={setMood} color={colors.brand.primary} />
              ))}
            </View>
            {mood !== null && (
              <Text style={[styles.moodText, { color: colors.text.secondary }]}>
                {mood <= 2 ? 'Take it easy. Tomorrow is a new day.' : mood === 3 ? 'Right in the middle. Steady progress!' : 'Feeling great! Keep that momentum!'}
              </Text>
            )}
          </View>

          {/* Next Recommendation ("What should I do next?") */}
          <Text style={[styles.sectionHeading, { color: colors.text.primary }]} accessibilityRole="header">What should I do next?</Text>
          <View style={[styles.recommendationCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]} accessible={true}>
            <View style={styles.recHeader}>
              <Sparkles size={16} color={colors.brand.primary} />
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

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: spacing['5xl'], paddingHorizontal: spacing.xl },
  headerSection: { alignItems: 'center', paddingVertical: spacing.xl },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 2 },
  exerciseName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  durationText: { fontSize: 13, textTransform: 'capitalize', marginBottom: spacing.sm },
  contentBody: { gap: spacing.lg },
  sectionHeading: { fontSize: 16, fontWeight: '700', letterSpacing: -0.1 },
  
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

  // Encouragement
  encouragementCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  encouragementText: { fontSize: 14, lineHeight: 20, textAlign: 'center' },

  // Reflection
  reflectionCard: { borderRadius: borderRadius.lg, borderWidth: 1, padding: spacing.lg, alignItems: 'center' },
  moodLabel: { fontSize: 13, fontWeight: '500', marginBottom: spacing.md },
  moodRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  moodButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  moodText: { fontSize: 12, textAlign: 'center', paddingHorizontal: spacing.xl },

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

export default SessionSummaryScreen;
