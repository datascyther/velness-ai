import React, { useEffect, useMemo } from 'react';
import Svg, { Path, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { MoodPoint } from './MoodPoint';

interface TimelinePoint {
  x: number;
  y: number;
  moodLevel: number | null;
}

interface MoodTimelineProps {
  points: TimelinePoint[];
  svgWidth: number;
  svgHeight: number;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const MoodTimeline = React.memo(({ points, svgWidth, svgHeight }: MoodTimelineProps) => {
  const { colors } = useTheme();

  // Subtle shimmer: keep it secondary so it doesn't feel “cluttered”.
  const shimmerPos = useSharedValue(0);

  useEffect(() => {
    shimmerPos.value = withRepeat(
      withTiming(1, { duration: 2800, easing: Easing.linear }),
      -1,
      false
    );
  }, [shimmerPos]);

  const shimmerProps = useAnimatedProps(() => ({
    x1: `${shimmerPos.value * 100}%`,
    x2: `${(shimmerPos.value * 100) + 22}%`,
  }));

  const { pathD, areaD, baselineY, validPointsSorted } = useMemo(() => {
    const padding = 10;
    const baseline = Math.max(padding, svgHeight - padding);

    const validPoints = points
      .filter((p) => p.moodLevel !== null)
      .slice()
      .sort((a, b) => a.x - b.x);

    if (validPoints.length < 2) {
      return { pathD: '', areaD: '', baselineY: baseline, validPointsSorted: validPoints };
    }

    // Clamp Y into drawable area to avoid weird “misaligned” shapes.
    const clampY = (y: number) => Math.min(baseline - padding, Math.max(padding, y));

    const normalized = validPoints.map((p) => ({ ...p, y: clampY(p.y) }));

    let d = `M ${normalized[0].x} ${normalized[0].y}`;
    for (let i = 1; i < normalized.length; i++) {
      const prev = normalized[i - 1];
      const curr = normalized[i];
      const cx = (prev.x + curr.x) / 2;
      d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const a = `${d} L ${normalized[normalized.length - 1].x} ${baseline} L ${normalized[0].x} ${baseline} Z`;

    return { pathD: d, areaD: a, baselineY: baseline, validPointsSorted: normalized };
  }, [points, svgHeight]);

  return (
    <Svg width={svgWidth} height={svgHeight}>
      <Defs>
        <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.brand.primary} stopOpacity={0.22} />
          <Stop offset="0.55" stopColor={colors.brand.primary} stopOpacity={0.09} />
          <Stop offset="1" stopColor={colors.brand.primary} stopOpacity={0.02} />
        </LinearGradient>

        <LinearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={colors.brand.secondary || '#8B5CF6'} />
          <Stop offset="50%" stopColor={colors.brand.primary} />
          <Stop offset="100%" stopColor="#06B6D4" />
        </LinearGradient>

        <AnimatedLinearGradient
          id="shimmerGrad"
          animatedProps={shimmerProps}
          y1="0%"
          y2="0%"
        >
          <Stop offset="0%" stopColor="transparent" stopOpacity={0} />
          <Stop offset="42%" stopColor="#FFFFFF" stopOpacity={0.25} />
          <Stop offset="70%" stopColor="#FFFFFF" stopOpacity={0.10} />
          <Stop offset="100%" stopColor="transparent" stopOpacity={0} />
        </AnimatedLinearGradient>
      </Defs>

      {/* Baseline track for engineering feel */}
      {validPointsSorted.length > 1 && (
        <Path
          d={`M ${validPointsSorted[0].x} ${baselineY} L ${validPointsSorted[validPointsSorted.length - 1].x} ${baselineY}`}
          stroke={colors.border.default}
          strokeWidth={1}
          opacity={0.12}
          strokeLinecap="round"
          fill="none"
        />
      )}

      {/* Area */}
      {areaD.length > 0 && <Path d={areaD} fill="url(#areaGrad)" />}

      {/* Single main line + subtle shimmer overlay */}
      {pathD.length > 0 && (
        <G>
          {/* Soft glow */}
          <Path
            d={pathD}
            stroke="url(#lineGrad)"
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
            opacity={0.16}
          />

          {/* Shimmer */}
          <Path
            d={pathD}
            stroke="url(#shimmerGrad)"
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
            opacity={0.7}
          />

          {/* Crisp core */}
          <Path
            d={pathD}
            stroke="url(#lineGrad)"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            opacity={0.95}
          />
        </G>
      )}

      {/* Points */}
      {points.map((p, i) => (
        <MoodPoint
          key={i}
          cx={p.x}
          cy={p.y}
          moodLevel={p.moodLevel}
          isToday={i === points.length - 1}
        />
      ))}
    </Svg>
  );
});

MoodTimeline.displayName = 'MoodTimeline';
