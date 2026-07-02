import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius as radius } from '@/core/theme/tokens';

interface BreathingExerciseCardProps {
  title?: string;
  content?: string;
  actionLabel?: string;
}

function parseBreathingContent(content: string) {
  const lines = content.split('\n').filter(Boolean);
  const title = lines[0] || undefined;
  let duration: string | undefined;
  let pattern: string | undefined;

  for (const line of lines) {
    if (line.startsWith('Duration:')) {
      duration = line.replace(/^Duration:\s*/i, '');
    } else if (line.startsWith('Pattern:')) {
      pattern = line.replace(/^Pattern:\s*/i, '');
    }
  }

  return { title, duration, pattern };
}

export const BreathingExerciseCard = React.memo(function BreathingExerciseCard({ title: propTitle, content, actionLabel = 'Begin Exercise' }: BreathingExerciseCardProps) {
  const { colors } = useTheme();
  const parsed = content ? parseBreathingContent(content) : { title: undefined, duration: undefined, pattern: undefined };
  const title = propTitle || parsed.title || 'Breathing Exercise';
  const [started, setStarted] = React.useState(false);

  const scale = useSharedValue(1);

  useEffect(() => {
    if (started) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.3, { duration: 1000 }),
          withTiming(1.0, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 1000 }),
        ),
        -1,
        false,
      );
    } else {
      scale.value = withTiming(1, { duration: 300 });
    }
  }, [started]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.card, { backgroundColor: colors.surface.secondary, borderColor: colors.border.default }]}>
      <View style={styles.header}>
        <Animated.View style={[styles.iconCircle, animatedStyle, { borderColor: colors.brand.primary }]}>
          <View style={[styles.iconInner, { backgroundColor: colors.brand.primary }]} />
        </Animated.View>
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
      </View>
      {parsed.duration ? (
        <Text style={[styles.info, { color: colors.text.secondary }]}>Duration: {parsed.duration}</Text>
      ) : null}
      {parsed.pattern ? (
        <Text style={[styles.info, { color: colors.text.secondary }]}>Pattern: {parsed.pattern}</Text>
      ) : null}
      {!parsed.duration && !parsed.pattern && content ? (
        <Text style={[styles.description, { color: colors.text.secondary }]}>{content}</Text>
      ) : null}
      {started ? (
        <Text style={[styles.instruction, { color: colors.brand.primary }]}>
          Breathe with the circle — in, hold, out, pause
        </Text>
      ) : null}
      <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
      <Pressable
        onPress={() => {
          try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
          setStarted(true);
        }}
        disabled={started}
        style={({ pressed }) => [
          styles.actionButton,
          {
            backgroundColor: started
              ? colors.border.default
              : pressed
                ? colors.brand.secondary
                : colors.brand.primary,
          },
        ]}
      >
        <Text style={[styles.actionLabel, { color: started ? colors.text.secondary : colors.brand.contrastText }]}>
          {started ? 'In Progress...' : actionLabel}
        </Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  info: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  instruction: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  divider: {
    height: 1,
    marginBottom: spacing.md,
  },
  actionButton: {
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BreathingExerciseCard;
