/**
 * Badge — Small label/tag component
 *
 * Variants: default | success | warning | error | info
 */

import React from 'react';
import { View, Text } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'px-2.5 py-1 rounded-full self-start',
  {
    variants: {
      variant: {
        default: 'bg-velness-glass-highlight',
        success: 'bg-green-500/20',
        warning: 'bg-yellow-500/20',
        error: 'bg-red-500/20',
        info: 'bg-blue-500/20',
        purple: 'bg-velness-purple-600/20',
        cyan: 'bg-velness-cyan-600/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const textVariants = cva('text-caption font-medium', {
  variants: {
    variant: {
      default: 'text-white/60',
      success: 'text-green-400',
      warning: 'text-yellow-400',
      error: 'text-red-400',
      info: 'text-blue-400',
      purple: 'text-velness-purple-400',
      cyan: 'text-velness-cyan-400',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  label: string;
  className?: string;
}

export function Badge({ label, variant, className = '' }: BadgeProps) {
  return (
    <View className={`${badgeVariants({ variant })} ${className}`}>
      <Text className={textVariants({ variant })}>{label}</Text>
    </View>
  );
}

export default Badge;
