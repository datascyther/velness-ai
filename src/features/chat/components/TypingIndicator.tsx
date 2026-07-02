/**
 * TypingIndicator
 *
 * Three animated dots shown when the assistant is waiting to send its
 * first token. Once content starts arriving this component is unmounted
 * and the AIMessageBubble takes over.
 *
 * Design: matches the AIMessageBubble layout (avatar + bubble) so the
 * transition from indicator → bubble is seamless with no layout jump.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Brain } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

const DOT_SIZE = 7;
const DOT_GAP = 5;

function AnimatedDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 350 }),
          withTiming(0.3, { duration: 350 })
        ),
        -1,
        false
      )
    );
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 350 }),
          withTiming(0, { duration: 350 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[styles.dot, animStyle]} />;
}

export const TypingIndicator = React.memo(function TypingIndicator() {
  const { colors } = useTheme();
  const avatarScale = useSharedValue(1);

  useEffect(() => {
    avatarScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const avatarAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.container}
      accessibilityLabel="Neeva is typing"
      accessibilityLiveRegion="polite"
    >
      {/* Header: Avatar */}
      <View style={styles.headerRow}>
        <Animated.View style={[styles.avatarContainer, avatarAnimStyle]}>
          <Svg width={28} height={28} style={StyleSheet.absoluteFillObject}>
            <Defs>
              <LinearGradient id="rainbowGradTI" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#8B5CF6" />
                <Stop offset="40%" stopColor="#A78BFA" />
                <Stop offset="75%" stopColor="#06B6D4" />
                <Stop offset="100%" stopColor="#EF4444" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" rx={14} fill="url(#rainbowGradTI)" />
          </Svg>
          <Brain size={14} color="#FFFFFF" strokeWidth={2} />
        </Animated.View>
      </View>

      {/* Dots */}
      <View style={[styles.bubble, { backgroundColor: colors.surface.secondary }]}>
        <View style={styles.dotsRow}>
          <AnimatedDot delay={0} />
          <AnimatedDot delay={150} />
          <AnimatedDot delay={300} />
        </View>
        <Animated.View entering={FadeIn.duration(300).delay(300)} style={styles.labelContainer}>
          <Text style={[styles.thinkingLabel, { color: colors.text.secondary }]}>
            Neeva is thinking...
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  bubble: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DOT_GAP,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#8B5CF6',
  },
  labelContainer: {
    marginTop: 6,
  },
  thinkingLabel: {
    fontSize: 12,
    fontWeight: '400',
  },
});

export default TypingIndicator;
