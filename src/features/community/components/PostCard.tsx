import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MessageCircle, MoreHorizontal, Trash2, Flag } from 'lucide-react-native';
import { Avatar } from '@/shared/components/Avatar';
import { ReactionBar } from './ReactionBar';

interface PostCardProps {
  post: any;
  currentUserId: string | null;
  userReaction: string | null;
  onPress: () => void;
  onReactionToggle: (type: string) => void;
  onReport?: () => void;
  onDelete?: () => void;
}

export function PostCard({
  post,
  currentUserId,
  userReaction,
  onPress,
  onReactionToggle,
  onReport,
  onDelete,
}: PostCardProps) {
  const isOwn = post.authorId === currentUserId;
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <Pressable
      onPress={onPress}
      className="bg-neeva-glass-dark/20 rounded-glass p-4 mb-3 border border-neeva-glass-border active:opacity-80"
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Avatar name={post.authorName} size="md" />
          <View className="ml-3">
            <Text className="text-white text-body-sm font-semibold">
              {post.authorName}
            </Text>
            <View className="flex-row items-center gap-2">
              {post.groupName && (
                <Text className="text-neeva-cyan-400 text-label">
                  {post.groupName}
                </Text>
              )}
              <Text className="text-white/30 text-label">
                {formatTimestamp(post.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        <View className="relative">
          <Pressable
            onPress={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 items-center justify-center active:opacity-70"
          >
            <MoreHorizontal size={18} color="rgba(255,255,255,0.5)" />
          </Pressable>

          {menuOpen && (
            <View className="absolute right-0 top-10 bg-neeva-glass-dark/90 rounded-glass border border-neeva-glass-border p-2 z-50 min-w-[140px]">
              {isOwn ? (
                <Pressable
                  onPress={() => {
                    setMenuOpen(false);
                    onDelete?.();
                  }}
                  className="flex-row items-center px-3 py-2 active:opacity-70"
                >
                  <Trash2 size={16} color="#F87171" />
                  <Text className="text-red-400 text-body-sm ml-2">Delete</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => {
                    setMenuOpen(false);
                    onReport?.();
                  }}
                  className="flex-row items-center px-3 py-2 active:opacity-70"
                >
                  <Flag size={16} color="rgba(255,255,255,0.5)" />
                  <Text className="text-white/70 text-body-sm ml-2">Report</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </View>

      <Text className="text-white text-body-sm leading-relaxed mb-3">
        {post.content}
      </Text>

      <ReactionBar
        reactionCounts={post.reactionCounts}
        userReaction={userReaction}
        onToggle={onReactionToggle}
      />

      <View className="flex-row items-center mt-3 pt-3 border-t border-neeva-glass-border">
        <MessageCircle size={16} color="rgba(255,255,255,0.4)" />
        <Text className="text-white/40 text-label ml-1.5">
          {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
        </Text>
      </View>

      {post.isFlagged && (
        <View className="mt-2 bg-red-500/10 rounded-glass px-2 py-1">
          <Text className="text-red-400 text-label">Flagged for review</Text>
        </View>
      )}
    </Pressable>
  );
}
