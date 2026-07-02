import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { EmptyConversation } from './EmptyConversation';

interface ConversationListProps {
  messages: any[];
  onQuickStarterPress?: (text: string) => void;
  children?: React.ReactNode;
}

export function ConversationList({
  messages,
  onQuickStarterPress,
  children,
}: ConversationListProps) {
  const { colors } = useTheme();
  const isEmpty = messages.length === 0;

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={[
        styles.scrollContent,
        isEmpty && styles.emptyScrollContent,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {isEmpty ? (
        <EmptyConversation onQuickStarterPress={onQuickStarterPress} />
      ) : (
        <View style={styles.messagesList}>
          {children}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  emptyScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  messagesList: {
    flex: 1,
    gap: 16,
  },
});

export default ConversationList;
