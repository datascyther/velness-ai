import React, { useState, useCallback } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, AlertTriangle } from 'lucide-react-native';
import { useUserId } from '@/shared/hooks/useAuth';

const REPORT_REASONS = [
  { key: 'inappropriate', label: 'Inappropriate Content' },
  { key: 'harassment', label: 'Harassment or Bullying' },
  { key: 'spam', label: 'Spam or Misleading' },
  { key: 'other', label: 'Other' },
];

export default function ReportScreen() {
  const { targetType, targetId } = useLocalSearchParams<{
    targetType: string;
    targetId: string;
  }>();
  const router = useRouter();
  const uid = useUserId();
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCustom, setSelectedCustom] = useState('');

  const handleSubmit = useCallback(() => {
    const reason = selectedCustom || selectedReason;
    if (!uid || !reason || !targetType || !targetId) return;
    router.back();
  }, [selectedReason, selectedCustom, uid, targetType, targetId, router]);

  const reason = selectedCustom || selectedReason;

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
            Report Content
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="bg-neeva-red-600/10 rounded-glass p-4 border border-red-500/20 mb-6 flex-row items-start">
            <AlertTriangle size={20} color="#F87171" />
            <Text className="text-red-300 text-body-sm ml-3 flex-1">
              Reporting is anonymous. Your identity will not be shared with the person who posted this content.
            </Text>
          </View>

          <Text className="text-white/60 text-body-sm font-medium mb-3">
            Select a reason
          </Text>

          {REPORT_REASONS.map((r) => (
            <Pressable
              key={r.key}
              onPress={() => {
                setSelectedReason(r.key);
                setSelectedCustom('');
              }}
              className={`rounded-glass px-4 py-3 mb-2 border active:opacity-70 ${
                selectedReason === r.key
                  ? 'bg-neeva-purple-600/30 border-neeva-purple-500/50'
                  : 'bg-neeva-glass-dark/20 border-neeva-glass-border'
              }`}
            >
              <Text
                className={`text-body-sm ${
                  selectedReason === r.key ? 'text-white font-semibold' : 'text-white/70'
                }`}
              >
                {r.label}
              </Text>
            </Pressable>
          ))}

          <TextInput
            className="bg-neeva-glass-dark/20 rounded-glass px-4 py-3 text-white text-body border border-neeva-glass-border mt-4 mb-6"
            placeholder="Custom reason..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={selectedCustom}
            onChangeText={(t) => {
              setSelectedCustom(t);
              setSelectedReason('');
            }}
            maxLength={200}
          />

          <Text className="text-white/60 text-body-sm font-medium mb-2">
            Additional details (optional)
          </Text>
          <TextInput
            className="bg-neeva-glass-dark/20 rounded-glass px-4 py-3 text-white text-body border border-neeva-glass-border min-h-[100px] mb-8"
            placeholder="Provide more context..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={1000}
            textAlignVertical="top"
          />

          <Pressable
            onPress={handleSubmit}
            disabled={!reason}
            className={`rounded-glass py-4 items-center ${
              reason
                ? 'bg-red-500 active:opacity-70'
                : 'bg-red-500/30'
            }`}
          >
            <Text className="text-white text-body font-semibold">Submit Report</Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
