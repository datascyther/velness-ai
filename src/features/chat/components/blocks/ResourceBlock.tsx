/**
 * ResourceBlock
 *
 * 📚 Resource — Indigo accent
 *
 * Used when Velness shares an educational resource, article, or external link.
 * Shows a title, description, and source attribution row.
 */

import React, { useCallback } from 'react';
import { View, Text, Pressable, Linking, StyleSheet } from 'react-native';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ExternalLink } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { chat, chatTypography, spacing, borderRadius as radius } from '@/core/theme/tokens';

interface ResourceBlockProps {
  label?: string;
  title: string;
  description?: string;
  sourceName?: string;
  sourceUrl?: string;
}

const ACCENT = chat.blocks.resource; // #818CF8

export const ResourceBlock = React.memo(function ResourceBlock({
  label = 'Resource',
  title,
  description,
  sourceName,
  sourceUrl,
}: ResourceBlockProps) {
  const { colors } = useTheme();
  const linkScale = useSharedValue(1);
  const linkStyle = useAnimatedStyle(() => ({ transform: [{ scale: linkScale.value }] }));

  const handleOpenLink = useCallback(() => {
    if (!sourceUrl) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    linkScale.value = withSpring(0.96, { damping: 10, stiffness: 300 }, () => {
      linkScale.value = withSpring(1, { damping: 12, stiffness: 250 });
    });
    Linking.openURL(sourceUrl).catch(() => {});
  }, [sourceUrl]);

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
          <Text style={styles.chipEmoji}>📚</Text>
          <Text style={[styles.chipLabel, { color: ACCENT }]}>{label}</Text>
        </View>

        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>

        {description ? (
          <Text style={[styles.description, { color: colors.text.secondary }]}>{description}</Text>
        ) : null}

        {/* Source attribution */}
        {sourceName ? (
          <View style={[styles.sourceRow, { borderTopColor: `${ACCENT}20` }]}>
            <Text style={[styles.sourceLabel, { color: colors.text.secondary }]}>Source:</Text>
            {sourceUrl ? (
              <Animated.View style={linkStyle}>
                <Pressable onPress={handleOpenLink} style={styles.sourceLink}>
                  <Text style={[styles.sourceName, { color: ACCENT }]}>{sourceName}</Text>
                  <ExternalLink size={11} color={ACCENT} strokeWidth={2} />
                </Pressable>
              </Animated.View>
            ) : (
              <Text style={[styles.sourceName, { color: colors.text.primary }]}>{sourceName}</Text>
            )}
          </View>
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
  description: {
    fontSize: chatTypography.bodyAI.fontSize,
    lineHeight: chatTypography.bodyAI.lineHeight,
    marginBottom: spacing.md,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  sourceLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  sourceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  sourceName: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default ResourceBlock;
