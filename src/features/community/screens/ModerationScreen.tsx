import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ArrowLeft, Shield, Check, X, AlertTriangle, Trash2 } from 'lucide-react-native';
import { useUserId } from '@/shared/hooks/useAuth';

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
}

export default function ModerationScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-app-dark" edges={['top']}>
      <StatusBar style="light" />
      <View className="flex-1 px-5">
        <View className="pt-4 pb-4 flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center active:opacity-70"
          >
            <ArrowLeft size={22} color="white" />
          </Pressable>
          <Text className="text-white text-card-title font-semibold ml-4">
            Moderation
          </Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <Text className="text-white/40">Community is disabled</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
