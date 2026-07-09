import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface DayLabelProps {
  label: string;
  isToday?: boolean;
}

export const DayLabel = React.memo(({ label, isToday }: DayLabelProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          { color: isToday ? colors.brand.primary : colors.text.secondary },
          isToday && styles.today,
        ]}
      >
        {label}
      </Text>
      {isToday && (
        <View style={[styles.activeDot, { backgroundColor: colors.brand.primary }]} />
      )}
    </View>
  );
});

DayLabel.displayName = 'DayLabel';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    // Reserve a stable height to prevent vertical jitter/alignment issues in week columns
    height: 22,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    lineHeight: 12,
  },
  today: {
    fontWeight: '800',
  },
  activeDot: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

