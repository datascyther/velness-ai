import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Clock, Sparkles, ArrowRight } from 'lucide-react-native';
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
  isAIGenerated,
  onStart,
}: AIRecommendationCardProps) => {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  const accentColor = '#8B5CF6';

  return (
    <Animated.View
      entering={FadeInDown.delay(320).duration(500).springify()}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? 'rgba(139,92,246,0.06)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(139,92,246,0.25)' : '#E5E7EB',
          },
        ]}
      >
        <Svg
          width="100%"
          height="100%"
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Defs>
            <LinearGradient id="aiRecBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={accentColor} stopOpacity={isDark ? 0.3 : 0.15} />
              <Stop offset="100%" stopColor="#06B6D4" stopOpacity={isDark ? 0.15 : 0.05} />
            </LinearGradient>
          </Defs>
          <Rect
            x={0}
            y={0}
            width="100%"
            height="100%"
            rx={borderRadius.xl}
            fill="none"
            stroke="url(#aiRecBorder)"
            strokeWidth={1.5}
          />
        </Svg>

        <View style={styles.topRow}>
          <View style={[styles.thumbnail, { backgroundColor: `${accentColor}15` }]}>
            <Svg width={48} height={48} viewBox="0 0 48 48">
              <Rect
                x={8}
                y={8}
                width={32}
                height={32}
                rx={10}
                fill={isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.1)'}
              />
            </Svg>
            <View style={styles.thumbnailIconOverlay}>
              <Sparkles size={22} color={accentColor} />
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: isDark ? 'rgba(139,92,246,0.2)' : `${accentColor}12` },
                ]}
              >
                <Text style={[styles.categoryText, { color: accentColor }]}>
                  {reason}
                </Text>
              </View>
              {isAIGenerated && (
                <View
                  style={[
                    styles.aiBadge,
                    { backgroundColor: isDark ? 'rgba(139,92,246,0.15)' : `${accentColor}10` },
                  ]}
                >
                  <Sparkles size={10} color={accentColor} />
                  <Text style={[styles.aiBadgeText, { color: accentColor }]}>
                    AI
                  </Text>
                </View>
              )}
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

            <View style={styles.metaRow}>
              <Clock size={12} color={colors.text.secondary} />
              <Text style={[styles.metaText, { color: colors.text.secondary }]}>
                {durationMinutes} min
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={onStart}
          style={[
            styles.startButton,
            { backgroundColor: accentColor },
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Start ${title}`}
        >
          <Text style={styles.startText}>Start</Text>
          <ArrowRight size={14} color="#FFFFFF" />
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
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  aiBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
    marginBottom: 3,
  },
  description: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '400',
    marginLeft: 4,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    paddingVertical: 10,
    marginTop: spacing.md,
    gap: 6,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  startText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default AIRecommendationCard;
