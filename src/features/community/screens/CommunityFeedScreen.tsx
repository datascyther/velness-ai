import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Users, MessageCircle } from 'lucide-react-native';
import { useUserId } from '@/shared/hooks/useAuth';
import { useRealtimeFeed } from '@/hooks/realtime/useRealtimeFeed';
import { useToggleReaction } from '@/hooks/mutations/useCommunityMutations';
import { PostCard } from '@/features/community/components/PostCard';
import { CreatePostFAB } from '@/features/community/components/CreatePostFAB';
import type { CommunityPost } from '@/features/community/types';

export default function CommunityFeedScreen() {
  const router = useRouter();
  const uid = useUserId();
  const { data: posts, isLoading, refetch } = useRealtimeFeed(uid);
  const toggleReaction = useToggleReaction();
  const [userReactions, setUserReactions] = useState<Record<string, string | null>>({});

  const handleReactionToggle = useCallback(
    (postId: string, type: string) => {
      if (!uid) return;
      setUserReactions((prev) => ({
        ...prev,
        [postId]: prev[postId] === type ? null : type,
      }));
      toggleReaction.mutate({ postId, userId: uid, type });
    },
    [uid, toggleReaction],
  );

  const renderItem = useCallback(
    ({ item }: { item: CommunityPost }) => (
      <PostCard
        post={item}
        currentUserId={uid}
        userReaction={userReactions[item.id] ?? null}
        onPress={() => router.push(`/(tabs)/community/post/${item.id}`)}
        onReactionToggle={(type) => handleReactionToggle(item.id, type)}
        onReport={() => router.push(`/(tabs)/community/report/post/${item.id}`)}
        onDelete={() => {}}
      />
    ),
    [uid, userReactions, router, handleReactionToggle],
  );

  if (!uid) {
    return (
      <SafeAreaView className="flex-1 bg-app-dark" edges={['top']}>
        <StatusBar style="light" />
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-white/40 text-body">Sign in to see the feed</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-app-dark" edges={['top']}>
      <StatusBar style="light" />
      <View className="flex-1 px-5">
        <View className="pt-4 pb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-white/40 text-label font-medium">Community</Text>
            <Text className="text-white text-card-title font-semibold mt-1">Feed</Text>
          </View>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => router.push('/(tabs)/community/moderation')}
              className="bg-neeva-glass-dark/20 w-10 h-10 rounded-full items-center justify-center active:opacity-70"
            >
              <MessageCircle size={20} color="rgba(255,255,255,0.5)" />
            </Pressable>
            <Pressable
              onPress={() => router.push('/(tabs)/community')}
              className="bg-neeva-glass-dark/20 w-10 h-10 rounded-full items-center justify-center active:opacity-70"
            >
              <Users size={20} color="rgba(255,255,255,0.5)" />
            </Pressable>
          </View>
        </View>

        <FlatList
          data={posts ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor="rgba(255,255,255,0.5)"
            />
          }
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            isLoading ? (
              <View className="flex-1 justify-center items-center pt-20">
                <ActivityIndicator color="rgba(255,255,255,0.3)" />
              </View>
            ) : (
              <View className="flex-1 justify-center items-center pt-20">
                <View className="bg-neeva-cyan-600/20 w-20 h-20 rounded-full items-center justify-center mb-6">
                  <Users size={36} color="#06B6D4" />
                </View>
                <Text className="text-white text-card-title font-semibold mb-2">
                  No Posts Yet
                </Text>
                <Text className="text-white/40 text-body text-center max-w-xs mb-6">
                  Create a post to share your thoughts with your groups.
                </Text>
                <Pressable
                  onPress={() => router.push('/(tabs)/community/post/create')}
                  className="bg-neeva-purple-600 rounded-glass px-6 py-3 active:opacity-70"
                >
                  <Text className="text-white text-body font-semibold">
                    Create a Post
                  </Text>
                </Pressable>
              </View>
            )
          }
        />

        <CreatePostFAB onPress={() => router.push('/(tabs)/community/post/create')} />
      </View>
    </SafeAreaView>
  );
}
