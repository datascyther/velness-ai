/**
 * UserMessageBubble
 *
 * Right-aligned pill bubble for user messages.
 *
 * Grouping rules (iMessage-style):
 *  - Corner radius flattened on the top-right for grouped messages
 *    (messages consecutive within the same user turn)
 *  - Timestamp shown only on the last in the group
 *
 * Animation:
 *  - SlideInRight for send, routed through BaseMessageBubble
 */

import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Pressable, Share } from 'react-native';
import * as ExpoClipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { BaseMessageBubble } from './BaseMessageBubble';
import { MessageContent } from './MessageContent';
import { MessageTimestamp } from './MessageTimestamp';
import { MessageActionSheet } from './MessageActionSheet';
import { getBubbleRadius, getBubbleMarginBottom } from '../styles/bubbleVariants';
import { chat } from '@/core/theme/tokens';
import type { Message } from '../types/Message';

interface UserMessageBubbleProps {
  message: Message;
  onCopy?: (text: string) => void;
  onDelete?: (id: string) => void;
  isGrouped?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

export const UserMessageBubble = React.memo(function UserMessageBubble({
  message,
  onCopy,
  onDelete,
  isGrouped = false,
  isFirst = true,
  isLast = true,
}: UserMessageBubbleProps) {
  const { colors } = useTheme();
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const showTimestamp = !isGrouped || isLast;

  const handleCopy = useCallback(async () => {
    if (!message.content) return;
    try {
      await ExpoClipboard.setStringAsync(message.content);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    onCopy?.(message.content);
  }, [message.content, onCopy]);

  const handleShare = useCallback(async () => {
    if (!message.content) return;
    try {
      await Share.share({ message: message.content, title: 'Message from Velness' });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  }, [message.content]);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActionSheetVisible(true);
  }, []);

  const actionSheetActions = [
    { label: 'Copy', onPress: handleCopy },
    { label: 'Share', onPress: handleShare },
    ...(onDelete ? [{ label: 'Delete', onPress: () => onDelete(message.id), destructive: true }] : []),
  ];

  const radiusStyle = getBubbleRadius('user', { isGrouped, isFirst, isLast });
  const marginBottom = getBubbleMarginBottom(isGrouped && !isLast);

  return (
    <BaseMessageBubble
      role="user"
      containerStyle={[styles.outerRow, { marginBottom }]}
    >
      <View style={[styles.wrapper, { maxWidth: chat.bubble.maxWidthUser }]}>
        <Pressable
          onLongPress={handleLongPress}
          accessibilityHint="Long press for more options"
        >
          <View
            style={[
              styles.bubble,
              radiusStyle,
              {
                backgroundColor: colors.brand.primary,
                shadowColor: colors.brand.primary,
              },
            ]}
          >
            <MessageContent message={message} />
          </View>
        </Pressable>

        {showTimestamp && (
          <MessageTimestamp date={message.createdAt} style={styles.timestamp} />
        )}
      </View>

      <MessageActionSheet
        visible={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}
        actions={actionSheetActions}
      />
    </BaseMessageBubble>
  );
});

const styles = StyleSheet.create({
  outerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  wrapper: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  bubble: {
    paddingHorizontal: chat.bubble.paddingHUser,
    paddingVertical: chat.bubble.paddingVUser,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  timestamp: {
    marginTop: 4,
    marginRight: 2,
  },
});

export default UserMessageBubble;
