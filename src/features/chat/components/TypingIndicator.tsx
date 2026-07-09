import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

const DOT_SIZE = 5;
const DOT_GAP = 4;

function AnimatedDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

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
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.dot, animStyle]} />;
}

export const TypingIndicator = React.memo(function TypingIndicator() {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.container}
      accessibilityLabel="Velness is thinking for you"
      accessibilityLiveRegion="polite"
    >
      <View style={styles.dotsRow}>
        <AnimatedDot delay={0} />
        <AnimatedDot delay={150} />
        <AnimatedDot delay={300} />
      </View>
      <Text style={[styles.label, { color: colors.text.secondary }]}>
        Velness is thinking for you...
      </Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 44,
    paddingVertical: 8,
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
  label: {
    fontSize: 12,
    fontWeight: '400',
  },
});

export default TypingIndicator;
