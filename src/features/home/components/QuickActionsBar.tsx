// src/features/home/components/QuickActionsBar.tsx
//
// Five circular icon buttons for one-tap access to core wellness actions.
// Stagger-animated on mount. Each button: 52×52 circle + label beneath.
// Phase 3: Spring scale + glow ring on press for premium feel.

import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/hooks/useTheme';

interface QuickAction {
  id: string;
  label: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
  onPress: () => void;
}

interface QuickActionsBarProps {
  onBreathe?: () => void;
  onMeditate?: () => void;
  onSleep?: () => void;
  onOpenChat?: () => void;
  onOpenJournal?: () => void;
}

function SelfImprovementIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
      <Path d="M263.375 19.375c-11.768 0-22.676 6.137-31.156 17.22-7.267 9.494-12.397 22.54-13.72 37.25 11.14-4.926 22.473-7.91 33.813-9V83.25c-10.965 1.377-22.008 5.008-33.157 11.03 1.968 12.487 6.703 23.502 13.063 31.814 8.48 11.082 19.387 17.22 31.155 17.22s22.707-6.138 31.188-17.22c6.167-8.06 10.783-18.667 12.843-30.688-12.07-6.832-24.194-10.997-36.406-12.344V64.75c12.676 1.087 25.22 4.516 37.344 10.188-1.155-15.158-6.336-28.614-13.78-38.344-8.482-11.082-19.42-17.22-31.19-17.22zm-46.594 117.25c-10.442 4.8-18.39 11.182-22.593 18.47l-.375-.095-41.625 64.438-50.656-21.97c-29.375-16.118-61.574 24-30.624 41.688l94.47 44.063 38.03-50.064c18.7 33.703 16.77 67.43-10.97 101.156-8.344-.642-16.37-.958-23.967-.906-40.312.278-68.942 10.254-73.907 28.78l.03.002c-4.44 16.58 10.992 36.67 39.126 55.28 55.675 29.297 95.38 38.468 156.968 42.344h1.562l.438.125c.424.026.823.07 1.25.094l-.032.314 92.063 28.72-22.19-53.72L183.595 375.5l5.875-17.72 71.81 23.845 71.845-23.844L339 375.5l-48.094 15.97 94.438 31.374c33.494-20.046 52.528-42.468 47.656-60.656-5.95-22.21-45.925-32.107-99.25-27.782-26.392-33.215-26.196-66.41-9.53-99.625L361 283.22l94.47-44.064c30.95-17.687-1.25-57.806-30.626-41.687l-50.688 21.968L332.562 155h-.062c-4.217-7.246-12.135-13.596-22.53-18.375-.2.27-.392.547-.595.813-11.268 14.725-27.633 24.562-46 24.562s-34.732-9.837-46-24.563c-.203-.265-.394-.543-.594-.812zm-63.686 311l-16.72 40.5 69.876-21.78c-17.624-4.574-34.93-10.634-53.156-18.72z" />
    </Svg>
  );
}

function JournalIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
      <Path d="M92.1 32C76.6 32 64 44.6 64 60.1V452c0 15.5 12.6 28.1 28.1 28.1H432c8.8 0 16-7.2 16-16s-7.2-16-16-16H112.5c-8.2 0-15.4-6-16.4-14.1-1.1-9.7 6.5-18 15.9-18h208V32H92.1z" />
      <Path d="M432 416c8.8 0 16-7.2 16-16V60.1c0-15.5-12.6-28.1-28.1-28.1H368v384h64z" />
    </Svg>
  );
}

function LeafIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M3.055 14.328l-.018 -.168l-.004 -.043a11 11 0 0 1 -.047 -1.12c.018 -6.29 4.29 -9.997 13 -9.997h4.014a1 1 0 0 1 1 1l-.002 2.057c-.498 8.701 -4.74 12.943 -11.998 12.943h-2.631a16 16 0 0 0 -.375 2.11a1 1 0 1 1 -1.988 -.22q .174 -1.568 .58 -2.947l-.118 -.146l-.208 -.28l-.157 -.229l-.182 -.293l-.098 -.171l-.065 -.122a6 6 0 0 1 -.397 -.941l-.072 -.237l-.085 -.327l-.057 -.268l-.043 -.242zm8.539 -4.242c-2.845 1.265 -4.854 3.13 -6.108 5.583q .098 .2 .218 .4l.185 .281l.07 .097q .12 .164 .258 .329l.197 .224h.649c1.037 -2.271 2.777 -3.946 5.343 -5.086a1 1 0 0 0 -.812 -1.828" />
    </Svg>
  );
}

function SleepIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
      <Path d="M294.8 26.57L238 60.37l7.8 13.17L281 52.59 270.8 118l6.3 10.6L336 93.53l-7.8-13.17-37.3 22.14L301 37.12l-6.2-10.55zM147.1 60.55A224 224 0 0 0 32 256a224 224 0 0 0 224 224 224 224 0 0 0 214.9-161.2A208 208 0 0 1 320 384a208 208 0 0 1-208-208 208 208 0 0 1 35.1-115.45zm97.4 51.5l-6.9 16.5 44.1 18.4-68.3 35.9-5.5 13.2 73.7 30.8 6.9-16.5-46.7-19.5 68.3-35.9 5.5-13.2-71.1-29.7zM226.4 168l-97.8 35 8.1 22.7 60.6-21.7-35.4 97.9 6.5 18.1L320 292.4l-8.1-22.7-64.2 23 35.4-97.9-6.5-18.2z" />
    </Svg>
  );
}

function ChatIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M20.7134 8.12811L20.4668 8.69379C20.2864 9.10792 19.7136 9.10792 19.5331 8.69379L19.2866 8.12811C18.8471 7.11947 18.0555 6.31641 17.0677 5.87708L16.308 5.53922C15.8973 5.35653 15.8973 4.75881 16.308 4.57612L17.0252 4.25714C18.0384 3.80651 18.8442 2.97373 19.2761 1.93083L19.5293 1.31953C19.7058 0.893489 20.2942 0.893489 20.4706 1.31953L20.7238 1.93083C21.1558 2.97373 21.9616 3.80651 22.9748 4.25714L23.6919 4.57612C24.1027 4.75881 24.1027 5.35653 23.6919 5.53922L22.9323 5.87708C21.9445 6.31641 21.1529 7.11947 20.7134 8.12811ZM20 11C20.6986 11 21.3694 10.8806 21.9929 10.6611C21.9976 10.7735 22 10.8865 22 11C22 15.4183 18.4183 19 14 19V22.5C9 20.5 2 17.5 2 11C2 6.58172 5.58172 3 10 3H14C14.1135 3 14.2265 3.00237 14.3389 3.00705C14.1194 3.63061 14 4.30136 14 5C14 8.31371 16.6863 11 20 11Z" />
    </Svg>
  );
}

// Individual action button with premium spring & icon lift interaction
function QuickActionButton({ action, index, textColor }: {
  action: QuickAction;
  index: number;
  textColor: string;
}) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);
  const iconTranslateY = useSharedValue(0);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: withSpring(glow.value * 0.35, { damping: 15 }),
    shadowColor: action.color,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 1 + (1 - scale.value) * 1.5 }],
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: iconTranslateY.value } as any,
      { scale: 1 + (1 - scale.value) * 0.25 } as any,
    ],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.88, { damping: 14, stiffness: 350 });
    glow.value = withSpring(1, { damping: 12 });
    iconTranslateY.value = withSpring(-3, { damping: 10 });
  }, [scale, glow, iconTranslateY]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 280 });
    glow.value = withSpring(0, { damping: 12 });
    iconTranslateY.value = withSpring(0, { damping: 10 });
  }, [scale, glow, iconTranslateY]);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).duration(400)}
      style={styles.actionWrapper}
    >
      <View style={styles.buttonContainer}>
        {/* Outer Glow Halo Ring */}
        <Animated.View
          style={[
            styles.glowRing,
            { borderColor: action.color },
            animatedGlowStyle,
          ]}
          pointerEvents="none"
        />

        {/* Tactile Button */}
        <Animated.View style={animatedCircleStyle}>
          <Pressable
            onPress={action.onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[
              styles.circle,
              { backgroundColor: `${action.color}14`, borderColor: `${action.color}25` },
            ]}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <Animated.View style={animatedIconStyle}>
              <action.Icon size={22} color={action.color} />
            </Animated.View>
          </Pressable>
        </Animated.View>
      </View>
      <Text style={[styles.label, { color: textColor }]}>
        {action.label}
      </Text>
    </Animated.View>
  );
}

export function QuickActionsBar({
  onBreathe,
  onMeditate,
  onSleep,
  onOpenChat,
  onOpenJournal,
}: QuickActionsBarProps) {
  const { colors } = useTheme();

  const actions: QuickAction[] = [
    {
      id: 'breathing',
      label: 'Breathe',
      Icon: LeafIcon,
      color: '#06B6D4',
      onPress: onBreathe ?? (() => {}),
    },
    {
      id: 'journal',
      label: 'Journal',
      Icon: JournalIcon,
      color: '#EC4899',
      onPress: onOpenJournal ?? (() => {}),
    },
    {
      id: 'meditation',
      label: 'Meditate',
      Icon: SelfImprovementIcon,
      color: '#F59E0B',
      onPress: onMeditate ?? (() => {}),
    },
    {
      id: 'sleep',
      label: 'Sleep',
      Icon: SleepIcon,
      color: '#3B82F6',
      onPress: onSleep ?? (() => {}),
    },
    {
      id: 'chat',
      label: 'AI Chat',
      Icon: ChatIcon,
      color: '#10B981',
      onPress: onOpenChat ?? (() => {}),
    },
  ];

  return (
    <View style={styles.container}>
      {actions.map((action, index) => (
        <QuickActionButton
          key={action.id}
          action={action}
          index={index}
          textColor={colors.text.secondary}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  actionWrapper: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  buttonContainer: {
    position: 'relative',
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    zIndex: -1,
  },
  circle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});

export default QuickActionsBar;
