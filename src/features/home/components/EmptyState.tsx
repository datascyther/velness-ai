import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/core/theme';

interface EmptyStateProps {
  onCheckIn?: () => void;
}

export const EmptyState = React.memo(({ onCheckIn }: EmptyStateProps) => {
  const { colors } = useTheme();

  return (
    <Animated.View entering={FadeInUp.duration(500)} style={styles.container}>
      <View style={[styles.iconRing, { borderColor: `${colors.brand.primary}30` }]}>
        <Svg width={40} height={40} viewBox="0 0 40 40">
          <Circle cx={20} cy={20} r={18} fill={colors.brand.primary} opacity={0.06} />
          <Path
            d="M20 8C15.029 8 11 11.582 11 16C11 18.72 12.1 20.4 13.2 22.5L15.5 27H24.5L26.8 22.5C27.9 20.4 29 18.72 29 16C29 11.582 24.971 8 20 8Z"
            fill={colors.brand.primary}
            opacity={0.1}
          />
          <Path
            d="M15 15C15 14.172 15.672 13.5 16.5 13.5C17.328 13.5 18 14.172 18 15C18 15.828 17.328 16.5 16.5 16.5C15.672 16.5 15 15.828 15 15Z"
            fill={colors.brand.primary}
          />
          <Path
            d="M22 15C22 14.172 22.672 13.5 23.5 13.5C24.328 13.5 25 14.172 25 15C25 15.828 24.328 16.5 23.5 16.5C22.672 16.5 22 15.828 22 15Z"
            fill={colors.brand.primary}
          />
          <Path
            d="M17 21.5C17 21.5 18.5 24 20 24C21.5 24 23 21.5 23 21.5"
            fill="none"
            stroke={colors.brand.primary}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </Svg>
      </View>

      <Text style={[styles.mainText, { color: colors.text.primary }]}>
        No mood entries yet
      </Text>
      <Text style={[styles.subText, { color: colors.text.secondary }]}>
        Start your first check-in to see your weekly history.
      </Text>

      {onCheckIn && (
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.brand.primary, opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={onCheckIn}
        >
          <Text style={[styles.buttonText, { color: colors.brand.contrastText }]}>
            Check In Now
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
});

EmptyState.displayName = 'EmptyState';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  mainText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  subText: {
    fontSize: 13.5,
    fontWeight: '400',
    marginTop: spacing.xs,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.7,
  },
  button: {
    marginTop: spacing.lg + 2,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
