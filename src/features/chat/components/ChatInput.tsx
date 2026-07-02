import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowUp } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

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
      <View style={[styles.outerContainer, { borderTopColor: 'rgba(255,255,255,0.05)' }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.textInput, { color: '#FFFFFF' }]}
            placeholder="Message Neeva..."
            placeholderTextColor="rgba(255, 255, 255, 0.35)"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            editable={!disabled}
            accessibilityLabel="Chat input field"
          />
          <Pressable
            onPress={handleSend}
            disabled={disabled || inputText.trim() === ''}
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor: disabled || inputText.trim() === ''
                  ? 'rgba(255, 255, 255, 0.05)'
                  : '#8B5CF6',
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <ArrowUp
              size={18}
              color={
                disabled || inputText.trim() === ''
                  ? 'rgba(255, 255, 255, 0.2)'
                  : '#FFFFFF'
              }
              strokeWidth={2.5}
            />
          </Pressable>
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
    backgroundColor: '#0B0B12',
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

export default ChatInput;
