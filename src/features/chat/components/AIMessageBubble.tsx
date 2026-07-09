/**
 * AIMessageBubble
 *
 * Full-width card bubble for assistant messages.
 *
 * Phase 6 — Velness-native Interaction Layer
 *
 * Instead of generic 👍/👎/Copy, uses:
 * - Save Reflection
 * - Continue Later
 * - Share Insight
 * - Ask Follow-up
 * - Regenerate
 * - Copy (in overflow menu)
 *
 * Grouping rules (iMessage-style):
 *  - Avatar shown only on the FIRST message in a group
 *  - Timestamp shown only on the LAST message in a group
 *  - Corner radius flattened on the shared edge for non-first grouped messages
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Share } from 'react-native';
import { Brain, BookmarkPlus, Clock, Share2, MessageCircle, RefreshCw, Clipboard, MoreHorizontal } from 'lucide-react-native';
import * as ExpoClipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { BaseMessageBubble } from './BaseMessageBubble';
import { MessageContent } from './MessageContent';
import { MessageTimestamp } from './MessageTimestamp';
import { MessageActionSheet } from './MessageActionSheet';
import { getBubbleRadius, getBubbleMarginBottom } from '../styles/bubbleVariants';
import { chat, chatTypography, motion, spacing } from '@/core/theme/tokens';
import type { Message } from '../types/Message';

interface AIMessageBubbleProps {
  message: Message;
  onCopy?: (text: string) => void;
  onFeedback?: (type: 'helpful' | 'unhelpful') => void;
  onDelete?: (id: string) => void;
  onRegenerate?: () => void;
  onSaveReflection?: (messageId: string) => void;
  onContinueLater?: (messageId: string) => void;
  onShareInsight?: (messageId: string) => void;
  onAskFollowUp?: (messageId: string) => void;
  /** Is this message preceded by another assistant message? */
  isGrouped?: boolean;
  /** Is this the first in its group? (avatar shown) */
  isFirst?: boolean;
  /** Is this the last in its group? (timestamp shown) */
  isLast?: boolean;
}

function VelnessActionButton({
  onPress,
  icon,
  label,
  accessibilityLabel,
}: {
  onPress: () => void;
  icon: React.ReactNode;
  label: string;
  accessibilityLabel: string;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = useCallback(() => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    scale.value = withSpring(0.88, { damping: 10, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 12, stiffness: 250 });
    });
    onPress();
  }, [onPress]);

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={handlePress}
        style={styles.actionBtn}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Double tap to activate"
      >
        {icon}
        <Text style={styles.actionLabel}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export const AIMessageBubble = React.memo(function AIMessageBubble({
  message,
  onCopy,
  onDelete,
  onRegenerate,
  onSaveReflection,
  onContinueLater,
  onShareInsight,
  onAskFollowUp,
  isGrouped = false,
  isFirst = true,
  isLast = true,
}: AIMessageBubbleProps) {
  const { colors } = useTheme();
  const [copyOpacity, setCopyOpacity] = useState(1);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  const showAvatar = !isGrouped || isFirst;
  const showTimestamp = !isGrouped || isLast;

  const messageType = message.type;

  const handleCopy = useCallback(async () => {
    if (!message.content) return;
    try {
      await ExpoClipboard.setStringAsync(message.content);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    onCopy?.(message.content);
    setCopyOpacity(0.7);
    setTimeout(() => setCopyOpacity(1), 200);
  }, [message.content, onCopy]);

  const handleSaveReflection = useCallback(() => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    onSaveReflection?.(message.id);
  }, [message.id, onSaveReflection]);

  const handleContinueLater = useCallback(() => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    onContinueLater?.(message.id);
  }, [message.id, onContinueLater]);

  const handleShareInsight = useCallback(async () => {
    if (!message.content) return;
    try {
      await Share.share({ message: message.content, title: 'Insight from Velness' });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onShareInsight?.(message.id);
  }, [message.content, message.id, onShareInsight]);

  const handleAskFollowUp = useCallback(() => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    onAskFollowUp?.(message.id);
  }, [message.id, onAskFollowUp]);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActionSheetVisible(true);
  }, []);

  const actionSheetActions = [
    { label: 'Copy', icon: <Clipboard size={16} color={colors.text.primary} />, onPress: handleCopy },
    ...(messageType === 'reflection' || messageType === 'insight'
      ? [{ label: 'Save Reflection', icon: <BookmarkPlus size={16} color={colors.text.primary} />, onPress: handleSaveReflection }]
      : []),
    { label: 'Continue Later', icon: <Clock size={16} color={colors.text.primary} />, onPress: handleContinueLater },
    { label: 'Share Insight', icon: <Share2 size={16} color={colors.text.primary} />, onPress: handleShareInsight },
    { label: 'Ask Follow-up', icon: <MessageCircle size={16} color={colors.text.primary} />, onPress: handleAskFollowUp },
    ...(onRegenerate
      ? [{ label: 'Regenerate', icon: <RefreshCw size={16} color={colors.text.primary} />, onPress: onRegenerate }]
      : []),
    ...(onDelete
      ? [{ label: 'Delete', icon: <Clipboard size={16} color={colors.danger} />, onPress: () => onDelete(message.id), destructive: true }]
      : []),
  ];

  const radiusStyle = getBubbleRadius('assistant', { isGrouped, isFirst, isLast });
  const marginBottom = getBubbleMarginBottom(isGrouped && !isLast);

  return (
    <BaseMessageBubble
      role="assistant"
      containerStyle={[
        styles.container,
        { backgroundColor: colors.surface.secondary, marginBottom },
        radiusStyle,
      ]}
    >
      {/* Avatar + label — only shown for first in group */}
      {showAvatar && (
        <View style={styles.headerRow}>
          <View style={styles.avatarContainer}>
            <Svg width={28} height={28} style={StyleSheet.absoluteFillObject}>
              <Defs>
                <LinearGradient id="rainbowGradAB" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#8B5CF6" />
                  <Stop offset="40%" stopColor="#A78BFA" />
                  <Stop offset="75%" stopColor="#06B6D4" />
                  <Stop offset="100%" stopColor="#EF4444" />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" rx={14} fill="url(#rainbowGradAB)" />
            </Svg>
            <Brain size={14} color="#FFFFFF" strokeWidth={2} />
          </View>
          <Text style={[styles.brandLabel, { color: colors.text.primary }]}>Velness</Text>
        </View>
      )}

      <Pressable
        onLongPress={handleLongPress}
        style={{ opacity: copyOpacity }}
        accessibilityHint="Long press for more options"
      >
        <View>
          <MessageContent message={message} />
        </View>
      </Pressable>

      {/* Timestamp — only shown for last in group */}
      {showTimestamp && (
        <MessageTimestamp date={message.createdAt} style={styles.timestampBelow} />
      )}

      {/* Velness-native action buttons */}
      {message.content ? (
        <View style={styles.actionsRow}>
          {(messageType === 'reflection' || messageType === 'insight') && (
            <VelnessActionButton
              onPress={handleSaveReflection}
              icon={<BookmarkPlus size={14} color={colors.text.secondary} strokeWidth={2} />}
              label="Save"
              accessibilityLabel="Save reflection"
            />
          )}
          <VelnessActionButton
            onPress={handleContinueLater}
            icon={<Clock size={14} color={colors.text.secondary} strokeWidth={2} />}
            label="Later"
            accessibilityLabel="Continue later"
          />
          <VelnessActionButton
            onPress={handleShareInsight}
            icon={<Share2 size={14} color={colors.text.secondary} strokeWidth={2} />}
            label="Share"
            accessibilityLabel="Share insight"
          />
          <VelnessActionButton
            onPress={handleAskFollowUp}
            icon={<MessageCircle size={14} color={colors.text.secondary} strokeWidth={2} />}
            label="Follow-up"
            accessibilityLabel="Ask follow-up"
          />

          {/* More actions trigger */}
          <Pressable
            onPress={() => setActionSheetVisible(true)}
            style={({ pressed }) => [
              styles.moreBtn,
              { backgroundColor: pressed ? colors.surface.primary : 'transparent' },
            ]}
            accessibilityLabel="More actions"
            accessibilityRole="button"
          >
            <MoreHorizontal size={14} color={colors.text.secondary} strokeWidth={2} />
          </Pressable>
        </View>
      ) : null}

      <MessageActionSheet
        visible={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}
        actions={actionSheetActions}
      />
    </BaseMessageBubble>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: chat.bubble.paddingHAI,
    paddingVertical: chat.bubble.paddingVAI,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  brandLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  avatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  timestampBelow: {
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  moreBtn: {
    width: 32,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
