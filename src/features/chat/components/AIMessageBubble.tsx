import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Share } from 'react-native';
import { Brain, ThumbsUp, ThumbsDown, Clipboard } from 'lucide-react-native';
import * as ExpoClipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withDelay, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { BaseMessageBubble } from './BaseMessageBubble';
import { MessageContent } from './MessageContent';
import { MessageTimestamp } from './MessageTimestamp';
import { MessageActionSheet } from './MessageActionSheet';
import { aiBubble } from '../styles/bubbleVariants';
import type { Message } from '../types/Message';
import { spacing } from '@/core/theme/tokens';

interface AIMessageBubbleProps {
  message: Message;
  onCopy?: (text: string) => void;
  onFeedback?: (type: 'helpful' | 'unhelpful') => void;
  onDelete?: (id: string) => void;
  onRegenerate?: () => void;
  isGrouped?: boolean;
}

function ActionButton({ onPress, children, accessibilityLabel }: { onPress: () => void; children: React.ReactNode; accessibilityLabel: string }) {
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
      <Pressable onPress={handlePress} style={styles.actionBtn} accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityHint="Double tap to activate">
        {children}
      </Pressable>
    </Animated.View>
  );
}

export const AIMessageBubble = React.memo(function AIMessageBubble({ message, onCopy, onFeedback, onDelete, onRegenerate, isGrouped }: AIMessageBubbleProps) {
  const { colors } = useTheme();
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [copyOpacity, setCopyOpacity] = useState(1);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  const isStreaming = message.status === 'streaming';

  const cursorOpacity = useSharedValue(0);
  const cursorStyle = useAnimatedStyle(() => ({ opacity: cursorOpacity.value }));

  const containerScale = useSharedValue(1);
  const containerStyle = useAnimatedStyle(() => ({ transform: [{ scale: containerScale.value }] }));

  useEffect(() => {
    if (isStreaming) {
      cursorOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withRepeat(
          withSequence(
            withTiming(1, { duration: 500 }),
            withTiming(0, { duration: 500 })
          ),
          -1,
          false
        )
      );
      containerScale.value = withRepeat(
        withSequence(
          withTiming(1.003, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      cursorOpacity.value = withDelay(150, withTiming(0, { duration: 150 }));
      containerScale.value = withSequence(
        withTiming(1.02, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
    }
  }, [isStreaming]);

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

  const handleThumbsUp = useCallback(() => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setFeedback((prev) => (prev === 'up' ? null : 'up'));
    onFeedback?.('helpful');
  }, [onFeedback]);

  const handleThumbsDown = useCallback(() => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setFeedback((prev) => (prev === 'down' ? null : 'down'));
    onFeedback?.('unhelpful');
  }, [onFeedback]);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActionSheetVisible(true);
  }, []);

  const handleShare = useCallback(async () => {
    if (!message.content) return;
    try {
      await Share.share({ message: message.content, title: 'Message from Neeva' });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  }, [message.content]);

  const actionSheetActions = [
    {
      label: 'Copy',
      onPress: handleCopy,
    },
    {
      label: 'Share',
      onPress: handleShare,
    },
    ...(onRegenerate ? [{ label: 'Regenerate', onPress: onRegenerate }] : []),
    ...(onDelete ? [{ label: 'Delete', onPress: () => onDelete(message.id), destructive: true }] : []),
  ];

  return (
    <BaseMessageBubble containerStyle={[aiBubble.container, { backgroundColor: colors.surface.secondary }, isGrouped && { marginBottom: spacing.xs }, containerStyle]}>
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
        <Text style={[styles.brandLabel, { color: colors.text.primary }]}>Neeva</Text>
      </View>

      <Pressable
        onLongPress={handleLongPress}
        style={{ opacity: copyOpacity }}
        accessibilityHint="Long press for more options"
      >
        <View>
          <MessageContent message={message} />
          {isStreaming && (
            <Animated.Text style={[styles.cursor, { color: colors.brand.primary }, cursorStyle]}>
              {'▊'}
            </Animated.Text>
          )}
        </View>
      </Pressable>

      <MessageTimestamp date={message.createdAt} style={styles.timestampBelow} />

      {!isStreaming && message.content ? (
        <View style={styles.actionsRow}>
          <ActionButton onPress={handleThumbsUp} accessibilityLabel="Mark as helpful">
            <ThumbsUp size={14} color={feedback === 'up' ? colors.brand.primary : colors.text.secondary} strokeWidth={2} />
          </ActionButton>
          <ActionButton onPress={handleThumbsDown} accessibilityLabel="Mark as unhelpful">
            <ThumbsDown size={14} color={feedback === 'down' ? colors.danger : colors.text.secondary} strokeWidth={2} />
          </ActionButton>
          <ActionButton onPress={handleCopy} accessibilityLabel="Copy message">
            <Clipboard size={14} color={colors.text.secondary} strokeWidth={2} />
          </ActionButton>
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
  timestampStyle: {
    marginTop: 0,
  },
  timestampBelow: {
    marginTop: 8,
  },
  cursor: {
    fontSize: 15,
    fontWeight: '300',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 6,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AIMessageBubble;
