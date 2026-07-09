import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface JourneyCompletedStateProps {
  onExplore: () => void;
}

export const JourneyCompletedState = React.memo(({ onExplore }: JourneyCompletedStateProps) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border.default,
        backgroundColor: colors.surface.primary,
        padding: 16,
        alignItems: 'center',
      }}
      accessibilityLabel="Program completed"
    >
      <Text
        style={{
          fontSize: 32, marginBottom: 8, color: colors.brand.primary,
        }}
      >
        ✓
      </Text>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '600',
          color: colors.text.primary,
          marginBottom: 4,
        }}
      >
        Program Complete
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: colors.text.secondary,
          marginBottom: 16,
          textAlign: 'center',
        }}
      >
        Great work!{'\n'}Ready for your next journey?
      </Text>
      <Pressable
        onPress={onExplore}
        style={{
          backgroundColor: colors.brand.primary,
          borderRadius: 10,
          paddingVertical: 12,
          paddingHorizontal: 24,
          minHeight: 44,
          justifyContent: 'center',
        }}
        accessibilityRole="button"
        accessibilityLabel="Explore programs"
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: colors.brand.contrastText,
          }}
        >
          Explore Programs
        </Text>
      </Pressable>
    </View>
  );
});
