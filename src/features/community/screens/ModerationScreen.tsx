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
import { useModerateReport } from '@/hooks/mutations/useCommunityMutations';
import type { Report } from '@/features/community/types';

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
  const uid = useUserId();
  const moderateReport = useModerateReport();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');

  React.useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setReports([]);
      } catch {
        setReports([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [filter]);

  const handleDismiss = useCallback(
    (report: Report) => {
      if (!uid) return;
      moderateReport.mutate({
        reportId: report.id,
        status: 'dismissed',
        reviewedBy: uid,
        action: 'dismiss',
        targetId: report.targetId,
      });
      setReports((prev) => prev.filter((r) => r.id !== report.id));
    },
    [uid, moderateReport],
  );

  const handleAction = useCallback(
    (report: Report) => {
      if (!uid) return;
      moderateReport.mutate({
        reportId: report.id,
        status: 'actioned',
        reviewedBy: uid,
        action: 'flag',
        targetId: report.targetId,
      });
      setReports((prev) => prev.filter((r) => r.id !== report.id));
    },
    [uid, moderateReport],
  );

  const renderItem = useCallback(
    ({ item }: { item: Report }) => (
      <View className="bg-neeva-glass-dark/20 rounded-glass p-4 mb-3 border border-neeva-glass-border">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-row items-center">
            <AlertTriangle size={16} color="#FBBF24" />
            <Text className="text-white text-body-sm font-semibold ml-2 capitalize">
              {item.reason}
            </Text>
          </View>
          <View
            className={`px-2 py-0.5 rounded-full ${
              item.status === 'pending'
                ? 'bg-yellow-500/20'
                : item.status === 'reviewed'
                  ? 'bg-blue-500/20'
                  : item.status === 'actioned'
                    ? 'bg-red-500/20'
                    : 'bg-green-500/20'
            }`}
          >
            <Text
              className={`text-label font-medium ${
                item.status === 'pending'
                  ? 'text-yellow-300'
                  : item.status === 'reviewed'
                    ? 'text-blue-300'
                    : item.status === 'actioned'
                      ? 'text-red-300'
                      : 'text-green-300'
              }`}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View className="mb-2">
          <Text className="text-white/50 text-label">
            Target: {item.targetType} — {item.targetId.slice(0, 12)}...
          </Text>
          <Text className="text-white/50 text-label">
            Reported by: {item.reporterId.slice(0, 12)}...
          </Text>
          <Text className="text-white/50 text-label">
            {formatTimestamp(item.createdAt)}
          </Text>
        </View>

        {item.description ? (
          <Text className="text-white/70 text-body-sm mb-3 bg-neeva-glass-dark/20 rounded-glass p-2">
            {item.description}
          </Text>
        ) : null}

        {item.status === 'pending' && (
          <View className="flex-row gap-2 mt-2">
            <Pressable
              onPress={() => handleDismiss(item)}
              disabled={moderateReport.isPending}
              className="flex-1 flex-row items-center justify-center bg-green-500/20 rounded-glass py-2.5 border border-green-500/30 active:opacity-70"
            >
              <Check size={16} color="#4ADE80" />
              <Text className="text-green-300 text-body-sm font-medium ml-1.5">
                Dismiss
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleAction(item)}
              disabled={moderateReport.isPending}
              className="flex-1 flex-row items-center justify-center bg-red-500/20 rounded-glass py-2.5 border border-red-500/30 active:opacity-70"
            >
              <Trash2 size={16} color="#F87171" />
              <Text className="text-red-300 text-body-sm font-medium ml-1.5">
                Remove Post
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    ),
    [uid, moderateReport, handleDismiss, handleAction],
  );

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

        <View className="flex-row gap-2 mb-4">
          {['pending', 'reviewed', 'actioned', 'dismissed'].map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full ${
                filter === f
                  ? 'bg-neeva-purple-600'
                  : 'bg-neeva-glass-dark/20 border border-neeva-glass-border'
              }`}
            >
              <Text
                className={`text-label font-medium capitalize ${
                  filter === f ? 'text-white' : 'text-white/50'
                }`}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator color="rgba(255,255,255,0.3)" />
          </View>
        ) : (
          <FlatList
            data={reports}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center pt-20">
                <Shield size={40} color="rgba(255,255,255,0.2)" />
                <Text className="text-white/40 text-body-sm mt-4">
                  No reports with status "{filter}"
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
