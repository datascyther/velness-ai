import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable, Alert, type NativeSyntheticEvent, type TextInputContentSizeChangeEventData } from 'react-native';
import { Square, AudioLines, MicOff, X, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withSpring, withTiming, FadeIn, FadeOut } from 'react-native-reanimated';
import {
  speechRecognitionAvailable,
  useSpeechRecognitionEvent,
  requestSpeechPermission,
  startSpeechRecognition,
  stopSpeechRecognition,
  abortSpeechRecognition,
} from '@/services/speech/SpeechRecognition';
import { SendButton } from './SendButton';
import { saveDraft, loadDraft, clearDraft } from '../persistence/draftStorage';

const WARM_PLACEHOLDERS = [
  "Share what's on your mind...",
  "What's on your heart right now?",
  "Tell me how your day went...",
  "How can I support you today?",
] as const;

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
  const [permissionAsked, setPermissionAsked] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const { colors } = useTheme();

  const inputScale = useSharedValue(1);
  const focusBorderColor = useSharedValue(colors.border.default);
  const focusShadowOpacity = useSharedValue(0.04);

  const bar1 = useSharedValue(10);
  const bar2 = useSharedValue(10);
  const bar3 = useSharedValue(10);
  const bar4 = useSharedValue(10);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isListeningRef = useRef(false);
  const transcriptionRef = useRef('');

  // --- Speech Recognition Events ---

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results.map(r => r.transcript).join(' ');
    transcriptionRef.current = transcript;
    setTranscriptionText(transcript);
  });

  useSpeechRecognitionEvent('error', (event) => {
    if (event.error === 'not-allowed') {
      setIsListening(false);
      isListeningRef.current = false;
      Alert.alert(
        'Microphone Permission Required',
        'Voice typing needs microphone access. You can enable it in your device Settings.'
      );
      return;
    }
    setIsListening(false);
    isListeningRef.current = false;
    setTranscriptionText('');
  });

  useSpeechRecognitionEvent('end', () => {
    if (isListeningRef.current) {
      setIsListening(false);
      isListeningRef.current = false;
    }
  });

  useSpeechRecognitionEvent('volumechange', (event) => {
    if (!isListeningRef.current) return;
    const vol = Math.max(0, Math.min(1, (event.value + 2) / 12));
    const target = 6 + vol * 30;
    bar1.value = withTiming(target * 0.7, { duration: 100 });
    bar2.value = withTiming(target * 0.9, { duration: 100 });
    bar3.value = withTiming(target * 1.1, { duration: 100 });
    bar4.value = withTiming(target * 0.8, { duration: 100 });
  });

  // --- Focus effect ---

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

  // Keep isListeningRef in sync with isListening state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // --- Waveform animation fallback (when not listening) ---

  useEffect(() => {
    if (!isListening) {
      bar1.value = withTiming(10);
      bar2.value = withTiming(10);
      bar3.value = withTiming(10);
      bar4.value = withTiming(10);
    }
  }, [isListening]);

  const animatedBar1 = useAnimatedStyle(() => ({ height: bar1.value }));
  const animatedBar2 = useAnimatedStyle(() => ({ height: bar2.value }));
  const animatedBar3 = useAnimatedStyle(() => ({ height: bar3.value }));
  const animatedBar4 = useAnimatedStyle(() => ({ height: bar4.value }));

  // --- Voice Typing ---

  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    const granted = await requestSpeechPermission();
    if (granted) {
      setPermissionAsked(true);
      return true;
    }
    return false;
  }, []);

  const startVoiceTyping = useCallback(async () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}

    if (!speechRecognitionAvailable) {
      Alert.alert(
        'Voice Typing Unavailable',
        'Voice typing requires a development build with the speech recognition module. Please rebuild the app using `npx expo run:android` or `npx expo run:ios`.'
      );
      return;
    }

    if (!permissionAsked) {
      const permissionResult = await requestMicPermission();
      if (!permissionResult) {
        Alert.alert(
          'Microphone Access Needed',
          'Velness uses the microphone to convert your speech into text. This helps you express yourself more naturally, especially when typing feels heavy. You can enable mic access in your device Settings.'
        );
        return;
      }
    }

    transcriptionRef.current = '';
    setTranscriptionText('');

    startSpeechRecognition({
      lang: 'en-US',
      interimResults: true,
      continuous: false,
      addsPunctuation: true,
      iosTaskHint: 'dictation',
      contextualStrings: [
        'anxiety', 'depression', 'overwhelmed', 'stressed', 'worried',
        'grateful', 'hopeful', 'anxious', 'calm', 'peaceful',
        'therapy', 'mental health', 'self care', 'mindfulness',
      ],
      volumeChangeEventOptions: {
        enabled: true,
        intervalMillis: 100,
      },
    });

    setIsListening(true);
  }, [permissionAsked, requestMicPermission]);

  const stopVoiceTyping = useCallback(() => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    stopSpeechRecognition();
    setIsListening(false);
    isListeningRef.current = false;
  }, []);

  const cancelVoiceTyping = useCallback(() => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    abortSpeechRecognition();
    setIsListening(false);
    isListeningRef.current = false;
    transcriptionRef.current = '';
    setTranscriptionText('');
  }, []);

  const acceptVoiceTyping = useCallback(() => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    stopSpeechRecognition();
    setIsListening(false);
    isListeningRef.current = false;
    const transcript = transcriptionRef.current;
    if (transcript.trim()) {
      setInputText(transcript);
    }
    transcriptionRef.current = '';
    setTranscriptionText('');
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  // --- Auto focus when streaming stops ---

  useEffect(() => {
    if (!isStreaming && !disabled && !isListening) {
      inputRef.current?.focus();
    }
  }, [isStreaming, disabled, isListening]);

  // --- Prefill handling ---

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

  // --- Draft persistence ---

  useEffect(() => {
    if (!conversationId) return;
    loadDraft(conversationId).then((draft) => {
      if (draft) {
        setInputText(draft);
      }
    });
  }, [conversationId]);

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

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    inputScale.value = withSequence(
      withTiming(0.96, { duration: 80 }),
      withTiming(1, { duration: 100 })
    );
    onSend(text);
    if (conversationId) {
      clearDraft(conversationId);
    }
    onDraftChange?.('');
    setInputText('');
  }, [inputText, onSend, conversationId, onDraftChange]);

  const handleAbort = useCallback(() => {
    onAbort?.();
  }, [onAbort]);

  const placeholder = isStreaming ? 'Velness is responding...' : WARM_PLACEHOLDERS[0];

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
        // Voice Typing View
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

          <Text
            style={[
              styles.transcriptionText,
              { color: transcriptionText ? colors.text.primary : colors.text.secondary },
            ]}
            numberOfLines={2}
          >
            {transcriptionText || 'Listening... Speak now...'}
          </Text>

          <View style={styles.voiceActions}>
            <Pressable
              onPress={cancelVoiceTyping}
              style={[styles.voiceActionBtn, styles.cancelBtn, { borderColor: colors.border.default }]}
              accessibilityLabel="Cancel voice typing"
              accessibilityRole="button"
            >
              <X size={18} color={colors.text.secondary} />
            </Pressable>
            <Pressable
              onPress={transcriptionText.trim() ? acceptVoiceTyping : stopVoiceTyping}
              style={[
                styles.voiceActionBtn,
                styles.acceptBtn,
                {
                  backgroundColor: transcriptionText.trim()
                    ? colors.brand.primary
                    : colors.surface.secondary,
                },
              ]}
              accessibilityLabel={transcriptionText.trim() ? 'Accept transcription' : 'Stop listening'}
              accessibilityRole="button"
            >
              {transcriptionText.trim() ? (
                <Check size={18} color={colors.brand.contrastText} />
              ) : (
                <Square size={14} color={colors.text.secondary} fill={colors.text.secondary} />
              )}
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

          {/* Voice button (left of send) */}
          {!disabled && !isStreaming && (
            <Pressable
              onPress={startVoiceTyping}
              style={({ pressed }) => [
                styles.micButton,
                {
                  backgroundColor: pressed ? colors.brand.primary + '18' : colors.surface.secondary,
                },
              ]}
              accessibilityLabel="Voice typing"
              accessibilityRole="button"
            >
              <AudioLines size={18} color={colors.brand.primary} />
            </Pressable>
          )}

          {disabled && !isStreaming && (
            <View style={[styles.micButton, { backgroundColor: colors.surface.secondary }]}>
              <MicOff size={16} color={colors.text.secondary} />
            </View>
          )}

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
    marginLeft: 8,
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
