// src/features/home/components/TodaysMissionCard.tsx
//
// A compact "medium" card showing today's focus — the current lesson title
// from the active journey. Phase 5: adds estimated time, reason, and CTA pill.

import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Target, Clock, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { shadows } from '@/core/theme';

interface TodaysMissionCardProps {
  missionTitle: string;
  missionDescription?: string;
  estimatedTime?: string;
  reason?: string;
  onPress?: () => void;
}

export function TodaysMissionCard({
  missionTitle,
  missionDescription,
  estimatedTime,
  reason,
  onPress,
}: TodaysMissionCardProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 14, stiffness: 300 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 280 });
  }, [scale]);

  // Derive estimated time if not provided
  const displayTime = estimatedTime ?? (missionDescription?.toLowerCase().includes('breathing')
    ? '5 min' : missionDescription?.toLowerCase().includes('meditation')
    ? '10 min' : '1 min');

  return (
    <Animated.View
      entering={FadeInDown.delay(140).duration(500)}
      style={[styles.container, animatedStyle]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          {
            backgroundColor: colors.surface.primary,
            borderColor: colors.border.default,
          },
          shadows.sm,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Today's mission: ${missionTitle}`}
      >
        <View style={[styles.iconRow, { backgroundColor: `${'#F59E0B'}18` }]}>
          <Target size={18} color="#F59E0B" />
        </View>
        <Text style={[styles.eyebrow, { color: '#F59E0B' }]}>Today's Focus</Text>
        <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={3}>
          {missionTitle}
        </Text>

        {reason && (
          <View style={styles.reasonContainer}>
            <Text style={[styles.reasonLabel, { color: colors.text.tertiary }]}>
              Recommended because
            </Text>
            <Text style={[styles.reasonText, { color: colors.text.secondary }]}>
              {reason}
            </Text>
          </View>
        )}

        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: colors.text.tertiary }]}>
            Estimated
          </Text>
          <View style={styles.metaItem}>
            <Clock size={12} color={colors.text.tertiary} />
            <Text style={[styles.metaText, { color: colors.text.primary }]}>
              {displayTime}
            </Text>
          </View>
        </View>

        {/* CTA pill */}
        <View style={[styles.ctaPill, { backgroundColor: `${'#F59E0B'}18` }]}>
          <Text style={[styles.ctaText, { color: '#F59E0B' }]}>Begin</Text>
          <ArrowRight size={12} color="#F59E0B" />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 6,
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
  reasonContainer: {
    marginTop: 6,
    gap: 2,
  },
  reasonLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  reasonText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 1,
  },
  metaRow: {
    marginTop: 8,
    gap: 4,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  ctaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 6,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TodaysMissionCard;
