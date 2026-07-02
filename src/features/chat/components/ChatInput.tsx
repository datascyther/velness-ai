/**
 * ChatInput
 *
 * Text input + send/abort button row with voice transcription simulator,
 * pulsating waveform animation, and focus glow effects.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable, type NativeSyntheticEvent, type TextInputContentSizeChangeEventData } from 'react-native';
import { Square, Mic, X, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withSpring, withTiming, FadeIn, FadeOut, withRepeat } from 'react-native-reanimated';
import { SendButton } from './SendButton';
import { saveDraft, loadDraft, clearDraft } from '../persistence/draftStorage';

interface ChatInputProps {
  onSend: (text: string) => void;
  onAbort?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  paddingBottom?: number;
  prefillText?: string | null;
  onPrefillSent?: () => void;
  conversationId?: string | null;
  onDraftChange?: (text: string) => void;
}

export function ChatInput({
  onSend,
  onAbort,
  isStreaming = false,
  disabled = false,
  paddingBottom = 0,
  prefillText,
  onPrefillSent,
  conversationId,
  onDraftChange,
}: ChatInputProps) {
  const [inputText, setInputText] = useState('');
  const [inputHeight, setInputHeight] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState('');
  
  const inputRef = useRef<TextInput>(null);
  const { colors } = useTheme();
  
  const inputScale = useSharedValue(1);
  const focusBorderColor = useSharedValue(colors.border.default);
  const focusShadowOpacity = useSharedValue(0.04);

  // Reanimated Waveform Bar Heights
  const bar1 = useSharedValue(10);
  const bar2 = useSharedValue(10);
  const bar3 = useSharedValue(10);
  const bar4 = useSharedValue(10);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus effect transition
  useEffect(() => {
    focusBorderColor.value = withTiming(
      isFocused ? colors.brand.primary : colors.border.default,
      { duration: 250 }
    );
    focusShadowOpacity.value = withTiming(
      isFocused ? 0.12 : 0.04,
      { duration: 250 }
    );
  }, [isFocused, colors]);

  const animatedWrapperStyle = useAnimatedStyle(() => ({
    borderColor: focusBorderColor.value,
    shadowOpacity: focusShadowOpacity.value,
    transform: [{ scale: inputScale.value }],
  }));

  // Waveform animations when listening
  useEffect(() => {
    if (isListening) {
      bar1.value = withRepeat(withSequence(withTiming(28, { duration: 400 }), withTiming(8, { duration: 400 })), -1, true);
      bar2.value = withRepeat(withSequence(withTiming(20, { duration: 320 }), withTiming(10, { duration: 320 })), -1, true);
      bar3.value = withRepeat(withSequence(withTiming(36, { duration: 480 }), withTiming(6, { duration: 480 })), -1, true);
      bar4.value = withRepeat(withSequence(withTiming(24, { duration: 360 }), withTiming(8, { duration: 360 })), -1, true);
    } else {
      bar1.value = withTiming(10);
      bar2.value = withTiming(10);
      bar3.value = withTiming(10);
      bar4.value = withTiming(10);
    }
  }, [isListening]);

  // Voice transcript simulation typing effect
  useEffect(() => {
    if (!isListening) return;

    const transcripts = [
      "I'm feeling quite overwhelmed today. There's just so much on my mind, and I can't seem to focus on anything.",
      "My mind is racing and I can't sleep. I just need a moment to breathe and clear my thoughts.",
      "I had a pretty stressful interaction today, and I'm still holding on to the tension. I'd love to unpack it."
    ];
    const selected = transcripts[Math.floor(Math.random() * transcripts.length)];

    let index = 0;
    const delayTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (index < selected.length) {
          setTranscriptionText(selected.slice(0, index + 1));
          index += 2; // Type 2 characters at a time for natural speed
        } else {
          clearInterval(interval);
        }
      }, 35);
      return () => clearInterval(interval);
    }, 1200);

    return () => {
      clearTimeout(delayTimeout);
    };
  }, [isListening]);

  const startVoiceSimulator = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    setTranscriptionText('');
    setIsListening(true);
  };

  const cancelVoiceSimulator = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setIsListening(false);
    setTranscriptionText('');
  };

  const acceptVoiceSimulator = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setIsListening(false);
    if (transcriptionText.trim()) {
      setInputText(transcriptionText);
    }
    setTranscriptionText('');
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const animatedBar1 = useAnimatedStyle(() => ({ height: bar1.value }));
  const animatedBar2 = useAnimatedStyle(() => ({ height: bar2.value }));
  const animatedBar3 = useAnimatedStyle(() => ({ height: bar3.value }));
  const animatedBar4 = useAnimatedStyle(() => ({ height: bar4.value }));

  // Auto focus input when streaming stops
  useEffect(() => {
    if (!isStreaming && !disabled && !isListening) {
      inputRef.current?.focus();
    }
  }, [isStreaming, disabled, isListening]);

  // Handle Quick starter chip prefills
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

  // Load draft
  useEffect(() => {
    if (!conversationId) return;
    loadDraft(conversationId).then((draft) => {
      if (draft) {
        setInputText(draft);
      }
    });
  }, [conversationId]);

  // Save draft
  useEffect(() => {
    if (!conversationId) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!inputText.trim()) return;

    debounceTimerRef.current = setTimeout(() => {
      saveDraft(conversationId, inputText);
      onDraftChange?.(inputText);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputText, conversationId, onDraftChange]);

  const handleContentSizeChange = useCallback(
    (event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
      setInputHeight(event.nativeEvent.contentSize.height);
    },
    []
  );

  const handleSend = () => {
    if (inputText.trim() === '') return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    inputScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    onSend(inputText.trim());
    if (conversationId) {
      clearDraft(conversationId);
    }
    onDraftChange?.('');
    setInputText('');
  };

  const handleAbort = () => {
    onAbort?.();
  };

  const warmPlaceholders = useMemo(() => [
    "Share what's on your mind...",
    "What's on your heart right now?",
    "Tell me how your day went...",
    "How can I support you today?"
  ], []);

  const placeholder = useMemo(() => {
    if (isStreaming) return 'Neeva is responding...';
    // Use first warm placeholder
    return warmPlaceholders[0];
  }, [isStreaming, warmPlaceholders]);

  return (
    <View
      style={[
        styles.outerContainer,
        {
          paddingBottom: paddingBottom + 16,
        },
      ]}
    >
      {isListening ? (
        // Voice Simulator View
        <Animated.View 
          entering={FadeIn.duration(250)} 
          exiting={FadeOut.duration(200)}
          style={[styles.voiceContainer, { backgroundColor: colors.surface.primary, borderColor: colors.brand.primary }]}
        >
          <View style={styles.waveformContainer}>
            <Animated.View style={[styles.waveBar, animatedBar1, { backgroundColor: colors.brand.primary }]} />
            <Animated.View style={[styles.waveBar, animatedBar2, { backgroundColor: colors.brand.primary }]} />
            <Animated.View style={[styles.waveBar, animatedBar3, { backgroundColor: colors.brand.primary }]} />
            <Animated.View style={[styles.waveBar, animatedBar4, { backgroundColor: colors.brand.primary }]} />
          </View>

          <Text style={[styles.transcriptionText, { color: transcriptionText ? colors.text.primary : colors.text.secondary }]}>
            {transcriptionText || "Listening... Speak now..."}
          </Text>

          <View style={styles.voiceActions}>
            <Pressable 
              onPress={cancelVoiceSimulator}
              style={[styles.voiceActionBtn, styles.cancelBtn, { borderColor: colors.border.default }]}
            >
              <X size={18} color={colors.text.secondary} />
            </Pressable>
            <Pressable 
              onPress={acceptVoiceSimulator}
              style={[styles.voiceActionBtn, styles.acceptBtn, { backgroundColor: colors.brand.primary }]}
              disabled={!transcriptionText}
            >
              <Check size={18} color={colors.brand.contrastText} />
            </Pressable>
          </View>
        </Animated.View>
      ) : (
        // Regular Text Composer Input View
        <Animated.View
          style={[
            styles.inputWrapper,
            animatedWrapperStyle,
            {
              backgroundColor: colors.surface.primary,
            },
          ]}
        >
          {/* Voice button */}
          {!disabled && !isStreaming && (
            <Pressable
              onPress={startVoiceSimulator}
              style={({ pressed }) => [
                styles.micButton,
                { backgroundColor: pressed ? colors.border.default : 'transparent' }
              ]}
              accessibilityLabel="Speak message"
              accessibilityRole="button"
            >
              <Mic size={18} color={colors.text.secondary} />
            </Pressable>
          )}

          <TextInput
            ref={inputRef}
            style={[
              styles.textInput,
              { color: colors.text.primary },
              inputHeight > 0 && { height: Math.min(inputHeight, 150) },
            ]}
            placeholder={placeholder}
            placeholderTextColor={colors.text.secondary}
            value={inputText}
            onChangeText={setInputText}
            onContentSizeChange={handleContentSizeChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            multiline
            maxLength={1000}
            editable={!disabled && !isStreaming}
            accessibilityLabel="Chat input field"
          />

          {isStreaming ? (
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
      )}

      {inputText.length > 800 && (
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
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingVertical: 6,
    minHeight: 54,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    paddingHorizontal: 6,
    paddingVertical: 8,
    maxHeight: 150,
    textAlignVertical: 'top',
  },
  abortButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 54,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    width: 48,
    height: 40,
  },
  waveBar: {
    width: 3.5,
    borderRadius: 2,
  },
  transcriptionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    marginHorizontal: 12,
    fontWeight: '500',
  },
  voiceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  voiceActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  acceptBtn: {
    elevation: 1,
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
