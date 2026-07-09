/**
 * CurrentProgramCard — Active program continuation card
 *
 * Displays the user's in-progress program with:
 *  - Thumbnail icon (brain in tinted circle)
 *  - Category badge (e.g. "CBT PROGRAM")
 *  - Program title
 *  - Lesson progress + time remaining
 *  - Horizontal progress bar
 *  - Play/continue button
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle as SvgCircle, Polygon } from 'react-native-svg';
import { Play, Brain } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/core/theme';
import { ProgressBar } from '@/shared/components/ProgressBar';

interface CurrentProgramCardProps {
  /** Program title. */
  title: string;
  /** Current lesson number. */
  currentLesson: number;
  /** Total lessons in program. */
  totalLessons: number;
  /** Completion percent (0-100). */
  completionPercent: number;
  /** Minutes remaining for current lesson. */
  minutesRemaining?: number;
  /** Category label. */
  category?: string;
  /** Callback when play/continue is tapped. */
  onContinue: () => void;
  /** Optional custom progress subtitle. */
  subtitle?: string;
}

export const CurrentProgramCard = React.memo(({
  title,
  currentLesson,
  totalLessons,
  completionPercent,
  minutesRemaining = 8,
  category = 'CBT PROGRAM',
  onContinue,
  subtitle,
}: CurrentProgramCardProps) => {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Animated.View
      entering={FadeInDown.delay(160).duration(600).springify()}
    >
      <Pressable
        onPress={onContinue}
        style={[
          styles.card,
          {
            backgroundColor: isDark ? colors.surface.primary : '#FFFFFF',
            borderColor: isDark ? colors.border.default : '#E5E7EB',
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Continue ${title}, Lesson ${currentLesson} of ${totalLessons}`}
      >
        <View style={styles.topRow}>
          {/* Thumbnail */}
          <View style={[styles.thumbnail, { backgroundColor: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(108,76,241,0.08)' }]}>
            <Svg width={48} height={48} viewBox="0 0 48 48">
              {/* Stylised brain silhouette */}
              <SvgCircle
                cx={24}
                cy={24}
                r={20}
                fill={isDark ? 'rgba(139,92,246,0.15)' : 'rgba(108,76,241,0.1)'}
              />
            </Svg>
            <View style={styles.thumbnailIconOverlay}>
              <Brain size={26} color={isDark ? '#A78BFA' : '#6C4CF1'} />
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={[styles.categoryBadge, { backgroundColor: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(108,76,241,0.1)' }]}>
              <Text style={[styles.categoryText, { color: isDark ? '#A78BFA' : '#6C4CF1' }]}>
                {category}
              </Text>
            </View>

            <Text
              style={[styles.title, { color: colors.text.primary }]}
              numberOfLines={1}
            >
              {title}
            </Text>

            <Text style={[styles.lessonInfo, { color: colors.text.secondary }]}>
              {subtitle || `Lesson ${currentLesson} of ${totalLessons} · ${minutesRemaining} min remaining`}
            </Text>
          </View>

          {/* Play button */}
          <Pressable
            onPress={onContinue}
            style={[styles.playButton, { backgroundColor: isDark ? '#8B5CF6' : '#6C4CF1' }]}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Play"
          >
            <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
          </Pressable>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <ProgressBar
            percent={completionPercent}
            height={5}
            color={isDark ? '#8B5CF6' : '#6C4CF1'}
            trackColor={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(108,76,241,0.1)'}
            variant="gradient"
          />
        </View>
      </Pressable>
    </Animated.View>
  );
});

CurrentProgramCard.displayName = 'CurrentProgramCard';

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
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    position: 'relative',
  },
  thumbnailIconOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 4,
  },
  lessonInfo: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  progressContainer: {
    marginTop: spacing.md,
  },
});

export default CurrentProgramCard;
