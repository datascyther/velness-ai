import React, { useMemo, useEffect } from 'react';
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

  const shimmerPos = useSharedValue(0);

  useEffect(() => {
    shimmerPos.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
  }, [shimmerPos]);

  const shimmerProps = useAnimatedProps(() => ({
    x1: `${shimmerPos.value * 100}%`,
    x2: `${(shimmerPos.value * 100) + 30}%`,
  }));

  const pathD = useMemo(() => {
    const validPoints = points.filter(p => p.moodLevel !== null);
    if (validPoints.length < 2) return '';

    let d = `M ${validPoints[0].x} ${validPoints[0].y}`;
    for (let i = 1; i < validPoints.length; i++) {
      const prev = validPoints[i - 1];
      const curr = validPoints[i];
      const cx1 = (prev.x + curr.x) / 2;
      const cx2 = (prev.x + curr.x) / 2;
      d += ` C ${cx1} ${prev.y}, ${cx2} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [points]);

  const areaD = useMemo(() => {
    const validPoints = points.filter(p => p.moodLevel !== null);
    if (validPoints.length < 2) return '';
    const last = validPoints[validPoints.length - 1];
    const first = validPoints[0];
    return `${pathD} L ${last.x} ${svgHeight - 10} L ${first.x} ${svgHeight - 10} Z`;
  }, [pathD, points, svgHeight]);

  return (
    <Svg
      width={svgWidth}
      height={svgHeight}
    >
      <Defs>
        <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.brand.primary} stopOpacity={0.25} />
          <Stop offset="0.5" stopColor={colors.brand.primary} stopOpacity={0.10} />
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
          <Stop offset="40%" stopColor="#FFFFFF" stopOpacity={0.35} />
          <Stop offset="70%" stopColor="#FFFFFF" stopOpacity={0.15} />
          <Stop offset="100%" stopColor="transparent" stopOpacity={0} />
        </AnimatedLinearGradient>
      </Defs>

      {areaD.length > 0 && (
        <Path
          d={areaD}
          fill="url(#areaGrad)"
        />
      )}

      {pathD.length > 0 && (
        <G>
          <Path
            d={pathD}
            stroke="url(#lineGrad)"
            strokeWidth={12}
            fill="none"
            strokeLinecap="round"
            opacity={0.08}
          />
          <Path
            d={pathD}
            stroke="url(#lineGrad)"
            strokeWidth={7}
            fill="none"
            strokeLinecap="round"
            opacity={0.2}
          />
          <Path
            d={pathD}
            stroke="url(#shimmerGrad)"
            strokeWidth={7}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={pathD}
            stroke="url(#lineGrad)"
            strokeWidth={3.5}
            fill="none"
            strokeLinecap="round"
            opacity={0.95}
          />
        </G>
      )}

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
