import React, { useCallback } from 'react';
import { View, Text, FlatList } from 'react-native';
import type { PostComment } from '@/features/community/types';

interface CommentListProps {
  comments: PostComment[];
  currentUserId: string | null;
  onDelete?: (commentId: string) => void;
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
}

export function CommentList({ comments, currentUserId, onDelete }: CommentListProps) {
  const renderItem = useCallback(
    ({ item }: { item: PostComment }) => {
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
