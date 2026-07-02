import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_KEY_PREFIX = 'neeva_chat_draft_';

export async function saveDraft(conversationId: string, text: string): Promise<void> {
  if (!text.trim()) {
    await AsyncStorage.removeItem(`${DRAFT_KEY_PREFIX}${conversationId}`);
    return;
  }
  await AsyncStorage.setItem(`${DRAFT_KEY_PREFIX}${conversationId}`, text);
}

export async function loadDraft(conversationId: string): Promise<string> {
  return (await AsyncStorage.getItem(`${DRAFT_KEY_PREFIX}${conversationId}`)) ?? '';
}

export async function clearDraft(conversationId: string): Promise<void> {
  await AsyncStorage.removeItem(`${DRAFT_KEY_PREFIX}${conversationId}`);
}
