import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle, Star } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/core/theme';
import { ROUTES } from '@/core/config/routes';

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
      onPress={() => onSelect(value)}
      accessibilityRole="button"
      accessibilityLabel={`Mood ${value}`}
    >
      <Star size={24} color={selected !== null && value <= selected ? color : 'rgba(255,255,255,0.2)'} fill={selected !== null && value <= selected ? color : 'transparent'} />
    </Pressable>
  );
}

export function SessionSummaryScreen() {
  const { colors } = useTheme();
  const { title, duration, type } = useLocalSearchParams<{ title: string; duration: string; type: string }>();
  const [mood, setMood] = useState<number | null>(null);

  const encouragement = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
      <View style={styles.container}>
        <View style={[styles.iconCircle, { backgroundColor: colors.success }]}>
          <CheckCircle size={48} color="#FFF" />
        </View>

        <Text style={[styles.title, { color: colors.text.primary }]}>Exercise Complete!</Text>
        <Text style={[styles.exerciseName, { color: colors.brand.primary }]}>
          {title ? decodeURIComponent(title) : 'Exercise'}
        </Text>
        <Text style={[styles.durationText, { color: colors.text.secondary }]}>
          {duration || 0} min · {type || 'exercise'}
        </Text>

        <View style={[styles.encouragementCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]}>
          <Text style={[styles.encouragementText, { color: colors.text.primary }]}>{encouragement}</Text>
        </View>

        <Text style={[styles.moodLabel, { color: colors.text.secondary }]}>How do you feel after this exercise?</Text>
        <View style={styles.moodRow}>
          {[1, 2, 3, 4, 5].map((v) => (
            <MoodButton key={v} value={v} selected={mood} onSelect={setMood} color={colors.brand.primary} />
          ))}
        </View>
        {mood !== null && (
          <Text style={[styles.moodText, { color: colors.text.secondary }]}>
            {mood <= 2 ? 'Take it easy. Tomorrow is a new day.' : mood === 3 ? 'Right in the middle. Steady progress!' : 'Feeling great! Keep that momentum!'}
          </Text>
        )}

        <Pressable
          style={[styles.continueButton, { backgroundColor: colors.brand.primary }]}
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Text style={[styles.continueText, { color: colors.brand.contrastText }]}>Continue</Text>
        </Pressable>
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
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  durationText: {
    fontSize: 13,
    marginBottom: spacing['2xl'],
    textTransform: 'capitalize',
  },
  encouragementCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
    width: '100%',
  },
  encouragementText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  moodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  moodButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  moodText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    paddingHorizontal: spacing.xl,
  },
  continueButton: {
    width: '100%',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SessionSummaryScreen;
