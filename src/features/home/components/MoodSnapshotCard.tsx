import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { getMoodLabel, getMoodEmotion } from '@/shared/types';
import type { Mood } from '@/shared/types';
import { EmotionAvatar } from '@/components/emotion/EmotionAvatar';

interface MoodSnapshotCardProps {
  mood: Mood | null;
  onPress?: () => void;
}

function getMoodSnapshotSupport(rating: number): string {
  if (rating >= 5) return 'Keep up the great work!';
  if (rating >= 4) return 'A calm state of mind.';
  if (rating >= 3) return 'Taking time to check in matters.';
  return 'It\'s okay — Velness is here for you.';
}

export function MoodSnapshotCard({
  mood,
  onPress,
}: MoodSnapshotCardProps) {
  const { colors } = useTheme();
  const rating = mood?.rating ?? 3;
  const emotion = mood ? getMoodEmotion(rating) : 'calm';
  const label = mood ? `You're feeling ${getMoodLabel(rating).toLowerCase()}` : "You're feeling balanced";
  const support = mood ? getMoodSnapshotSupport(rating) : 'Keep up the good work.';

  return (
    <Animated.View
      entering={FadeInDown.delay(200).duration(600).springify()}
    >
      <Pressable
        onPress={onPress}
        style={[styles.card, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]}
        accessibilityRole="button"
        accessibilityLabel={`Mood Snapshot. ${label}. ${support}`}
      >
        <View style={styles.left}>
          <View style={[styles.emojiContainer, { backgroundColor: `${colors.brand.primary}1A` }]}>
            <EmotionAvatar emotion={emotion} size={28} animated={false} showGlow={false} />
          </View>
          <View style={styles.center}>
            <Text style={[styles.label, { color: colors.brand.primary }]}>Mood Snapshot</Text>
            <Text style={[styles.status, { color: colors.text.primary }]}>{label}</Text>
            <Text style={[styles.support, { color: colors.text.secondary }]}>{support}</Text>
          </View>
        </View>
        <ChevronRight size={20} color={colors.text.secondary} style={{ opacity: 0.6 }} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  emoji: {
    fontSize: 24,
  },
  emotionAvatar: {
    width: 28,
    height: 28,
  },
  center: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  support: {
    fontSize: 13,
  },
});

export default MoodSnapshotCard;
