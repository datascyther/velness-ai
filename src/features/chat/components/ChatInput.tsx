import React, { useState } from 'react';
import { View, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { SendButton } from './SendButton';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [inputText, setInputText] = useState('');
  const { colors } = useTheme();

  const handleSend = () => {
    if (inputText.trim() === '') return;
    onSend(inputText.trim());
    setInputText('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={styles.keyboardContainer}
    >
      <View
        style={[
          styles.outerContainer,
          {
            backgroundColor: colors.surface.primary,
            borderTopColor: colors.border.default,
          },
        ]}
      >
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.background.secondary,
              borderColor: colors.border.default,
            },
          ]}
        >
          <TextInput
            style={[styles.textInput, { color: colors.text.primary }]}
            placeholder="Message Neeva..."
            placeholderTextColor={colors.text.secondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            editable={!disabled}
            accessibilityLabel="Chat input field"
          />
          <SendButton
            onPress={handleSend}
            disabled={disabled || inputText.trim() === ''}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    width: '100%',
  },
  outerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    paddingHorizontal: 8,
    paddingVertical: 6,
    maxHeight: 120,
    textAlignVertical: 'center',
  },
});

export default ChatInput;
