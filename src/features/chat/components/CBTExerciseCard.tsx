import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius as radius } from '@/core/theme/tokens';
import { BrainCircuit } from 'lucide-react-native';

interface CBTExerciseCardProps {
  title?: string;
  content?: string;
  actionLabel?: string;
}

function parseCBTContent(content: string) {
  const lines = content.split('\n').filter(Boolean);
  const title = lines[0] || undefined;
  let negativeThought: string | undefined;
  let reframe: string | undefined;

  for (const line of lines) {
    if (line.startsWith('Negative Thought:')) {
      negativeThought = line.replace(/^Negative Thought:\s*/i, '');
    } else if (line.startsWith('Reframe:')) {
      reframe = line.replace(/^Reframe:\s*/i, '');
    }
  }

  return { title, negativeThought, reframe };
}

export const CBTExerciseCard = React.memo(function CBTExerciseCard({ title: propTitle, content, actionLabel = 'Start Exercise' }: CBTExerciseCardProps) {
  const { colors } = useTheme();
  const parsed = content ? parseCBTContent(content) : { title: undefined, negativeThought: undefined, reframe: undefined };
  const title = propTitle || parsed.title || 'CBT Exercise';
  const showThoughtRecord = parsed.negativeThought || parsed.reframe;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface.secondary, borderColor: colors.border.default }]}>
      <View style={styles.header}>
        <BrainCircuit size={18} color={colors.brand.primary} />
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
      </View>
      {showThoughtRecord ? (
        <>
          {parsed.negativeThought ? (
            <View style={styles.thoughtSection}>
              <Text style={[styles.thoughtLabel, { color: colors.text.secondary }]}>Negative Thought</Text>
              <Text style={[styles.thoughtContent, { color: colors.text.primary }]}>{parsed.negativeThought}</Text>
            </View>
          ) : null}
          {parsed.reframe ? (
            <View style={styles.thoughtSection}>
              <Text style={[styles.thoughtLabel, { color: colors.brand.primary }]}>Reframed Thought</Text>
              <Text style={[styles.thoughtContent, { color: colors.text.primary }]}>{parsed.reframe}</Text>
            </View>
          ) : null}
        </>
      ) : content ? (
        <Text style={[styles.description, { color: colors.text.secondary }]}>{content}</Text>
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
  thoughtSection: {
    marginBottom: spacing.sm,
  },
  thoughtLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  thoughtContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
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

export default CBTExerciseCard;
