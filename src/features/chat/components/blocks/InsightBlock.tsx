/**
 * InsightBlock
 *
 * ✨ Insight — Violet accent
 *
 * Used when Velness shares a pattern or insight it noticed about the user.
 * Callout-box style with a highlighted insight quote area.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { chat, chatTypography, spacing, borderRadius as radius } from '@/core/theme/tokens';

interface InsightBlockProps {
  label?: string;
  insight: string;
  supportingText?: string;
}

const ACCENT = chat.blocks.insight; // #A78BFA

export const InsightBlock = React.memo(function InsightBlock({
  label = 'Insight',
  insight,
  supportingText,
}: InsightBlockProps) {
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
          <Text style={styles.chipEmoji}>✨</Text>
          <Text style={[styles.chipLabel, { color: ACCENT }]}>{label}</Text>
        </View>

        {/* Callout box */}
        <View
          style={[
            styles.callout,
            {
              backgroundColor: `${ACCENT}12`,
              borderColor: `${ACCENT}40`,
            },
          ]}
        >
          <Text style={[styles.insightText, { color: colors.text.primary }]}>{insight}</Text>
        </View>

        {supportingText ? (
          <Text style={[styles.supporting, { color: colors.text.secondary }]}>
            {supportingText}
          </Text>
        ) : null}
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
  callout: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  insightText: {
    fontSize: chatTypography.bodyAI.fontSize,
    lineHeight: chatTypography.bodyAI.lineHeight,
    fontWeight: '500',
  },
  supporting: {
    fontSize: chatTypography.supporting.fontSize,
    lineHeight: chatTypography.supporting.lineHeight,
  },
});

export default InsightBlock;
