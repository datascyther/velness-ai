import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SendHorizontal } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface SendButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export function SendButton({ onPress, disabled = false }: SendButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (disabled) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    scale.value = withSpring(0.88, { damping: 12, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 250 });
    });
    onPress();
  };

  const isDisabled = disabled;
  const brand = (colors.brand ?? {}) as Record<string, string>;
  const primary = brand.primary ?? '#7E60CD';
  const subtle = brand.subtle ?? 'rgba(126, 96, 205, 0.16)';
  const border = brand.border ?? 'rgba(126, 96, 205, 0.45)';
  const secondary = brand.secondary ?? '#9F8BE6';
  const contrastText = brand.contrastText ?? '#FFFFFF';

  return (
    <Animated.View style={[styles.sendWrapper, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.sendButton,
          {
            backgroundColor: isDisabled ? subtle : primary,
            borderWidth: isDisabled ? 1 : 0,
            borderColor: isDisabled ? border : 'transparent',
            shadowColor: isDisabled ? 'transparent' : primary,
            opacity: isDisabled ? (pressed ? 0.75 : 0.7) : pressed ? 0.85 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Send message"
      >
        <SendHorizontal
          size={20}
          color={isDisabled ? secondary : contrastText}
          strokeWidth={2.5}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sendWrapper: {
    marginLeft: 18,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
});

export default SendButton;
