import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatHeader } from '../components/ChatHeader';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { MessageList } from '../components/MessageList';
import { ChatInput } from '../components/ChatInput';
import { useConversation } from '../conversation/useConversation';
import { saveDraft, loadSessionMeta } from '../persistence';
import { LAYOUT } from '@/shared/constants';
import { SessionContextProvider } from '../hooks/useSessionContext';

export function ChatScreen() {
  return (
    <SessionContextProvider>
      <ChatScreenContent />
    </SessionContextProvider>
  );
}

function ChatScreenContent() {
  const insets = useSafeAreaInsets();
  const keyboardOffset = Platform.OS === 'ios' ? insets.top : 0;
  const [pendingQuickStarter, setPendingQuickStarter] = useState<string | null>(null);

  const { state, controller, isRestored } = useConversation();

  // Quick Actions "AI Chat" can pass an opening prompt via the `prefill` route
  // param (HomeScreen → router.push({ pathname: CHAT, params: { prefill } })).
  const params = useLocalSearchParams<{ prefill?: string }>();
  useEffect(() => {
    const prefill = typeof params.prefill === 'string' ? params.prefill : null;
    if (prefill) setPendingQuickStarter(prefill);
  }, [params.prefill]);

  const handleQuickStarterSelect = useCallback((text: string) => {
    setPendingQuickStarter(text);
  }, []);

  const handlePrefillSent = useCallback(() => {
    setPendingQuickStarter(null);
  }, []);

  const handleDraftChange = useCallback((text: string) => {
    if (state.conversationId) {
      saveDraft(state.conversationId, text);
    }
  }, [state.conversationId]);

  useEffect(() => {
    loadSessionMeta().then((meta) => {
      if (meta?.lastConversationId && meta.lastConversationId !== state.conversationId) {
        // Session meta indicates a prior conversation; draft loading handled by ChatInput via conversationId
      }
    });
  }, [state.conversationId]);

  const inConversation = state.messages.length > 0;
  const sessionStartedAt = inConversation ? state.messages[0].createdAt : undefined;

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={keyboardOffset}
      >
        <ChatHeader
          title="Velness"
          showBackButton={inConversation}
          onBackPress={controller.clear}
          inConversation={inConversation}
          sessionStartedAt={sessionStartedAt}
        />

        <MessageList
          state={state}
          onRefresh={controller.refresh}
          onQuickStarterSelect={handleQuickStarterSelect}
          onRetry={controller.retry}
          onDismiss={controller.dismissMessage}
          isRestored={isRestored}
          onDelete={controller.deleteMessage}
          onRegenerate={controller.regenerate}
          onResumeLastConversation={controller.resumeLastConversation}
        />

        <ChatInput
          onSend={controller.sendMessage}
          onAbort={controller.abort}
          isStreaming={state.status === 'streaming'}
          paddingBottom={insets.bottom + LAYOUT.TAB_BAR_HEIGHT + LAYOUT.CHAT_COMPOSER_SPACING}
          prefillText={pendingQuickStarter}
          onPrefillSent={handlePrefillSent}
          conversationId={state.conversationId}
          onDraftChange={handleDraftChange}
        />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
});

export default ChatScreen;
