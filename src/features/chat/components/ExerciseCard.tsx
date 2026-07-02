import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius as radius } from '@/core/theme/tokens';
import { Wind } from 'lucide-react-native';

interface ExerciseCardProps {
  title?: string;
  duration?: string;
  actionLabel?: string;
}

export const ExerciseCard = React.memo(function ExerciseCard({ title = 'Breathing Exercise', duration = '60 sec', actionLabel = 'Start' }: ExerciseCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface.secondary, borderColor: colors.border.default }]}>
      <View style={styles.header}>
        <Wind size={18} color={colors.brand.primary} />
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
      </View>
      <Text style={[styles.duration, { color: colors.text.secondary }]}>Duration: {duration}</Text>
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
  duration: {
    fontSize: 14,
    lineHeight: 20,
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

export default ExerciseCard;
