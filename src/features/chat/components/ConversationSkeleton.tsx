import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, withDelay, FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

function SkeletonLine({ width, delay }: { width: number | string; delay: number }) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.7, { duration: 800 }),
          withTiming(0.3, { duration: 800 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[styles.skeletonLine, { width: width as any, backgroundColor: colors.surface.secondary }, animStyle]}
    />
  );
}

export function ConversationSkeleton() {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      accessibilityLabel="Loading conversation"
    >
      {/* AI message skeleton — vertical stacked layout */}
      <View style={styles.aiSection}>
        <View style={[styles.aiAvatar, { backgroundColor: colors.surface.secondary }]} />
        <View style={styles.aiBubble}>
          <SkeletonLine width="80%" delay={0} />
          <SkeletonLine width="60%" delay={200} />
        </View>
      </View>

      {/* User message skeleton — right-aligned */}
      <View style={styles.userSection}>
        <View style={[styles.userBubble, { backgroundColor: colors.brand.primary + '20' }]}>
          <SkeletonLine width="70%" delay={100} />
        </View>
      </View>

      {/* Another AI message skeleton */}
      <View style={styles.aiSection}>
        <View style={[styles.aiAvatar, { backgroundColor: colors.surface.secondary }]} />
        <View style={styles.aiBubble}>
          <SkeletonLine width="90%" delay={200} />
          <SkeletonLine width="50%" delay={400} />
          <SkeletonLine width="75%" delay={600} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8 },
  aiSection: {
    marginVertical: 8,
    width: '100%',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: 10,
  },
  aiBubble: {
    gap: 8,
    width: '70%',
  },
  userSection: {
    marginVertical: 8,
    alignItems: 'flex-end',
  },
  userBubble: {
    width: '60%',
    borderRadius: 16,
    padding: 12,
  },
  skeletonLine: { height: 14, borderRadius: 7, borderWidth: 0 },
});

export default ConversationSkeleton;
