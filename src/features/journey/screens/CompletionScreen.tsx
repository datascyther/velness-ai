import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Check, TrendingUp, Trophy, ArrowRight, BarChart3 } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useJourney } from '@/shared/hooks/useJourney';
import { spacing, borderRadius } from '@/core/theme';
import { ROUTES } from '@/core/config/routes';

export function CompletionScreen() {
  const { colors } = useTheme();
  const { streak, weeklyProgress, exercisesCompleted } = useJourney();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, damping: 8, stiffness: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim, fadeAnim]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
      <View style={styles.container}>
        <Animated.View style={[styles.checkmarkCircle, { backgroundColor: colors.success, transform: [{ scale: scaleAnim }] }]}>
          <Check size={48} color="#FFF" strokeWidth={3} />
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.title, { color: colors.text.primary }]}>Lesson Complete!</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Great work! You're building a powerful habit.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
          <View style={[styles.statCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]}>
            <Trophy size={20} color={colors.brand.primary} />
            <Text style={[styles.statValue, { color: colors.text.primary }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Day Streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]}>
            <TrendingUp size={20} color={colors.success} />
            <Text style={[styles.statValue, { color: colors.text.primary }]}>{exercisesCompleted}</Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Exercises</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]}>
            <BarChart3 size={20} color={colors.warning} />
            <Text style={[styles.statValue, { color: colors.text.primary }]}>{weeklyProgress}</Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>This Week</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.brand.primary }]}
            onPress={() => router.push(ROUTES.JOURNEY.HOME as any)}
            accessibilityRole="button"
            accessibilityLabel="Continue"
          >
            <Text style={[styles.primaryButtonText, { color: colors.brand.contrastText }]}>Continue</Text>
            <ArrowRight size={18} color={colors.brand.contrastText} />
          </Pressable>
          <Pressable
            style={[styles.secondaryButton, { borderColor: colors.border.default }]}
            onPress={() => router.push(ROUTES.JOURNEY.PROGRESS as any)}
            accessibilityRole="button"
            accessibilityLabel="View Progress"
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text.primary }]}>View Progress</Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  checkmarkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing['3xl'],
    paddingHorizontal: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing['3xl'],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 11, fontWeight: '500' },
  actions: {
    width: '100%',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  primaryButtonText: { fontSize: 16, fontWeight: '600' },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingVertical: spacing.md,
  },
  secondaryButtonText: { fontSize: 15, fontWeight: '500' },
});

export default CompletionScreen;
