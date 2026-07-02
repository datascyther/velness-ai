import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Brain } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { MessageTimestamp } from './MessageTimestamp';

interface AIMessageBubbleProps {
  message: string;
  timestamp: string;
}

export function AIMessageBubble({ message, timestamp }: AIMessageBubbleProps) {
  const { colors } = useTheme();

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      {/* Rainbow Brain Avatar */}
      <View style={styles.avatarContainer}>
        <Svg width={36} height={36} style={StyleSheet.absoluteFillObject}>
          <Defs>
            <LinearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#8B5CF6" />
              <Stop offset="40%" stopColor="#A78BFA" />
              <Stop offset="75%" stopColor="#06B6D4" />
              <Stop offset="100%" stopColor="#EF4444" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" rx={18} fill="url(#rainbowGrad)" />
        </Svg>
        <Brain size={18} color="#FFFFFF" strokeWidth={2} />
      </View>

      {/* Bubble Content */}
      <View style={styles.bubbleWrapper}>
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: colors.surface.secondary,
              borderColor: colors.border.default,
            },
          ]}
        >
          <Text style={[styles.messageText, { color: colors.text.primary }]}>
            {message}
          </Text>
        </View>
        <MessageTimestamp timestamp={timestamp} style={styles.timestampStyle} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
    width: '100%',
    paddingRight: 60, // ensures the message bubble doesn't stretch too wide
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    position: 'relative',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  bubbleWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    maxWidth: '85%', // relative to the remaining space
  },
  bubble: {
    borderWidth: 1,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  timestampStyle: {
    marginLeft: 4,
  },
});


export default AIMessageBubble;
