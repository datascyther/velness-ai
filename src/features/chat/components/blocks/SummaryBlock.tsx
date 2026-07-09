/**
 * SummaryBlock
 *
 * 📝 Summary — Amber accent
 *
 * Used when Velness summarises a conversation or key themes. Renders
 * a bulleted list of summary points with amber accent styling.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { chat, chatTypography, spacing, borderRadius as radius } from '@/core/theme/tokens';

interface SummaryBlockProps {
  label?: string;
  title?: string;
  points: string[];
}

const ACCENT = chat.blocks.summary; // #FBBF24

export const SummaryBlock = React.memo(function SummaryBlock({
  label = 'Summary',
  title,
  points,
}: SummaryBlockProps) {
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
          <Text style={styles.chipEmoji}>📝</Text>
          <Text style={[styles.chipLabel, { color: ACCENT }]}>{label}</Text>
        </View>

        {title ? (
          <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
        ) : null}

        {/* Bulleted summary points */}
        <View style={styles.pointsList}>
          {points.map((point, idx) => (
            <View key={idx} style={styles.pointRow}>
              <View style={[styles.pointBullet, { backgroundColor: ACCENT }]} />
              <Text style={[styles.pointText, { color: colors.text.primary }]}>{point}</Text>
            </View>
          ))}
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
  title: {
    fontSize: chatTypography.reflectionTitle.fontSize,
    lineHeight: chatTypography.reflectionTitle.lineHeight,
    fontWeight: chatTypography.reflectionTitle.fontWeight as '600',
    marginBottom: spacing.sm,
  },
  pointsList: {
    gap: spacing.xs + 2,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  pointBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    flexShrink: 0,
  },
  pointText: {
    flex: 1,
    fontSize: chatTypography.listItem.fontSize,
    lineHeight: chatTypography.listItem.lineHeight,
  },
});

export default SummaryBlock;
