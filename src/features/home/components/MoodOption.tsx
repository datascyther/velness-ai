import React, { useCallback, useEffect } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  FadeInDown,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { EmotionAvatar } from '@/components/emotion/EmotionAvatar';
import { triggerEmotionHaptic } from '@/constants/emotions';
import type { EmotionType } from '@/constants/emotions';

export interface MoodOptionProps {
  emotion: EmotionType;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const MoodOption = React.memo(({
  emotion,
  label,
  isSelected,
  onPress,
}: MoodOptionProps) => {
  const scale = useSharedValue(1);
  const { colors } = useTheme();
  const PRIMARY = colors.brand.primary;

  useEffect(() => {
    if (isSelected) {
      scale.value = 1.2;
      scale.value = withSpring(1.08, { damping: 10, stiffness: 200 });
    } else {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    }
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: scale.value,
        },
      ],
      borderColor: withSpring(
        isSelected ? PRIMARY : colors.border.default,
        { damping: 20, stiffness: 200 }
      ),
      backgroundColor: withSpring(
        isSelected ? `${PRIMARY}22` : colors.surface.secondary,
        { damping: 20, stiffness: 200 }
      ),
    };
  });

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.92, { damping: 8 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(isSelected ? 1.08 : 1, { damping: 10 });
  }, [scale, isSelected]);

  const handlePress = useCallback(() => {
    void triggerEmotionHaptic();
    onPress();
  }, [onPress]);

  return (
    <Animated.View entering={FadeInDown.duration(400).springify()}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, { borderColor: colors.border.default, backgroundColor: colors.surface.secondary }, animatedStyle]}
        accessibilityRole="button"
        accessibilityLabel={`Select mood: ${label}`}
        accessibilityState={{ selected: isSelected }}
      >
        <EmotionAvatar
          emotion={emotion}
          size={34}
          animated
          selected={isSelected}
          showGlow={false}
        />
        <Text style={[styles.label, { color: colors.text.secondary }, isSelected && { color: colors.brand.primary, fontWeight: '600' }]}>
          {label}
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 64,
    height: 80,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
  },
});

export default MoodOption;
