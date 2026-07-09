/**
 * HeroAura — Decorative time-of-day "aura orb" for the HeroCard.
 *
 * A soft glowing celestial motif that adapts to the time of day:
 *   • morning / afternoon → a warm breathing sun with rays
 *   • evening / night     → a cool crescent moon with stars
 *
 * Rendered with react-native-svg only (Android-safe, no DOM SVG).
 * Motion is calm and continuous — a slow "breathe" on the glow and a
 * gentle scale on the orb — never a jiggle.
 */

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Line,
  Path,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';

import type { TimeOfDay } from '@/features/home/utils/adaptiveContext';

const PALETTE: Record<TimeOfDay, { light: string; dark: string }> = {
  morning: { light: '#FBD36B', dark: '#F59E57' },
  afternoon: { light: '#FCE08A', dark: '#F8A766' },
  evening: { light: '#C9BCFD', dark: '#A78BFA' },
  night: { light: '#8ED6FC', dark: '#67E8F9' },
};

const KICKER: Record<TimeOfDay, string> = {
  morning: '☀ Good Morning',
  afternoon: '☀️ Good Afternoon',
  evening: '🌇 Good Evening',
  night: '🌙 Good Night',
};

export function getTimeOfDayKicker(timeOfDay: TimeOfDay): string {
  return KICKER[timeOfDay];
}

function isMoon(timeOfDay: TimeOfDay): boolean {
  return timeOfDay === 'evening' || timeOfDay === 'night';
}

interface HeroAuraProps {
  timeOfDay: TimeOfDay;
  size?: number;
}

export function HeroAura({ timeOfDay, size = 120 }: HeroAuraProps) {
  const { light, dark } = PALETTE[timeOfDay];
  const glowId = `auraGlow-${timeOfDay}`;
  const orbId = `auraOrb-${timeOfDay}`;
  const moon = isMoon(timeOfDay);

  const breathe = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      breathe.value = 0.5;
      scale.value = 1;
      rotate.value = 0;
      return;
    }
    const ease = Easing.inOut(Easing.ease);
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4200, easing: ease }),
        withTiming(0, { duration: 4200, easing: ease }),
      ),
      -1,
      true,
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.035, { duration: 5200, easing: ease }),
        withTiming(0.985, { duration: 5200, easing: ease }),
      ),
      -1,
      true,
    );
    // Slow, continuous rotation of the entire orb (sun rays / moon).
    rotate.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 60000, easing: Easing.linear }),
      -1,
      false,
    );
    return () => {
      cancelAnimation(breathe);
      cancelAnimation(scale);
      cancelAnimation(rotate);
    };
  }, [breathe, scale, rotate, reduced]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.26 + breathe.value * 0.22,
    transform: [
      { scale: 0.94 + breathe.value * 0.09 },
      // Soft "morning light" drift — a gentle translate as the glow breathes.
      { translateX: -6 + breathe.value * 12 },
      { translateY: 4 - breathe.value * 8 },
    ],
  } as any));

  const orbStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotate.value}rad` },
      { scale: scale.value },
    ],
  } as any));

  const rays = moon
    ? null
    : Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4;
        const x1 = 60 + Math.cos(a) * 27;
        const y1 = 60 + Math.sin(a) * 27;
        const x2 = 60 + Math.cos(a) * 35;
        const y2 = 60 + Math.sin(a) * 35;
        return (
          <Line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={light}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.85}
          />
        );
      });

  const stars = moon
    ? [
        { x: 86, y: 34, r: 2.4 },
        { x: 96, y: 52, r: 1.6 },
        { x: 80, y: 60, r: 1.8 },
      ].map((s, i) => (
        <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill={light} opacity={0.9} />
      ))
    : null;

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[glowStyle, { position: 'absolute', width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 120 120">
          <Defs>
            <RadialGradient id={glowId} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={light} stopOpacity={0.85} />
              <Stop offset="45%" stopColor={dark} stopOpacity={0.32} />
              <Stop offset="100%" stopColor={dark} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx="60" cy="60" r="54" fill={`url(#${glowId})`} />
        </Svg>
      </Animated.View>

      <Animated.View style={[orbStyle, { position: 'absolute', width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 120 120">
          <Defs>
            <LinearGradient id={orbId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={light} />
              <Stop offset="100%" stopColor={dark} />
            </LinearGradient>
          </Defs>
          {moon ? (
            <>
              <Path d="M62 26 A34 34 0 1 0 62 94 A26 26 0 1 1 62 26 Z" fill={`url(#${orbId})`} />
              {stars}
            </>
          ) : (
            <>
              <Circle cx="60" cy="60" r="21" fill={`url(#${orbId})`} />
              {rays}
            </>
          )}
        </Svg>
      </Animated.View>
    </View>
  );
}

export default HeroAura;
