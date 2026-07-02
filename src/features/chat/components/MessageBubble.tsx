import React from 'react';
import type { Message } from '../types';
import { AIMessageBubble } from './AIMessageBubble';
import { UserMessageBubble } from './UserMessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ErrorBubble } from './ErrorBubble';

interface MessageBubbleProps {
  message: Message;
  onRetry: () => void;
  onDismiss: (id: string) => void;
  onDelete?: (id: string) => void;
  onRegenerate?: () => void;
  onCopy?: (text: string) => void;
  onFeedback?: (type: 'helpful' | 'unhelpful') => void;
  isGrouped?: boolean;
}

export const MessageBubble = React.memo(function MessageBubble({ message, onRetry, onDismiss, onDelete, onRegenerate, onCopy, onFeedback, isGrouped }: MessageBubbleProps) {
  if (message.role === 'user') {
    return <UserMessageBubble message={message} onCopy={onCopy} onDelete={onDelete} isGrouped={isGrouped} />;
  }

  if (message.status === 'streaming' && message.content === '') {
    return <TypingIndicator />;
  }

  if (message.status === 'failed') {
    return (
      <ErrorBubble
        message={message.metadata?.errorMessage ?? 'Something went wrong. Tap to retry.'}
        onRetry={onRetry}
        onDismiss={() => onDismiss(message.id)}
      />
    );
  }

  return <AIMessageBubble message={message} onCopy={onCopy} onFeedback={onFeedback} onDelete={onDelete} onRegenerate={onRegenerate} isGrouped={isGrouped} />;
});

export default MessageBubble;
