import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/core/theme';

export const WeeklyHistoryHeader = React.memo(() => {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const formatDate = (d: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  const liquid = useSharedValue(0);

  useEffect(() => {
    liquid.value = withRepeat(
      withTiming(1, {
        duration: 5600,
        easing: Easing.bezier(0.42, 0, 0.58, 1),
      }),
      -1,
      true
    );
  }, [liquid]);

  const orbAStyle = useAnimatedStyle(() => ({
    opacity: interpolate(liquid.value, [0, 1], [0.55, 0.82]),
    transform: [
      { translateX: interpolate(liquid.value, [0, 1], [-10, 18]) } as any,
      { translateY: interpolate(liquid.value, [0, 1], [4, -12]) } as any,
      { scale: interpolate(liquid.value, [0, 1], [0.94, 1.08]) } as any,
    ],
  }));

  const orbBStyle = useAnimatedStyle(() => ({
    opacity: interpolate(liquid.value, [0, 1], [0.26, 0.48]),
    transform: [
      { translateX: interpolate(liquid.value, [0, 1], [14, -16]) } as any,
      { translateY: interpolate(liquid.value, [0, 1], [-8, 10]) } as any,
      { scale: interpolate(liquid.value, [0, 1], [1.06, 0.96]) } as any,
    ],
  }));

  const sheenStyle = useAnimatedStyle(() => ({
    opacity: interpolate(liquid.value, [0, 0.5, 1], [0.12, 0.38, 0.12]),
    transform: [
      { translateX: interpolate(liquid.value, [0, 1], [-230, 230]) } as any,
      { rotate: '-18deg' } as any,
    ],
  }));

  const borderColors = isDark
    ? (['rgba(255,255,255,0.34)', 'rgba(125,211,252,0.18)', 'rgba(255,255,255,0.06)'] as const)
    : (['rgba(255,255,255,0.92)', 'rgba(96,165,250,0.28)', 'rgba(255,255,255,0.46)'] as const);

  const glassBackground = isDark
    ? 'rgba(10, 16, 30, 0.58)'
    : 'rgba(255, 255, 255, 0.58)';

  return (
    <View style={styles.header}>
      <LinearGradient
        colors={borderColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.borderShell}
      >
        <BlurView
          intensity={isDark ? 36 : 58}
          tint={isDark ? 'dark' : 'light'}
          style={[styles.glass, { backgroundColor: glassBackground }]}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.liquidOrb,
              styles.orbA,
              {
                backgroundColor: isDark
                  ? 'rgba(56, 189, 248, 0.34)'
                  : 'rgba(59, 130, 246, 0.22)',
              },
              orbAStyle,
            ]}
          />

          <Animated.View
            pointerEvents="none"
            style={[
              styles.liquidOrb,
              styles.orbB,
              {
                backgroundColor: isDark
                  ? 'rgba(168, 85, 247, 0.26)'
                  : 'rgba(236, 72, 153, 0.16)',
              },
              orbBStyle,
            ]}
          />

          <Animated.View pointerEvents="none" style={[styles.sheen, sheenStyle]}>
            <LinearGradient
              colors={[
                'rgba(255,255,255,0)',
                'rgba(255,255,255,0.48)',
                'rgba(255,255,255,0)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>

          <View style={styles.contentRow}>
            <View style={styles.copyBlock}>
              <View style={styles.metaRow}>
                <LinearGradient
                  colors={
                    isDark
                      ? ['#67E8F9', '#A78BFA']
                      : ['#2563EB', '#EC4899']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statusDot}
                />

                <Text
                  style={[
                    styles.eyebrow,
                    {
                      color: isDark
                        ? 'rgba(226,232,240,0.74)'
                        : 'rgba(15,23,42,0.58)',
                    },
                  ]}
                >
                  THIS WEEK
                </Text>
              </View>

              <Text
                style={[
                  styles.title,
                  {
                    color: colors.text.primary,
                    textShadowColor: isDark
                      ? 'rgba(125, 211, 252, 0.22)'
                      : 'rgba(59, 130, 246, 0.14)',
                  },
                ]}
              >
                Mood Timeline
              </Text>

              <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                {formatDate(startOfWeek)} — {formatDate(endOfWeek)}
              </Text>
            </View>

            <LinearGradient
              colors={
                isDark
                  ? ['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.06)']
                  : ['rgba(255,255,255,0.78)', 'rgba(255,255,255,0.34)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.rangePill,
                {
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.12)'
                    : 'rgba(255,255,255,0.78)',
                },
              ]}
            >
              <Text
                style={[
                  styles.rangePillText,
                  {
                    color: isDark
                      ? 'rgba(248,250,252,0.92)'
                      : 'rgba(15,23,42,0.74)',
                  },
                ]}
              >
                7D
              </Text>
            </LinearGradient>
          </View>

          <LinearGradient
            pointerEvents="none"
            colors={[
              'rgba(255,255,255,0)',
              isDark ? 'rgba(125,211,252,0.34)' : 'rgba(59,130,246,0.28)',
              'rgba(255,255,255,0)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bottomGlow}
          />
        </BlurView>
      </LinearGradient>
    </View>
  );
});

WeeklyHistoryHeader.displayName = 'WeeklyHistoryHeader';

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
    minHeight: 104,
  },

  borderShell: {
    borderRadius: 28,
    padding: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.2,
        shadowRadius: 34,
      },
      android: {
        elevation: 12,
      },
    }),
  },

  glass: {
    minHeight: 104,
    borderRadius: 27,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 16,
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.26)',
  },

  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    zIndex: 2,
  },

  copyBlock: {
    flex: 1,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    marginRight: 7,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
    lineHeight: 13,
  },

  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.55,
    lineHeight: 29,
    textShadowOffset: { width: 0, height: 8 },
    textShadowRadius: 22,
  },

  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
    opacity: 0.66,
    letterSpacing: 0.12,
    lineHeight: 17,
  },

  rangePill: {
    minWidth: 48,
    height: 38,
    paddingHorizontal: 13,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },

  rangePillText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  liquidOrb: {
    position: 'absolute',
    borderRadius: 999,
    zIndex: 0,
  },

  orbA: {
    width: 132,
    height: 132,
    top: -54,
    right: -34,
  },

  orbB: {
    width: 164,
    height: 164,
    left: 58,
    bottom: -104,
  },

  sheen: {
    position: 'absolute',
    top: -44,
    bottom: -44,
    width: 86,
    zIndex: 1,
  },

  bottomGlow: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 0,
    height: 1,
    opacity: 0.88,
  },
});