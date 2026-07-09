// src/features/home/components/HeroCard.tsx
//
// The primary hero card at the top of the Home narrative.
// A frosted surface layered over a moment-tinted, animated aurora with a
// time-of-day "aura orb" focal illustration. Typographic hierarchy:
// kicker → headline → subline → CTA → meta. Animates in with a soft
// staggered entrance; background breathes continuously (no jiggle).
//
// Tuned for BOTH themes: dark gradients stay subtle on dark surfaces,
// light gradients stay airy on light surfaces, and the aurora glows are
// kept faint so text always reads cleanly (no "burned" overlay).

import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  cancelAnimation,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

import type { NarrativeMoment } from '@/features/home/services/HomeViewModel';
import {
  getHeroGradient,
  buildStreakLabel,
  getTimeOfDay,
} from '@/features/home/utils/adaptiveContext';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius, shadows } from '@/core/theme';
import { HeroAura, getTimeOfDayKicker } from './HeroAura';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_RADIUS = borderRadius['2xl'];
const ORB = SCREEN_W * 0.72;

// Airy, on-brand light gradient (white → faint violet) — never a dark overlay.
const LIGHT_GRADIENT: [string, string, string] = ['#FFFFFF', '#F6F4FE', '#ECE7FB'];

interface HeroCardProps {
  headline: string;
  subline: string;
  ctaLabel: string;
  streak: number;
  dayCount: number;
  moment: NarrativeMoment;
  hasCheckedInToday: boolean;
  intention?: string;
  onCtaPress: () => void;
}

export function HeroCard({
  headline,
  subline,
  ctaLabel,
  streak,
  dayCount,
  moment,
  hasCheckedInToday,
  intention,
  onCtaPress,
}: HeroCardProps) {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  const gradient = isDark ? getHeroGradient(moment) : LIGHT_GRADIENT;
  const label = buildStreakLabel(streak);
  const timeOfDay = getTimeOfDay();
  const kicker = getTimeOfDayKicker(timeOfDay);

  // Faint ambient glows in light mode so they don't read as stains.
  const glowScale = isDark ? 1 : 0.4;

  // ── Continuous aurora drift (smooth, 18s loop) ──────────────────────────
  const t = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) {
      t.value = 0.5;
      return;
    }
    const ease = Easing.bezier(0.37, 0, 0.63, 1);
    t.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 18000, easing: ease }),
        withTiming(0, { duration: 18000, easing: ease }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(t);
  }, [t, reduced]);

  const purpleStyle = useAnimatedStyle(() => {
    const tx = 40 - t.value * 90;
    const ty = -20 - t.value * 50;
    const s = 0.96 + t.value * 0.16;
    return ({
      transform: [{ translateX: tx }, { translateY: ty }, { scale: s }],
      opacity: (0.16 + t.value * 0.12) * glowScale,
    } as any);
  });
  const cyanStyle = useAnimatedStyle(() => {
    const tx = -40 + t.value * 80;
    const ty = -10 - t.value * 60;
    const s = 1.04 - t.value * 0.16;
    return ({
      transform: [{ translateX: tx }, { translateY: ty }, { scale: s }],
      opacity: (0.12 + t.value * 0.12) * glowScale,
    } as any);
  });

  // ── CTA press response (spring, not a loop) ─────────────────────────────
  const ctaScale = useSharedValue(1);
  const ctaStyle = useAnimatedStyle(() => ({ transform: [{ scale: ctaScale.value }] }));
  const handlePressIn = () => {
    ctaScale.value = withSpring(0.96, { damping: 14, stiffness: 380 });
  };
  const handlePressOut = () => {
    ctaScale.value = withSpring(1, { damping: 12, stiffness: 300 });
  };

  return (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.wrapper}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface.primary,
            borderColor: colors.border.default,
            shadowColor: colors.brand.primary,
          },
          shadows.glass,
        ]}
      >
        {/* ── Background layers (clipped to card) ─────────────────────────── */}
        {/* `zIndex: 0` keeps every decorative layer explicitly beneath the
            foreground content in the web build, so the near-white light-mode
            gradient can never paint over — and wash out — the CTA. */}
        <View style={[StyleSheet.absoluteFill, { borderRadius: CARD_RADIUS, overflow: 'hidden', zIndex: 0 }]}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
              style={[styles.gradientTint, { opacity: isDark ? 0.42 : 0.6 }]}
          />

          <Animated.View style={[styles.orbPurple, purpleStyle]}>
            <Svg width={ORB} height={ORB}>
              <Defs>
                <RadialGradient id="heroPurple" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.14} />
                  <Stop offset="35%" stopColor="#7C3AED" stopOpacity={0.06} />
                  <Stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#heroPurple)" />
            </Svg>
          </Animated.View>

          <Animated.View style={[styles.orbCyan, cyanStyle]}>
            <Svg width={ORB} height={ORB}>
              <Defs>
                <RadialGradient id="heroCyan" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#06B6D4" stopOpacity={0.10} />
                  <Stop offset="30%" stopColor="#0891B2" stopOpacity={0.04} />
                  <Stop offset="100%" stopColor="#0891B2" stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#heroCyan)" />
            </Svg>
          </Animated.View>

          {/* Time-of-day focal illustration, tucked into the top-right corner */}
          <View style={styles.auraWrap} pointerEvents="none">
            <HeroAura timeOfDay={timeOfDay} size={isDark ? 104 : 96} />
          </View>
        </View>

        {/* Top inner highlight (glass sheen) */}
        <View style={[styles.sheen, { borderColor: colors.border.strong, zIndex: 0 }]} pointerEvents="none" />

        {/* ── Foreground content ──────────────────────────────────────────── */}
        {/* `position: relative` + zIndex lifts content above the absolutely
            positioned background layers (gradient/orbs/aura) so they can't
            paint over — and wash out — the CTA in the web build. */}
        <View style={[styles.content, { position: 'relative', zIndex: 2 }]}>
          {label ? (
            <Animated.View
              entering={FadeInDown.delay(80).duration(400)}
              style={[styles.badge, { backgroundColor: colors.surface.tertiary }]}
            >
              <Text style={[styles.badgeText, { color: colors.text.secondary }]}>{label}</Text>
            </Animated.View>
          ) : (
            <Animated.Text
              entering={FadeInDown.delay(80).duration(400)}
              style={[styles.kicker, { color: colors.text.secondary }]}
            >
              {kicker}
            </Animated.Text>
          )}

          {!label && <View style={styles.kickerSpacer} />}

          <Animated.Text
            entering={FadeInDown.delay(140).duration(500)}
            style={[styles.headline, { color: colors.text.primary }]}
          >
            {headline}
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(200).duration(500)}
            style={[styles.subline, { color: colors.text.secondary }]}
          >
            {subline}
          </Animated.Text>

          {intention ? (
            <Animated.View
              entering={FadeInDown.delay(240).duration(500)}
              style={styles.intentionContainer}
            >
              <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
              <Text style={[styles.intentionEyebrow, { color: colors.text.tertiary }]}>
                Today's Intention
              </Text>
              <Text style={[styles.intentionText, { color: colors.text.primary }]}>
                {intention}
              </Text>
            </Animated.View>
          ) : null}

          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            style={[styles.ctaSlot, { position: 'relative', zIndex: 2 }, ctaStyle]}
          >
            <Pressable
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={onCtaPress}
              style={({ pressed }) => [
                styles.cta,
                styles.ctaShadow,
                {
                  backgroundColor: colors.brand.primary,
                  borderColor: colors.brand.border,
                  shadowColor: colors.brand.primary,
                },
                pressed && styles.ctaPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={ctaLabel}
            >
              <Text style={[styles.ctaText, { color: colors.text.onBrand }]}>{ctaLabel}</Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(340).duration(500)} style={styles.metaRow}>
            <Text style={[styles.metaText, { color: colors.text.tertiary }]}>
              {dayCount > 0 ? `Day ${dayCount}` : 'Welcome'}
            </Text>
            {streak > 0 && (
              <View style={[styles.streakPill, { backgroundColor: colors.surface.tertiary }]}>
                <Text style={[styles.streakText, { color: colors.text.secondary }]}>
                  {streak} day streak
                </Text>
              </View>
            )}
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
  },
  card: {
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gradientTint: {
    ...StyleSheet.absoluteFillObject,
  },
  orbPurple: {
    position: 'absolute',
    width: ORB,
    height: ORB,
    top: -ORB * 0.34,
    left: -ORB * 0.2,
  },
  orbCyan: {
    position: 'absolute',
    width: ORB,
    height: ORB,
    top: -ORB * 0.22,
    right: -ORB * 0.24,
  },
  auraWrap: {
    position: 'absolute',
    top: -14,
    right: -2,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    borderTopWidth: 1,
    opacity: 0.3,
  },
  content: {
    padding: spacing['2xl'],
    minHeight: 216,
    justifyContent: 'flex-end',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  kickerSpacer: {
    height: spacing.sm,
  },
  headline: {
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  subline: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  ctaSlot: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  cta: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaShadow: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  streakPill: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '600',
  },
  intentionContainer: {
    marginBottom: spacing.md,
    gap: 4,
  },
  divider: {
    height: 1,
    width: '100%',
    opacity: 0.25,
    marginVertical: spacing.sm,
  },
  intentionEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  intentionText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: -0.1,
  },
});

export default HeroCard;
