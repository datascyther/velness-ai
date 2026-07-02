import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Message } from '@/features/chat/types';

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => {
  const mockSetDoc = vi.fn().mockResolvedValue(undefined);
  const mockDoc = vi.fn((_db, _collection, _uid, _collection2, id) => ({ id }));
  const mockCollection = vi.fn((_db, path) => ({ path }));
  const mockQuery = vi.fn((...args) => ({ type: 'query', args }));
  const mockOrderBy = vi.fn((field, dir) => ({ field, dir }));
  const mockGetDocs = vi.fn().mockResolvedValue({ docs: [], empty: true });
  const mockTimestamp = {
    fromDate: vi.fn((d: Date) => ({ seconds: Math.floor(d.getTime() / 1000), nanoseconds: 0 })),
    toDate: vi.fn(),
  };

  return {
    collection: mockCollection,
    doc: mockDoc,
    setDoc: mockSetDoc,
    query: mockQuery,
    orderBy: mockOrderBy,
    getDocs: mockGetDocs,
    Timestamp: mockTimestamp,
    where: vi.fn((field, op, value) => ({ field, op, value })),
    limit: vi.fn((n) => ({ limit: n })),
  };
});

import { ChatRepository } from './ChatRepository';

describe('ChatRepository', () => {
  let repo: ChatRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new ChatRepository();
  });

  describe('saveMessages', () => {
    const makeMsg = (id: string, status: Message['status']): Message => ({
      id,
      role: 'user',
      type: 'markdown',
      content: 'Hello',
      createdAt: new Date(),
      status,
    });

    it('filters out messages with status !== complete', async () => {
      const msgs = [
        makeMsg('1', 'complete'),
        makeMsg('2', 'streaming'),
        makeMsg('3', 'failed'),
        makeMsg('4', 'complete'),
      ];

      await repo.saveMessages('test-uid', msgs, 'conv-1');

      const { setDoc } = await import('firebase/firestore');
      expect(setDoc).toHaveBeenCalledTimes(2);
      const callIds = (setDoc as ReturnType<typeof vi.fn>).mock.calls.map(
        (call: any[]) => call[0].id
      );
      expect(callIds).toEqual(['1', '4']);
    });

    it('adds conversationId to each message', async () => {
      const msgs = [makeMsg('1', 'complete')];

      await repo.saveMessages('test-uid', msgs, 'conv-1');

      const { setDoc } = await import('firebase/firestore');
      const data = (setDoc as ReturnType<typeof vi.fn>).mock.calls[0][1];
      expect(data.conversationId).toBe('conv-1');
    });
  });
});
