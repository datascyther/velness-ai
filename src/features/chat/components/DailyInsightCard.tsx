import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius as radius } from '@/core/theme/tokens';
import { Lightbulb } from 'lucide-react-native';

interface DailyInsightCardProps {
  title?: string;
  content?: string;
}

function parseInsightContent(content: string) {
  const lines = content.split('\n').filter(Boolean);
  const title = lines[0] || undefined;
  const insight = lines.slice(1).join('\n').trim() || undefined;
  return { title, insight };
}

export const DailyInsightCard = React.memo(function DailyInsightCard({ title: propTitle, content }: DailyInsightCardProps) {
  const { colors } = useTheme();
  const parsed = content ? parseInsightContent(content) : { title: undefined, insight: undefined };
  const title = propTitle || parsed.title || 'Daily Insight';
  const insight = parsed.insight || content || undefined;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface.secondary, borderColor: colors.border.default }]}>
      <View style={styles.header}>
        <Lightbulb size={18} color={colors.warning} />
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
      </View>
      {insight ? (
        <View style={[styles.insightBox, { borderLeftColor: colors.warning }]}>
          <Text style={[styles.insightText, { color: colors.text.primary }]}>{insight}</Text>
        </View>
      ) : null}
      <Text style={[styles.footer, { color: colors.text.secondary }]}>Reflect on this insight</Text>
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
  insightBox: {
    borderLeftWidth: 3,
    paddingLeft: spacing.sm,
    marginBottom: spacing.md,
  },
  insightText: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  footer: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

export default DailyInsightCard;
