import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { typography, spacing } from '@/core/theme';

export interface RecommendationActionsProps {
  onNotNow: () => void;
  onShowAnother: () => void;
  onAskWhy: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ActionButton = React.memo(({
  onPress,
  disabled,
  label,
  accessibilityLabel,
}: {
  onPress: () => void;
  disabled?: boolean;
  label: string;
  accessibilityLabel: string;
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, { damping: 15, stiffness: 400 }) }],
    opacity: withSpring(disabled ? 0.4 : opacity.value, { damping: 15, stiffness: 200 }),
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = 0.96;
      opacity.value = 0.6;
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = 1.0;
      opacity.value = 1.0;
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={animatedStyle}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.actionBtn}>
        <Text style={styles.actionText}>{label}</Text>
      </View>
    </AnimatedPressable>
  );
});

export const RecommendationActions = React.memo(({
  onNotNow,
  onShowAnother,
  onAskWhy,
  disabled = false,
}: RecommendationActionsProps) => {
  return (
    <View style={styles.container}>
      {/* Ask Velness why */}
      <ActionButton
        onPress={onAskWhy}
        disabled={disabled}
        label="Ask Velness why"
        accessibilityLabel="Ask Velness why this is recommended"
      />

      <Text style={styles.divider}>•</Text>

      {/* Show another suggestion */}
      <ActionButton
        onPress={onShowAnother}
        disabled={disabled}
        label="Show another"
        accessibilityLabel="Show another suggestion"
      />

      <Text style={styles.divider}>•</Text>

      {/* Not now */}
      <ActionButton
        onPress={onNotNow}
        disabled={disabled}
        label="Not now"
        accessibilityLabel="Not now, dismiss recommendation"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  actionBtn: {
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    fontFamily: typography.fontFamily.sans,
    fontWeight: '500',
  },
  divider: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 10,
  },
});

export default RecommendationActions;

