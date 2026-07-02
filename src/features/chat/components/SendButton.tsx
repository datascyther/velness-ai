import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { ArrowUp } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

interface SendButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export function SendButton({ onPress, disabled = false }: SendButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const disabledOpacity = useSharedValue(disabled ? 0.4 : 1);
  const disabledScale = useSharedValue(disabled ? 0.92 : 1);

  useEffect(() => {
    disabledOpacity.value = withSpring(disabled ? 0.4 : 1, { damping: 15, stiffness: 200 });
    disabledScale.value = withSpring(disabled ? 0.92 : 1, { damping: 15, stiffness: 200 });
  }, [disabled]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: disabledOpacity.value,
    transform: [{ scale: scale.value * disabledScale.value }],
  }));

  const handlePress = () => {
    if (disabled) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    scale.value = withTiming(0.9, { duration: 80 }, () => {
      scale.value = withTiming(1, { duration: 80 });
    });
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.sendButton,
          {
            backgroundColor: disabled
              ? colors.border.default
              : colors.brand.primary,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Send message"
      >
        <ArrowUp
          size={20}
          color={
            disabled
              ? colors.text.secondary
              : colors.brand.contrastText
          }
          strokeWidth={2.5}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

export default SendButton;
