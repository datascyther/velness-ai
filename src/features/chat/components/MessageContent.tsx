import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { MessageRenderer } from './MessageRenderer';
import type { Message } from '../types/Message';

interface MessageContentProps {
  message: Message;
}

const variantBaseStyles = {
  ai: { fontSize: 16, lineHeight: 26 },
  user: { fontSize: 14, lineHeight: 20 },
};

export const MessageContent = React.memo(function MessageContent({ message }: MessageContentProps) {
  const { colors } = useTheme();
  const variant = message.role === 'user' ? 'user' : 'ai';
  const color = variant === 'user' ? colors.brand.contrastText : colors.text.primary;
  const baseStyle = { ...variantBaseStyles[variant], color };

  return (
    <MessageRenderer
      message={message}
      baseStyle={baseStyle}
      codeBackground={colors.surface.primary}
      linkColor={colors.brand.primary}
      blockquoteBackground={colors.surface.secondary}
      blockquoteBorder={colors.brand.secondary}
    />
  );
});

export default MessageContent;
