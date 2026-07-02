import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { ArrowUp } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface SendButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export function SendButton({ onPress, disabled = false }: SendButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
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
        size={18}
        color={
          disabled
            ? colors.text.secondary
            : colors.brand.contrastText
        }
        strokeWidth={2.5}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

export default SendButton;
