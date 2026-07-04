import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function CommunityFeedScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-app-dark" edges={['top']}>
      <StatusBar style="light" />
      <View className="flex-1 justify-center items-center">
        <Text className="text-white/40">Community is disabled</Text>
      </View>
    </SafeAreaView>
  );
}
