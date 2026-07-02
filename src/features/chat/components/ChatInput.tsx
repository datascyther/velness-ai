/**
 * ChatInput
 *
 * Text input + send/abort button row.
 *
 * Key changes from original:
 *   - KeyboardAvoidingView REMOVED (moved to ChatScreen where it belongs)
 *   - isStreaming prop: when true, shows an abort button instead of send
 *   - paddingBottom prop: lets ChatScreen pass the safe-area bottom inset
 *     so the input sits above the home indicator on notched phones
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable, type NativeSyntheticEvent, type TextInputContentSizeChangeEventData } from 'react-native';
import { Square } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withSpring, FadeIn, FadeOut } from 'react-native-reanimated';
import { SendButton } from './SendButton';

interface ChatInputProps {
  onSend: (text: string) => void;
  onAbort?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  /** Bottom safe-area inset passed from ChatScreen */
  paddingBottom?: number;
  /** Text to prefill into the input (from quick starter chip tap) */
  prefillText?: string | null;
  /** Called after prefill text has been auto-sent */
  onPrefillSent?: () => void;
}

export function ChatInput({
  onSend,
  onAbort,
  isStreaming = false,
  disabled = false,
  paddingBottom = 0,
  prefillText,
  onPrefillSent,
}: ChatInputProps) {
  const [inputText, setInputText] = useState('');
  const [inputHeight, setInputHeight] = useState(0);
  const inputRef = useRef<TextInput>(null);
  const { colors } = useTheme();
  const inputScale = useSharedValue(1);

  const animatedInputStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  useEffect(() => {
    if (!isStreaming && !disabled) {
      inputRef.current?.focus();
    }
  }, [isStreaming, disabled]);

  // When a quick starter chip triggers a prefill, animate and auto-send
  useEffect(() => {
    if (!prefillText) return;
    const trimmed = prefillText.trim();
    if (!trimmed) return;

    setInputText(trimmed);

    inputScale.value = withSequence(
      withSpring(1.02, { damping: 12, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 300 })
    );

    const timer = setTimeout(() => {
      onSend(trimmed);
      setInputText('');
      onPrefillSent?.();
    }, 600);

    return () => clearTimeout(timer);
  }, [prefillText, onSend, onPrefillSent]);

  const handleContentSizeChange = useCallback(
    (event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
      setInputHeight(event.nativeEvent.contentSize.height);
    },
    []
  );

  const handleSend = () => {
    if (inputText.trim() === '') return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    onSend(inputText.trim());
    setInputText('');
  };

  const handleAbort = () => {
    onAbort?.();
  };

  return (
    <View
      style={[
        styles.outerContainer,
        {
          backgroundColor: colors.surface.primary,
          paddingBottom: paddingBottom + 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 4,
          borderTopWidth: isStreaming ? 1 : 0,
          borderTopColor: isStreaming ? colors.brand.primary : 'transparent',
        },
      ]}
    >
      <Animated.View
        style={[
          styles.inputWrapper,
          animatedInputStyle,
          {
            backgroundColor: colors.background.secondary,
            borderColor: isStreaming ? colors.brand.primary : colors.border.default,
            borderWidth: isStreaming ? 1.5 : 1,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[
            styles.textInput,
            { color: colors.text.primary },
            inputHeight > 0 && { height: Math.min(inputHeight, 150) },
          ]}
          placeholder={isStreaming ? 'Neeva is responding...' : "Share what's on your mind..."}
          placeholderTextColor={colors.text.secondary}
          value={inputText}
          onChangeText={setInputText}
          onContentSizeChange={handleContentSizeChange}
          multiline
          maxLength={1000}
          editable={!disabled && !isStreaming}
          accessibilityLabel="Chat input field"
        />

        {isStreaming ? (
          /* Stop/Abort button — shown while AI is responding */
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
          >
            <Pressable
              onPress={handleAbort}
              style={({ pressed }) => [
                styles.abortButton,
                {
                  backgroundColor: colors.brand.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Stop AI response"
            >
              <Square size={14} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
            </Pressable>
          </Animated.View>
        ) : (
          <SendButton
            onPress={handleSend}
            disabled={inputText.trim() === ''}
          />
        )}
      </Animated.View>

      {inputText.length > 0 && (
        <Text
          style={[
            styles.charCounter,
            {
              color: inputText.length > 900
                ? colors.danger
                : colors.text.secondary,
              opacity: inputText.length > 900 ? 1 : 0.6,
            },
          ]}
        >
          {inputText.length}/1000
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
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
    maxHeight: 150,
    textAlignVertical: 'top',
  },
  abortButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  charCounter: {
    fontSize: 11,
    fontWeight: '400',
    textAlign: 'right',
    marginTop: 4,
    marginRight: 4,
  },
});

export default ChatInput;
