import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { MessageTimestamp } from './MessageTimestamp';

interface UserMessageBubbleProps {
  message: string;
  timestamp: string;
}

export function UserMessageBubble({ message, timestamp }: UserMessageBubbleProps) {
  const { colors } = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(250).springify().damping(22).stiffness(220)} style={styles.container}>
      <View style={styles.bubbleWrapper}>
        <View style={[styles.bubble, { backgroundColor: colors.brand.primary, shadowColor: colors.brand.primary }]}>
          <Text style={[styles.messageText, { color: colors.brand.contrastText }]}>
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
    justifyContent: 'flex-end',
    marginVertical: 3,
    width: '100%',
  },
  bubbleWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    maxWidth: '82%',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  timestampStyle: {
    marginRight: 4,
  },
});


export default UserMessageBubble;
