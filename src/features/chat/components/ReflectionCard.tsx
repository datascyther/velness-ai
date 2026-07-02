import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius as radius } from '@/core/theme/tokens';
import { Heart } from 'lucide-react-native';

interface ReflectionCardProps {
  title?: string;
  description?: string;
  actionLabel?: string;
}

export const ReflectionCard = React.memo(function ReflectionCard({ title = "Today's Reflection", description, actionLabel = 'Save Reflection' }: ReflectionCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface.secondary, borderColor: colors.border.default }]}>
      <View style={styles.header}>
        <Heart size={18} color={colors.brand.primary} />
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
      </View>
      {description ? (
        <Text style={[styles.description, { color: colors.text.secondary }]}>{description}</Text>
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
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
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

export default ReflectionCard;
