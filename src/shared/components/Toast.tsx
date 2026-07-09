/**
 * Toast — Toast notification component
 *
 * Reads from the Zustand toast queue and renders active toasts.
 * Uses Reanimated for enter/exit animations.
 */

import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react-native';
import { useAppStore } from '@/core/store/useAppStore';
import type { Toast as ToastType } from '@/core/store/useAppStore';

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

const toastColors = {
  success: '#34D399',
  error: '#F87171',
  warning: '#FBBF24',
  info: '#38BDF8',
} as const;

interface ToastItemProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const Icon = toastIcons[toast.type];
  const color = toastColors[toast.type];

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
    opacity.value = withTiming(1, { duration: 300 });

    const duration = toast.duration ?? 3000;
    const timer = setTimeout(() => {
      translateY.value = withSequence(
        withTiming(-100, { duration: 300 }, () => {
          runOnJS(onDismiss)(toast.id);
        })
      );
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="bg-surface-card border border-velness-glass-border rounded-glass-lg px-4 py-3.5 mx-4 mb-2 flex-row items-center"
    >
      <Icon size={20} color={color} />
      <Text className="flex-1 text-white text-body-sm ml-3">{toast.message}</Text>
      <Pressable onPress={() => onDismiss(toast.id)} className="ml-2">
        <X size={16} color="rgba(255,255,255,0.4)" />
      </Pressable>
    </Animated.View>
  );
}

export function ToastContainer() {
  const toasts = useAppStore((state) => state.ui.toasts);
  const removeToast = useAppStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <View className="absolute top-safe-top left-0 right-0 z-50 pt-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </View>
  );
}

export default ToastContainer;
