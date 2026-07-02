import React from 'react';
import type { ViewStyle, StyleProp } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface BaseMessageBubbleProps {
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export function BaseMessageBubble({ children, containerStyle }: BaseMessageBubbleProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(300).springify().damping(20).stiffness(200)}
      style={containerStyle}
    >
      {children}
    </Animated.View>
  );
}

export default BaseMessageBubble;
