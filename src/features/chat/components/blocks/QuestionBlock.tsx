/**
 * QuestionBlock
 *
 * ❓ A question — Cyan accent
 *
 * Used when Velness asks the user a therapeutic or reflective question.
 * Prominent question styling with cyan accent to signal engagement.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { chat, chatTypography, spacing, borderRadius as radius } from '@/core/theme/tokens';

interface QuestionBlockProps {
  label?: string;
  question: string;
}

const ACCENT = chat.blocks.question; // #06B6D4

export const QuestionBlock = React.memo(function QuestionBlock({
  label = 'A question',
  question,
}: QuestionBlockProps) {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(350).springify().damping(18).stiffness(180)}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface.secondary,
          borderColor: `${ACCENT}30`,
        },
      ]}
    >
      {/* Accent bar */}
      <View style={[styles.accentBar, { backgroundColor: ACCENT }]} />

      <View style={styles.content}>
        {/* Header chip */}
        <View style={styles.chip}>
          <Text style={styles.chipEmoji}>❓</Text>
          <Text style={[styles.chipLabel, { color: ACCENT }]}>{label}</Text>
        </View>

        {/* Question text — prominent */}
        <View style={[styles.questionBox, { borderColor: `${ACCENT}20`, backgroundColor: `${ACCENT}0A` }]}>
          <Text style={[styles.question, { color: colors.text.primary }]}>{question}</Text>
        </View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  accentBar: {
    width: 4,
    borderTopLeftRadius: radius.xl,
    borderBottomLeftRadius: radius.xl,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    paddingLeft: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: spacing.sm,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipLabel: {
    fontSize: chatTypography.blockLabel.fontSize,
    fontWeight: chatTypography.blockLabel.fontWeight as '600',
    letterSpacing: chatTypography.blockLabel.letterSpacing,
    textTransform: chatTypography.blockLabel.textTransform,
  },
  questionBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  question: {
    fontSize: chatTypography.bodyAI.fontSize,
    lineHeight: chatTypography.bodyAI.lineHeight,
    fontWeight: '500',
  },
});

export default QuestionBlock;
