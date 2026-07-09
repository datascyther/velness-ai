// src/features/home/components/MoodTimeline.tsx
//
// Compact sparkline SVG for the WeeklyHistoryCard mini chart.
// - Height: 56px (down from 120px)
// - Stroke: 2px crisp line + area fill, no shimmer glow
// - Draw animation: path stroke-dashoffset sweeps in on mount

import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

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

export const MoodTimeline = React.memo(({ points, svgWidth, svgHeight }: MoodTimelineProps) => {
  const { colors } = useTheme();

  // Draw-itself: stroke-dashoffset from full length → 0
  // We approximate path length as 2× svgWidth (generous upper bound)
  const pathLength = svgWidth * 2;
  const drawProgress = useSharedValue(pathLength);

  useEffect(() => {
    drawProgress.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [drawProgress]);

  const animatedLineProps = useAnimatedProps(() => ({
    strokeDashoffset: drawProgress.value,
  }));

  const { pathD, areaD } = useMemo(() => {
    const padding = 6;
    const baseline = svgHeight - padding;

    const validPoints = points
      .filter((p) => p.moodLevel !== null)
      .sort((a, b) => a.x - b.x);

    if (validPoints.length < 2) {
      return { pathD: '', areaD: '' };
    }

    const clampY = (y: number) =>
      Math.min(baseline - padding, Math.max(padding, y));

    const normalized = validPoints.map((p) => ({ ...p, y: clampY(p.y) }));

    let d = `M ${normalized[0].x} ${normalized[0].y}`;
    for (let i = 1; i < normalized.length; i++) {
      const prev = normalized[i - 1];
      const curr = normalized[i];
      const cx = (prev.x + curr.x) / 2;
      d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const a = `${d} L ${normalized[normalized.length - 1].x} ${baseline} L ${normalized[0].x} ${baseline} Z`;

    return { pathD: d, areaD: a };
  }, [points, svgHeight]);

  if (!pathD) return <View style={{ height: svgHeight }} />;

  return (
    <Svg width={svgWidth} height={svgHeight}>
      <Defs>
        <LinearGradient id="areaGradCompact" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.text.tertiary} stopOpacity={0.18} />
          <Stop offset="1" stopColor={colors.text.tertiary} stopOpacity={0.02} />
        </LinearGradient>
        <LinearGradient id="lineGradCompact" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#06B6D4" />
          <Stop offset="100%" stopColor="#06B6D4" />
        </LinearGradient>
      </Defs>

      {/* Area fill */}
      {areaD.length > 0 && (
        <Path d={areaD} fill="url(#areaGradCompact)" />
      )}

      {/* Animated crisp line */}
      {pathD.length > 0 && (
        <AnimatedPath
          d={pathD}
          stroke="url(#lineGradCompact)"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={pathLength}
          animatedProps={animatedLineProps}
          opacity={0.95}
        />
      )}
    </Svg>
  );
});

MoodTimeline.displayName = 'MoodTimeline';
