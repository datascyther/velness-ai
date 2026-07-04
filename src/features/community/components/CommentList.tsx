import React, { useCallback } from 'react';
import { View, Text, FlatList } from 'react-native';

interface CommentListProps {
  comments: any[];
  currentUserId: string | null;
  onDelete?: (commentId: string) => void;
}

export function CommentList({ comments, currentUserId, onDelete }: CommentListProps) {
  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const isOwn = item.authorId === currentUserId;
      const isReply = !!item.parentCommentId;

      return (
        <View
          className={`bg-neeva-glass-dark/10 rounded-glass p-3 mb-2 border border-neeva-glass-border ${
            isReply ? 'ml-6' : ''
          }`}
        >
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-white text-body-sm font-semibold">
              {item.authorName}
            </Text>
            <Text className="text-white/30 text-label">
              {formatTimestamp(item.createdAt)}
            </Text>
          </View>
          <Text className="text-white/80 text-body-sm leading-relaxed">
            {item.content}
          </Text>
        </View>
      );
    },
    [currentUserId],
  );

  if (comments.length === 0) {
    return (
      <View className="py-8 items-center">
        <Text className="text-white/40 text-body-sm">No comments yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={comments}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      scrollEnabled={false}
    />
  );
}
