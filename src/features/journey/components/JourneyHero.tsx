/**
 * JourneyHero — Motivational banner with progress stats
 *
 * Purple-to-lavender gradient card featuring:
 *  - Personalized encouragement: "Keep going, {name}! 👏"
 *  - Weekly progress ring (circular)
 *  - Exercises completed counter
 *  - Decorative mountain/flag illustration (SVG)
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Path,
  G,
  Polygon,
} from 'react-native-svg';
import { Star } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/core/theme';
import { ProgressRing } from '@/shared/components/ProgressRing';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface JourneyHeroProps {
  /** User's first name for personalisation. */
  firstName?: string;
  /** Weekly progress percentage (0-100). */
  weeklyProgress?: number;
  /** Total exercises completed this week. */
  exercisesCompleted?: number;
}

export const JourneyHero = React.memo(({
  firstName = '',
  weeklyProgress = 0,
  exercisesCompleted = 0,
}: JourneyHeroProps) => {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Animated.View
      entering={FadeInDown.delay(80).duration(600).springify()}
      style={styles.container}
    >
      <View style={[styles.card, { overflow: 'hidden' }]}>
        {/* Background gradient */}
        <Svg
          width="100%"
          height="100%"
          style={StyleSheet.absoluteFill}
          preserveAspectRatio="none"
        >
          <Defs>
            <LinearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop
                offset="0%"
                stopColor={isDark ? '#2D1B69' : '#E8DFFF'}
              />
              <Stop
                offset="50%"
                stopColor={isDark ? '#1E1245' : '#EDE7FF'}
              />
              <Stop
                offset="100%"
                stopColor={isDark ? '#161235' : '#F3EDFF'}
              />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#heroGrad)" />
        </Svg>

        {/* Mountain illustration (right side) */}
        <View style={styles.illustrationContainer} pointerEvents="none">
          <Svg width={140} height={140} viewBox="0 0 140 140">
            {/* Mountain base */}
            <Polygon
              points="40,130 90,40 140,130"
              fill={isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.12)'}
            />
            <Polygon
              points="20,130 60,60 100,130"
              fill={isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.08)'}
            />
            {/* Flag pole */}
            <Path
              d="M90 40 L90 15"
              stroke={isDark ? '#A78BFA' : '#8B5CF6'}
              strokeWidth={2}
              strokeLinecap="round"
            />
            {/* Flag */}
            <Path
              d="M90 15 L110 22 L90 29"
              fill={isDark ? '#A78BFA' : '#8B5CF6'}
            />
            {/* Path/trail */}
            <Path
              d="M50 120 Q65 100 70 90 Q80 70 88 50"
              stroke={isDark ? 'rgba(167, 139, 250, 0.3)' : 'rgba(139, 92, 246, 0.2)'}
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="none"
              strokeLinecap="round"
            />
          </Svg>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.greeting, { color: isDark ? '#A78BFA' : '#6C4CF1' }]}>
            Keep going{firstName ? `, ${firstName}` : ''}!
          </Text>
          <Text style={[styles.message, { color: isDark ? 'rgba(255,255,255,0.75)' : '#4B5563' }]}>
            You're making great progress{'\n'}on your wellness journey.
          </Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <ProgressRing
                progress={weeklyProgress}
                size={44}
                strokeWidth={5}
                color={isDark ? '#A78BFA' : '#6C4CF1'}
                trackColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(108, 76, 241, 0.15)'}
                showPercentage={false}
              />
              <View style={styles.statTextBlock}>
                <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  {weeklyProgress}%
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280' }]}>
                  Weekly Progress
                </Text>
              </View>
            </View>

            <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]} />

            <View style={styles.statBlock}>
              <View style={[styles.starIcon, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(108, 76, 241, 0.12)' }]}>
                <Star size={18} color={isDark ? '#A78BFA' : '#6C4CF1'} fill={isDark ? '#A78BFA' : '#6C4CF1'} />
              </View>
              <View style={styles.statTextBlock}>
                <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  {exercisesCompleted}
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280' }]}>
                  Exercises Completed
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
});

JourneyHero.displayName = 'JourneyHero';

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  card: {
    borderRadius: borderRadius['2xl'],
    minHeight: 180,
    position: 'relative',
  },
  illustrationContainer: {
    position: 'absolute',
    right: 0,
    top: 10,
    opacity: 0.9,
  },
  content: {
    padding: spacing.xl,
    paddingRight: 100,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statTextBlock: {
    marginLeft: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 36,
    marginHorizontal: spacing.md,
  },
  starIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default JourneyHero;
