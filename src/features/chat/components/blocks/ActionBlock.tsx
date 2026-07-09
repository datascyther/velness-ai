/**
 * ActionBlock
 *
 * 🌱 Small step — Green accent
 *
 * Used when Velness suggests a small, actionable step the user can take.
 * Has a primary CTA button to acknowledge or "start" the action.
 */

import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { chat, chatTypography, spacing, borderRadius as radius } from '@/core/theme/tokens';

interface ActionBlockProps {
  label?: string;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const ACCENT = chat.blocks.action; // #34D399

export const ActionBlock = React.memo(function ActionBlock({
  label = 'Small step',
  title,
  body,
  actionLabel = 'Start',
  onAction,
}: ActionBlockProps) {
  const { colors } = useTheme();
  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const handlePress = useCallback(() => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    btnScale.value = withSpring(0.94, { damping: 10, stiffness: 300 }, () => {
      btnScale.value = withSpring(1, { damping: 12, stiffness: 250 });
    });
    onAction?.();
  }, [onAction]);

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
          <Text style={styles.chipEmoji}>🌱</Text>
          <Text style={[styles.chipLabel, { color: ACCENT }]}>{label}</Text>
        </View>

        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>

        {body ? (
          <Text style={[styles.body, { color: colors.text.secondary }]}>{body}</Text>
        ) : null}

        {/* CTA button */}
        <Animated.View style={[styles.btnWrapper, btnStyle]}>
          <Pressable
            onPress={handlePress}
            style={[styles.btn, { backgroundColor: ACCENT }]}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            <Text style={styles.btnText}>{actionLabel}</Text>
          </Pressable>
        </Animated.View>
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
    marginBottom: spacing.md,
  },
  btnWrapper: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  btn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  btnText: {
    color: '#0A1A12',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default ActionBlock;
