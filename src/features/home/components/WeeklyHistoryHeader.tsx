import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/core/theme';

export const WeeklyHistoryHeader = React.memo(() => {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const formatDate = (d: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text.primary }]}>Mood Timeline</Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
        {formatDate(startOfWeek)} — {formatDate(endOfWeek)}
      </Text>
    </View>
  );
});

WeeklyHistoryHeader.displayName = 'WeeklyHistoryHeader';

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
    // Reserve vertical space to keep the card layout feeling aligned/polished
    minHeight: 40,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    opacity: 0.55,
    letterSpacing: 0.1,
    lineHeight: 16,
  },
});
