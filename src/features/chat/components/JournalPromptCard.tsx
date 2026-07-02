import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius as radius } from '@/core/theme/tokens';
import { BookOpen } from 'lucide-react-native';

interface JournalPromptCardProps {
  title?: string;
  content?: string;
  actionLabel?: string;
}

function parseJournalContent(content: string) {
  const lines = content.split('\n').filter(Boolean);
  const title = lines[0] || undefined;
  const prompt = lines.slice(1).join('\n').trim() || undefined;
  return { title, prompt };
}

export const JournalPromptCard = React.memo(function JournalPromptCard({ title: propTitle, content, actionLabel = 'Write in Journal' }: JournalPromptCardProps) {
  const { colors } = useTheme();
  const parsed = content ? parseJournalContent(content) : { title: undefined, prompt: undefined };
  const title = propTitle || parsed.title || 'Journal Prompt';
  const prompt = parsed.prompt || content || undefined;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface.secondary, borderColor: colors.border.default }]}>
      <View style={styles.header}>
        <BookOpen size={18} color={colors.brand.primary} />
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
      </View>
      {prompt ? (
        <Text style={[styles.prompt, { color: colors.text.primary }]}>{prompt}</Text>
      ) : null}
      <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
        Take a moment to reflect and write about this prompt.
      </Text>
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
  prompt: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '500',
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
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
    alignSelf: 'center',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default JournalPromptCard;
