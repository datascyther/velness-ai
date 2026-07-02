import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius as radius } from '@/core/theme/tokens';
import { Sparkles } from 'lucide-react-native';

interface WellnessRecommendationCardProps {
  title?: string;
  content?: string;
  actionLabel?: string;
}

function parseWellnessContent(content: string) {
  const lines = content.split('\n').filter(Boolean);
  const title = lines[0] || undefined;
  let tip: string | undefined;
  const descriptionLines: string[] = [];

  for (const line of lines.slice(1)) {
    if (line.startsWith('Tip:')) {
      tip = line.replace(/^Tip:\s*/i, '');
    } else {
      descriptionLines.push(line);
    }
  }

  const description = descriptionLines.join('\n').trim() || undefined;
  return { title, description, tip };
}

export const WellnessRecommendationCard = React.memo(function WellnessRecommendationCard({ title: propTitle, content, actionLabel = 'Try This' }: WellnessRecommendationCardProps) {
  const { colors } = useTheme();
  const parsed = content ? parseWellnessContent(content) : { title: undefined, description: undefined, tip: undefined };
  const title = propTitle || parsed.title || 'Wellness Tip';

  return (
    <View style={[styles.card, { backgroundColor: colors.surface.secondary, borderColor: colors.border.default }]}>
      <View style={styles.header}>
        <Sparkles size={18} color={colors.brand.primary} />
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
      </View>
      {parsed.description ? (
        <Text style={[styles.description, { color: colors.text.secondary }]}>{parsed.description}</Text>
      ) : null}
      {parsed.tip ? (
        <View style={[styles.tipBox, { backgroundColor: colors.surface.primary, borderLeftColor: colors.brand.primary }]}>
          <Text style={[styles.tipLabel, { color: colors.brand.primary }]}>Tip</Text>
          <Text style={[styles.tipText, { color: colors.text.primary }]}>{parsed.tip}</Text>
        </View>
      ) : null}
      <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
      <Pressable
        onPress={() => {
          try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
        }}
        style={({ pressed }) => [
          styles.actionButton,
          { backgroundColor: pressed ? colors.brand.secondary : colors.brand.primary },
        ]}
      >
        <Text style={[styles.actionLabel, { color: colors.brand.contrastText }]}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  tipBox: {
    padding: spacing.sm,
    borderLeftWidth: 3,
    marginBottom: spacing.md,
    borderRadius: radius.xs,
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginBottom: spacing.md,
  },
  actionButton: {
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default WellnessRecommendationCard;
