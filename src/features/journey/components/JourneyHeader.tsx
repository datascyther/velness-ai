/**
 * JourneyHeader — Screen header for the Journey tab
 *
 * Displays:
 *  - "Your Journey" title
 *  - "Small steps today, stronger tomorrow." subtitle
 *  - Flame icon + streak counter (right-aligned)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FlameIcon } from '@/shared/components/SymbolIcons';
import { useTheme } from '@/hooks/useTheme';
import { typography, spacing } from '@/core/theme';

interface JourneyHeaderProps {
  /** Current day streak count. */
  streak?: number;
}

export const JourneyHeader = React.memo(({ streak = 0 }: JourneyHeaderProps) => {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.duration(600).springify()}
      style={styles.container}
    >
      <View style={styles.leftSection}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Your Journey
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Small steps today, stronger tomorrow.
        </Text>
      </View>

      {streak > 0 && (
        <View style={styles.streakContainer}>
          <FlameIcon size={24} />
          <View style={styles.streakTextBlock}>
            <Text style={[styles.streakCount, { color: colors.text.primary }]}>
              {streak}
            </Text>
            <Text style={[styles.streakLabel, { color: colors.text.secondary }]}>
              day streak
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
});

JourneyHeader.displayName = 'JourneyHeader';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  leftSection: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: typography.fontFamily.display,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    marginTop: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
    marginTop: 4,
  },
  fireEmoji: {
    fontSize: 24,
  },
  streakTextBlock: {
    alignItems: 'center',
    marginLeft: 4,
  },
  streakCount: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  streakLabel: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
  },
});

export default JourneyHeader;
