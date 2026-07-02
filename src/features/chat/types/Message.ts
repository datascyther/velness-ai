export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageType = 'markdown' | 'reflection' | 'exercise' | 'journal' | 'breathing' | 'cbt-exercise' | 'wellness' | 'insight';

export type MessageStatus = 'sending' | 'streaming' | 'complete' | 'failed';

export interface MessageMetadata {
  reasoning?: string;
  errorMessage?: string;
  sources?: { title: string; url: string }[];
  mood?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  createdAt: Date;
  status: MessageStatus;
  metadata?: MessageMetadata;
}

export function validateMessage(value: unknown): value is Message {
  if (typeof value !== 'object' || value === null) return false;
  const m = value as Record<string, unknown>;
  return (
    typeof m.id === 'string' &&
    typeof m.role === 'string' &&
    ['user', 'assistant', 'system'].includes(m.role) &&
    typeof m.type === 'string' &&
    ['markdown', 'reflection', 'exercise', 'journal', 'breathing', 'cbt-exercise', 'wellness', 'insight'].includes(m.type) &&
    typeof m.content === 'string' &&
    m.createdAt instanceof Date &&
    typeof m.status === 'string' &&
    ['sending', 'streaming', 'complete', 'failed'].includes(m.status)
  );
}
