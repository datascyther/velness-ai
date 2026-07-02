import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  orderBy,
  where,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ChatMessage as FirestoreChatMessage } from '@/shared/types';
import type { Message } from '@/features/chat/types';

const COLLECTION = 'users';

export class ChatRepository {
  async loadChatHistory(uid: string): Promise<FirestoreChatMessage[]> {
    if (!uid || !db) return [];

    try {
      const chatsRef = collection(db, COLLECTION, uid, 'chats');
      const chatsQuery = query(chatsRef, orderBy('timestamp', 'asc'));
      const snapshot = await getDocs(chatsQuery);

      return snapshot.docs.map((doc) => ({
        ...doc.data(),
        timestamp: (doc.data().timestamp as Timestamp).toDate(),
      })) as FirestoreChatMessage[];
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }

  async saveMessage(uid: string, message: FirestoreChatMessage): Promise<boolean> {
    if (!uid || !db) return false;

    try {
      const docRef = doc(db, COLLECTION, uid, 'chats', message.id);
      const data: Record<string, any> = {
        id: message.id,
        content: message.content,
        isUser: message.isUser,
        timestamp: Timestamp.fromDate(message.timestamp),
      };
      if (message.reasoning) {
        data.reasoning = message.reasoning;
      }
      await setDoc(docRef, data);
      return true;
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  }

  async saveMessages(uid: string, messages: Message[], conversationId: string): Promise<boolean> {
    if (!uid || !db) return false;

    try {
      const batch: Promise<void>[] = [];
      for (const msg of messages) {
        if (msg.status !== 'complete') continue;
        const docRef = doc(db, COLLECTION, uid, 'chats', msg.id);
        const data: Record<string, any> = {
          id: msg.id,
          content: msg.content,
          isUser: msg.role === 'user',
          timestamp: Timestamp.fromDate(msg.createdAt),
          conversationId,
        };
        batch.push(setDoc(docRef, data));
      }
      await Promise.all(batch);
      return true;
    } catch (error) {
      console.error('Error saving chat messages:', error);
      return false;
    }
  }

  async loadConversationMessages(uid: string, conversationId: string): Promise<Message[]> {
    if (!uid || !db) return [];

    try {
      const chatsRef = collection(db, COLLECTION, uid, 'chats');
      const chatsQuery = query(
        chatsRef,
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc')
      );
      const snapshot = await getDocs(chatsQuery);

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        const ts = (data.timestamp as Timestamp).toDate();
        return {
          id: data.id as string,
          role: data.isUser ? ('user' as const) : ('assistant' as const),
          type: 'markdown' as const,
          content: data.content as string,
          createdAt: ts,
          status: 'complete' as const,
        };
      });
    } catch (error) {
      console.error('Error loading conversation messages:', error);
      return [];
    }
  }

  async loadLatestConversationId(uid: string): Promise<string | null> {
    if (!uid || !db) return null;

    try {
      const chatsRef = collection(db, COLLECTION, uid, 'chats');
      const chatsQuery = query(chatsRef, orderBy('timestamp', 'desc'), limit(1));
      const snapshot = await getDocs(chatsQuery);
      if (snapshot.empty) return null;
      return snapshot.docs[0].data().conversationId as string | null;
    } catch (error) {
      console.error('Error loading latest conversation:', error);
      return null;
    }
  }
}

export const chatRepository = new ChatRepository();
export default chatRepository;
