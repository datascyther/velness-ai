// src/features/home/components/SmartRecommendationCard.tsx
//
// Contextual recommendation that explains WHY — not just WHAT.
// Phase 9: Added bullet-point reasoning, spring press, stagger animation.

import React, { useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { shadows } from '@/core/theme';

interface SmartRecommendationCardProps {
  reason: string;        // "Because you've been studying CBT"
  title: string;         // "Thought Logging"
  subtitle?: string;     // Optional description
  onPress: () => void;
}

export function SmartRecommendationCard({
  reason,
  title,
  subtitle,
  onPress,
}: SmartRecommendationCardProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, { damping: 14, stiffness: 300 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 280 });
  }, [scale]);

  // Generate contextual reasoning bullets based on time and context
  const reasonBullets = useMemo(() => {
    const bullets: string[] = [];
    const hour = new Date().getHours();

    if (hour >= 22 || hour < 5) {
      bullets.push("It's late — winding down helps sleep quality");
    } else if (hour >= 20) {
      bullets.push(`It's after ${hour >= 22 ? 'midnight' : '8 PM'}`);
    } else if (hour < 10) {
      bullets.push('Morning mindfulness boosts focus');
    }

    if (title.toLowerCase().includes('sleep')) {
      bullets.push('Rest prepares your mind for tomorrow');
    } else if (title.toLowerCase().includes('breathing')) {
      bullets.push('Deep breathing activates your calming system');
    } else if (title.toLowerCase().includes('cbt') || title.toLowerCase().includes('thought')) {
      bullets.push('Reframing thoughts reduces mental friction');
    } else if (title.toLowerCase().includes('grounding')) {
      bullets.push('Sensory awareness brings you to the present');
    }

    // Cap at 3 bullets
    return bullets.slice(0, 3);
  }, [title]);

  return (
    <Animated.View
      entering={FadeInDown.delay(100).duration(500)}
      style={animatedStyle}
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
        accessibilityLabel={`Recommendation: ${title}. ${reason}`}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconBadge, { backgroundColor: `${colors.text.tertiary}14` }]}>
            <Sparkles size={14} color={colors.text.secondary} />
          </View>
          <Text style={[styles.reasonText, { color: colors.text.secondary }]}>
            {reason}
          </Text>
        </View>

        {/* Reasoning bullets */}
        {reasonBullets.length > 0 && (
          <View style={styles.bulletList}>
            {reasonBullets.map((bullet, idx) => (
              <Animated.View
                key={idx}
                entering={FadeInDown.delay(200 + idx * 80).duration(400)}
                style={styles.bulletRow}
              >
                <Text style={[styles.bulletDot, { color: colors.text.tertiary }]}>•</Text>
                <Text style={[styles.bulletText, { color: colors.text.secondary }]}>
                  {bullet}
                </Text>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Body */}
        <View style={styles.body}>
          <View style={styles.textBlock}>
            <Text style={[styles.label, { color: colors.text.tertiary }]}>
              We recommend
            </Text>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                {subtitle}
              </Text>
            )}
          </View>
          <View style={[styles.cta, { backgroundColor: colors.brand.primary }]}>
            <Text style={styles.ctaText}>Try</Text>
            <ArrowRight size={14} color="#FFFFFF" />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 8,
  },
  iconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    lineHeight: 17,
    letterSpacing: 0.1,
  },
  bulletList: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingLeft: 32, // Align with reason text
  },
  bulletDot: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 17,
  },
  bulletText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 12,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    minHeight: 44,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default SmartRecommendationCard;
