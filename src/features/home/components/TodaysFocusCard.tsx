/**
 * TodaysFocusCard — Recommended daily wellness activity card.
 *
 * Displays:
 *  • "Today's Focus" section header
 *  • Featured activity card (e.g., breathing exercise)
 *  • Activity metadata: duration, category, difficulty
 *  • CTA button to begin the activity
 *
 * Uses GlassCard for the outer container and features
 * a subtle inner highlight for the activity preview.
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Wind, Clock, ChevronRight, Sparkles } from 'lucide-react-native';
import { GlassCard } from '@/shared/components/GlassCard';

// ── Types ──────────────────────────────────────────────────────────────────

interface FocusActivity {
  /** Activity title. */
  title: string;
  /** Short description. */
  description: string;
  /** Duration in minutes. */
  durationMinutes: number;
  /** Category label. */
  category: string;
  /** Activity icon colour hex. */
  iconColor: string;
}

// ── Default activity (can be replaced by backend data) ─────────────────────

const DEFAULT_FOCUS: FocusActivity = {
  title: 'Mindful Breathing',
  description: 'A guided breathing exercise to reduce stress and improve focus.',
  durationMinutes: 5,
  category: 'Meditation',
  iconColor: '#22D3EE',
};

// ── Component ──────────────────────────────────────────────────────────────

interface TodaysFocusCardProps {
  /** Activity data — falls back to default breathing exercise. */
  activity?: FocusActivity;
  /** Callback when "Start" is pressed. */
  onStartPress?: () => void;
}

export function TodaysFocusCard({
  activity = DEFAULT_FOCUS,
  onStartPress,
}: TodaysFocusCardProps) {
  const ctaScale = useSharedValue(1);

  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  const handleCtaPressIn = () => {
    ctaScale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handleCtaPressOut = () => {
    ctaScale.value = withSpring(1, { damping: 12, stiffness: 300 });
  };

  return (
    <Animated.View entering={FadeInDown.delay(300).duration(500).springify()}>
      <GlassCard intensity="dark" className="mx-5 mb-4">
        {/* Section header */}
        <View className="flex-row items-center mb-4">
          <Sparkles size={16} color="#A78BFA" />
          <Text className="text-velness-purple-300 text-label font-semibold ml-1.5 uppercase tracking-wide">
            Today's Focus
          </Text>
        </View>

        {/* Activity card inner */}
        <View className="bg-white/5 rounded-glass p-4 border border-white/5">
          <View className="flex-row items-start">
            {/* Icon container */}
            <View
              className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
              style={{ backgroundColor: `${activity.iconColor}15` }}
            >
              <Wind size={22} color={activity.iconColor} />
            </View>

            {/* Content */}
            <View className="flex-1">
              <Text className="text-white text-body font-semibold">
                {activity.title}
              </Text>
              <Text className="text-white/40 text-body-sm mt-1" numberOfLines={2}>
                {activity.description}
              </Text>

              {/* Meta row */}
              <View className="flex-row items-center mt-3">
                <View className="flex-row items-center mr-4">
                  <Clock size={12} color="rgba(255,255,255,0.35)" />
                  <Text className="text-white/35 text-caption ml-1">
                    {activity.durationMinutes} min
                  </Text>
                </View>
                <View className="bg-velness-purple-600/20 px-2.5 py-0.5 rounded-full">
                  <Text className="text-velness-purple-300 text-caption font-medium">
                    {activity.category}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* CTA button */}
          <Animated.View style={ctaAnimatedStyle} className="mt-4">
            <Pressable
              onPress={onStartPress}
              onPressIn={handleCtaPressIn}
              onPressOut={handleCtaPressOut}
              className="flex-row items-center justify-center bg-velness-purple-600 rounded-glass py-3 active:opacity-80"
              accessibilityLabel={`Start ${activity.title}`}
              accessibilityRole="button"
            >
              <Text className="text-white text-body-sm font-semibold mr-1.5">
                Start Session
              </Text>
              <ChevronRight size={16} color="#FFFFFF" />
            </Pressable>
          </Animated.View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

export default TodaysFocusCard;
