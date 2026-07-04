import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Send, Flag, Trash2, MoreHorizontal } from 'lucide-react-native';
import { useUserId } from '@/shared/hooks/useAuth';
import { Avatar } from '@/shared/components/Avatar';
import { ReactionBar } from '@/features/community/components/ReactionBar';
import { CommentList } from '@/features/community/components/CommentList';

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const uid = useUserId();

  const [input, setInput] = useState('');

  if (!postId) {
    return (
      <SafeAreaView className="flex-1 bg-app-dark" edges={['top']}>
        <View className="flex-1 justify-center items-center">
          <Text className="text-white/40">Post not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-app-dark" edges={['top']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View className="px-4 py-3 flex-row items-center border-b border-neeva-glass-border">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center active:opacity-70"
          >
            <ArrowLeft size={22} color="white" />
          </Pressable>
          <Text className="text-white text-body font-semibold ml-2 flex-1">
            Post
          </Text>
        </View>

        <View className="flex-1 justify-center items-center">
          <Text className="text-white/40">Community is disabled</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
