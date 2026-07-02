import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Pressable, Share } from 'react-native';
import * as ExpoClipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { BaseMessageBubble } from './BaseMessageBubble';
import { MessageContent } from './MessageContent';
import { MessageTimestamp } from './MessageTimestamp';
import { MessageActionSheet } from './MessageActionSheet';
import { userBubble } from '../styles/bubbleVariants';
import type { Message } from '../types/Message';
import { spacing } from '@/core/theme/tokens';

interface UserMessageBubbleProps {
  message: Message;
  onCopy?: (text: string) => void;
  onDelete?: (id: string) => void;
  isGrouped?: boolean;
}

export const UserMessageBubble = React.memo(function UserMessageBubble({ message, onCopy, onDelete, isGrouped }: UserMessageBubbleProps) {
  const { colors } = useTheme();
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

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
      await Share.share({ message: message.content, title: 'Message from Neeva' });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  }, [message.content]);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActionSheetVisible(true);
  }, []);

  const actionSheetActions = [
    {
      label: 'Copy',
      onPress: handleCopy,
    },
    {
      label: 'Share',
      onPress: handleShare,
    },
    ...(onDelete ? [{ label: 'Delete', onPress: () => onDelete(message.id), destructive: true }] : []),
  ];

  return (
    <BaseMessageBubble containerStyle={[userBubble.container, isGrouped && { marginBottom: spacing.xs }]}>
      <View style={userBubble.wrapper}>
        <Pressable
          onLongPress={handleLongPress}
          accessibilityHint="Long press for more options"
        >
          <View style={[userBubble.bubble, { backgroundColor: colors.brand.primary, shadowColor: colors.brand.primary }]}>
            <MessageContent message={message} />
          </View>
        </Pressable>
        <MessageTimestamp date={message.createdAt} style={styles.timestampStyle} />
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
  timestampStyle: {
    marginRight: 4,
  },
});

export default UserMessageBubble;
