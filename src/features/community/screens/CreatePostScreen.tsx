import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useUserId } from '@/shared/hooks/useAuth';

export default function CreatePostScreen() {
  const router = useRouter();
  const uid = useUserId();

  return (
    <SafeAreaView className="flex-1 bg-app-dark" edges={['top']}>
      <StatusBar style="light" />
      <View className="flex-1 px-5">
        <View className="pt-4 pb-6 flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center active:opacity-70"
          >
            <ArrowLeft size={22} color="white" />
          </Pressable>
          <Text className="text-white text-card-title font-semibold ml-4">
            Create Post
          </Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <Text className="text-white/40">Community is disabled</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
