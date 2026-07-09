/**
 * IconButton — Circular icon-only button
 *
 * Variants: primary | secondary | ghost
 * Sizes: sm | md | lg
 */

import React from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { cva, type VariantProps } from 'class-variance-authority';

const iconButtonVariants = cva(
  'items-center justify-center rounded-full active:opacity-70',
  {
    variants: {
      variant: {
        primary: 'bg-velness-purple-600',
        secondary: 'bg-velness-glass-highlight border border-velness-glass-border',
        ghost: 'bg-transparent',
      },
      size: {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface IconButtonProps extends VariantProps<typeof iconButtonVariants> {
  icon: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function IconButton({
  icon,
  onPress,
  disabled = false,
  variant,
  size,
  className = '',
}: IconButtonProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withSpring(disabled ? 0.4 : 1, { damping: 15, stiffness: 200 }),
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      className={`${iconButtonVariants({ variant, size })} ${className}`}
      style={animatedStyle}
    >
      {icon}
    </AnimatedPressable>
  );
}

export default IconButton;
