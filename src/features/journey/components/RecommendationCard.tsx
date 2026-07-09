import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Clock, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/core/theme';

interface RecommendationCardProps {
  title: string;
  description: string;
  category: string;
  categoryColor?: string;
  durationMinutes: number;
  onStart?: () => void;
}

export const RecommendationCard = React.memo(({
  title,
  description,
  category,
  categoryColor = '#F97316',
  durationMinutes,
  onStart,
}: RecommendationCardProps) => {
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
        <View style={[styles.thumbnail, { backgroundColor: `${categoryColor}15` }]}>
          <View style={[styles.thumbnailDot, { backgroundColor: categoryColor }]} />
        </View>

        <View style={styles.content}>
          <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}12` }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {category}
            </Text>
          </View>

          <Text
            style={[styles.title, { color: colors.text.primary }]}
            numberOfLines={1}
          >
            {title}
          </Text>

          <Text
            style={[styles.description, { color: colors.text.secondary }]}
            numberOfLines={1}
          >
            {description}
          </Text>

          <View style={styles.durationRow}>
            <Clock size={12} color={colors.text.secondary} />
            <Text style={[styles.durationText, { color: colors.text.secondary }]}>
              {durationMinutes} min
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onStart}
          style={[
            styles.startButton,
            {
              backgroundColor: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(108,76,241,0.08)',
            },
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Start ${title}`}
        >
          <ArrowRight size={16} color={isDark ? '#8B5CF6' : '#6C4CF1'} />
        </Pressable>
      </View>
    </Animated.View>
  );
});

RecommendationCard.displayName = 'RecommendationCard';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  thumbnailDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  content: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    marginBottom: 6,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    fontWeight: '400',
    marginLeft: 4,
  },
  startButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});
