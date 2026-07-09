// src/features/home/components/ContinueJourneyCard.tsx
//
// The primary "continue" card — medium size, gradient accent border.
// Progress bar animates from 0 → current value on mount.

import React, { useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Play } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { shadows } from '@/core/theme';

interface ContinueJourneyCardProps {
  title: string;
  status?: 'not_started' | 'active' | 'completed';
  lastActivity?: string | null;
  currentStep: number;
  totalSteps: number;
  percent: number;
  onContinue: () => void;
  disabled?: boolean;
}

export const ContinueJourneyCard = React.memo(({
  title,
  status = 'active',
  lastActivity = null,
  currentStep,
  totalSteps,
  percent,
  onContinue,
  disabled = false,
}: ContinueJourneyCardProps) => {
  const { colors } = useTheme();

  // Progress bar animates from 0 → percent on mount
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(Math.min(100, Math.max(0, percent)), {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [percent, progress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const { eyebrowText, pausedText } = useMemo(() => {
    if (status === 'completed' || percent === 100) {
      return { eyebrowText: 'Next Recommendation', pausedText: null };
    }
    if (status === 'not_started' || percent === 0) {
      return { eyebrowText: 'Begin Journey', pausedText: null };
    }
    
    // Active or Paused
    let isPaused = false;
    let daysStr = '';
    if (lastActivity) {
      const diffMs = Date.now() - new Date(lastActivity).getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays >= 2) {
        isPaused = true;
        daysStr = diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
      }
    }

    if (isPaused) {
      return { eyebrowText: 'Resume', pausedText: daysStr };
    }

    return { eyebrowText: `Continue Lesson ${currentStep}`, pausedText: null };
  }, [status, percent, lastActivity, currentStep]);

  return (
    <Animated.View
      entering={FadeInUp.delay(100).duration(500)}
      style={styles.container}
    >
      <Pressable
        onPress={onContinue}
        disabled={disabled}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.surface.primary,
            borderColor: colors.border.default,
          },
          shadows.sm,
          pressed && { opacity: 0.88 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Continue ${title}. Lesson ${currentStep} of ${totalSteps}. ${percent}% complete.`}
      >
        {/* Icon */}
        <View style={[styles.iconRow, { backgroundColor: `${colors.brand.primary}18` }]}>
          <Play size={18} color={colors.brand.primary} fill={colors.brand.primary} />
        </View>

        <View style={styles.eyebrowRow}>
          <Text style={[styles.eyebrow, { color: colors.brand.primary }]}>
            {eyebrowText}
          </Text>
          {pausedText && (
            <Text style={[styles.pausedBadge, { color: colors.text.secondary }]}>
              {pausedText}
            </Text>
          )}
        </View>

        <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={2}>
          {title}
        </Text>

        <Text style={[styles.lesson, { color: colors.text.secondary }]}>
          Lesson {currentStep} of {totalSteps}
        </Text>

        {/* Animated progress track */}
        <View style={[styles.progressTrack, { backgroundColor: colors.surface.secondary }]}>
          <Animated.View
            style={[
              styles.progressFill,
              { backgroundColor: colors.brand.primary },
              progressStyle,
            ]}
          />
        </View>

        <Text style={[styles.percentText, { color: colors.brand.primary }]}>
          {percent}% complete
        </Text>
      </Pressable>
    </Animated.View>
  );
});

ContinueJourneyCard.displayName = 'ContinueJourneyCard';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 5,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pausedBadge: {
    fontSize: 10,
    fontWeight: '600',
  },
  iconRow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  lesson: {
    fontSize: 12,
    lineHeight: 17,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  percentText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default ContinueJourneyCard;
