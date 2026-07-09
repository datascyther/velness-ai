import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { BrainIcon } from '@/shared/components/SymbolIcons';

export interface EmptyJourneyStateProps {
  onStart: () => void;
}

export const EmptyJourneyState = React.memo(({ onStart }: EmptyJourneyStateProps) => {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(100).duration(600).springify()}
      style={[styles.card, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]}
      accessibilityLabel="Begin your wellness journey"
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.brand.primary}1A` }]}>
          <BrainIcon size={28} />
        </View>
        <Text style={[styles.titleText, { color: colors.text.primary }]}>
          Begin Your Wellness Journey
        </Text>
        <Text style={[styles.subtext, { color: colors.text.secondary }]}>
          Discover guided programs to improve your well-being.
        </Text>

        <Pressable
          onPress={onStart}
          style={[styles.button, { backgroundColor: colors.brand.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Start your wellness journey"
        >
          <Text style={[styles.buttonText, { color: colors.brand.contrastText }]}>
            Start Journey
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 28,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 44,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default EmptyJourneyState;
