import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/core/theme';

interface InsightLabelProps {
  text: string;
}

export const InsightLabel = React.memo(({ text }: InsightLabelProps) => {
  const { colors } = useTheme();

  if (!text) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      style={[styles.container, { backgroundColor: `${colors.brand.primary}06`, borderColor: `${colors.brand.primary}12` }]}
    >
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: `${colors.brand.primary}12` }]}>
          <Sparkles size={12} color={colors.brand.primary} />
        </View>
        <Text style={[styles.headerText, { color: colors.brand.primary }]}>Velness Insight</Text>
      </View>
      <Text style={[styles.text, { color: colors.text.secondary }]}>{text}</Text>
    </Animated.View>
  );
});

InsightLabel.displayName = 'InsightLabel';

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md + 2,
    padding: spacing.md + 2,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  text: {
    fontSize: 12.5,
    fontWeight: '500',
    lineHeight: 19,
    letterSpacing: 0.1,
  },
});
