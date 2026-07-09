/**
 * ReflectionBlock
 *
 * 💭 Reflection — Purple accent
 *
 * Used when Velness shares an empathetic observation or internal reflection
 * with the user. Styled with soft purple tones and italic body text to
 * signal a thoughtful, introspective tone.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, SlideInLeft } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { chat, chatTypography, spacing, borderRadius as radius } from '@/core/theme/tokens';

interface ReflectionBlockProps {
  title?: string;
  body?: string;
}

const ACCENT = chat.blocks.reflection; // #8B5CF6

export const ReflectionBlock = React.memo(function ReflectionBlock({
  title,
  body,
}: ReflectionBlockProps) {
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
          <Text style={styles.chipEmoji}>💭</Text>
          <Text style={[styles.chipLabel, { color: ACCENT }]}>Reflection</Text>
        </View>

        {title ? (
          <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
        ) : null}

        {body ? (
          <Text style={[styles.body, { color: colors.text.secondary }]}>{body}</Text>
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
  title: {
    fontSize: chatTypography.reflectionTitle.fontSize,
    lineHeight: chatTypography.reflectionTitle.lineHeight,
    fontWeight: chatTypography.reflectionTitle.fontWeight as '600',
    marginBottom: spacing.xs,
  },
  body: {
    fontSize: chatTypography.bodyAI.fontSize,
    lineHeight: chatTypography.bodyAI.lineHeight,
    fontStyle: 'italic',
  },
});

export default ReflectionBlock;
