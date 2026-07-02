import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'neeva_chat_session';

export interface SessionMeta {
  lastConversationId: string | null;
  lastActiveAt: string;
  messageCount: number;
  mood?: string | null;
  journeyFocus?: string | null;
  sessionCount?: number;
  firstSessionDate?: string | null;
  streak?: number;
}

export async function saveSessionMeta(meta: SessionMeta): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(meta));
}

export async function loadSessionMeta(): Promise<SessionMeta | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as SessionMeta;
}

export async function clearSessionMeta(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
