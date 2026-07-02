import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Brain, ThumbsUp, ThumbsDown, Clipboard } from 'lucide-react-native';
import * as ExpoClipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withDelay, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { MessageTimestamp } from './MessageTimestamp';

interface AIMessageBubbleProps {
  message: string;
  timestamp: string;
  /** When true, shows a blinking cursor at the end of the message */
  isStreaming?: boolean;
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
      <Pressable onPress={handlePress} style={styles.actionBtn} hitSlop={6} accessibilityRole="button" accessibilityLabel={accessibilityLabel}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

export function AIMessageBubble({ message, timestamp, isStreaming = false }: AIMessageBubbleProps) {
  const { colors } = useTheme();
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [copyOpacity, setCopyOpacity] = useState(1);

  // Blinking cursor animation during streaming
  const cursorOpacity = useSharedValue(0);
  const cursorStyle = useAnimatedStyle(() => ({ opacity: cursorOpacity.value }));

  // Subtle pulse on container during streaming (uses scale, not opacity,
  // to avoid conflict with the FadeIn layout animation on the same element)
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
      containerScale.value = withTiming(1, { duration: 200 });
    }
  }, [isStreaming]);

  const handleCopy = useCallback(async () => {
    if (!message) return;
    try {
      await ExpoClipboard.setStringAsync(message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setCopyOpacity(0.7);
    setTimeout(() => setCopyOpacity(1), 200);
  }, [message]);

  const handleThumbsUp = useCallback(() => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setFeedback((prev) => (prev === 'up' ? null : 'up'));
  }, []);

  const handleThumbsDown = useCallback(() => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setFeedback((prev) => (prev === 'down' ? null : 'down'));
  }, []);

  return (
    <Animated.View entering={FadeIn.duration(300).springify().damping(20).stiffness(200)} style={[styles.container, { backgroundColor: colors.surface.secondary }, containerStyle]}>
      {/* Header: Avatar + Neeva label */}
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

      {/* Message text — no bubble, just text on light surface */}
      <Pressable onLongPress={handleCopy} style={{ opacity: copyOpacity }}>
        <Text style={[styles.messageText, { color: colors.text.primary }]}>
          {message}
          {isStreaming && (
            <Animated.Text style={[styles.cursor, { color: colors.brand.primary }, cursorStyle]}>
              {'▊'}
            </Animated.Text>
          )}
        </Text>
      </Pressable>

      {/* Timestamp */}
      <MessageTimestamp timestamp={timestamp} style={styles.timestampBelow} />

      {/* Actions: 👍 👎 Copy */}
      {!isStreaming && message ? (
        <View style={styles.actionsRow}>
          <ActionButton onPress={handleThumbsUp} accessibilityLabel="Good response">
            <ThumbsUp size={14} color={feedback === 'up' ? colors.brand.primary : colors.text.secondary} strokeWidth={2} />
          </ActionButton>
          <ActionButton onPress={handleThumbsDown} accessibilityLabel="Bad response">
            <ThumbsDown size={14} color={feedback === 'down' ? colors.danger : colors.text.secondary} strokeWidth={2} />
          </ActionButton>
          <ActionButton onPress={handleCopy} accessibilityLabel="Copy message">
            <Clipboard size={14} color={colors.text.secondary} strokeWidth={2} />
          </ActionButton>
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '88%',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
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
  messageText: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
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
