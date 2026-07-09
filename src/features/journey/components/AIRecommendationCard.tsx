import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Clock, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/core/theme';

interface AIRecommendationCardProps {
  title: string;
  description: string;
  reason: string;
  durationMinutes: number;
  isAIGenerated: boolean;
  onStart?: () => void;
}

export const AIRecommendationCard = React.memo(({
  title,
  description,
  reason,
  durationMinutes,
  isAIGenerated: _isAIGenerated,
  onStart,
}: AIRecommendationCardProps) => {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Animated.View
      entering={FadeInDown.delay(320).duration(500).springify()}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? colors.surface.primary : '#FFFFFF',
            borderColor: isDark ? colors.border.default : '#E5E7EB',
          },
        ]}
      >
        <View style={styles.topRow}>
          <View style={[styles.reasonBadge, { backgroundColor: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(108,76,241,0.08)' }]}>
            <Text style={[styles.reasonText, { color: isDark ? '#A78BFA' : '#6C4CF1' }]}>
              {reason}
            </Text>
          </View>
          <View style={styles.durationRow}>
            <Clock size={13} color={colors.text.secondary} />
            <Text style={[styles.durationText, { color: colors.text.secondary }]}>
              {durationMinutes} min
            </Text>
          </View>
        </View>

        <Text
          style={[styles.title, { color: colors.text.primary }]}
          numberOfLines={1}
        >
          {title}
        </Text>

        <Text
          style={[styles.description, { color: colors.text.secondary }]}
          numberOfLines={2}
        >
          {description}
        </Text>

        <Pressable
          onPress={onStart}
          style={[styles.startButton, { backgroundColor: isDark ? '#8B5CF6' : '#6C4CF1' }]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Start ${title}`}
        >
          <Text style={styles.startText}>Start</Text>
          <ArrowRight size={15} color="#FFFFFF" />
        </Pressable>
      </View>
    </Animated.View>
  );
});

AIRecommendationCard.displayName = 'AIRecommendationCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  reasonBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reasonText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    gap: 6,
  },
  startText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
