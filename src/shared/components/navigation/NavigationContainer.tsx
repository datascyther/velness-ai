import React, { useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useNavigationContext } from './NavigationContext';
import ActiveIndicator from './ActiveIndicator';
import { LAYOUT } from '@/shared/constants';

interface NavigationContainerProps {
  children: React.ReactNode;
  activeIndex: number;
  totalTabs: number;
}

export function NavigationContainer({
  children,
  activeIndex,
  totalTabs,
}: NavigationContainerProps) {
  const { theme, colors } = useNavigationContext();
  const insets = useSafeAreaInsets();
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  // Border colors matching light/dark theme
  const containerBorderColor =
    theme === 'dark'
      ? 'rgba(255, 255, 255, 0.12)' // More visible glass borders
      : 'rgba(0, 0, 0, 0.08)';

  const shadowColor = theme === 'dark' ? '#000000' : '#475569';

  // Float bar at the bottom, adjusting position based on safe-area bottom inset
  const bottomPosition = Math.max(LAYOUT.TAB_BAR_MARGIN, insets.bottom);

  return (
    <View
      onLayout={handleLayout}
      style={[
        styles.container,
        {
          borderColor: containerBorderColor,
          shadowColor: shadowColor,
          bottom: bottomPosition,
          // CSS Backdrop Blur filter for Web targets (automatically ignored on mobile)
          ...({
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
          } as any),
        },
      ]}
    >
      {/* 1. Native frosted blur layer */}
      <BlurView
        intensity={theme === 'dark' ? 65 : 85}
        tint={theme === 'dark' ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. Refined Svg glass reflection & gradient overlay */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="glassGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="rgba(139, 92, 246, 0.18)" stopOpacity={1} />
              <Stop offset="50%" stopColor="rgba(26, 20, 42, 0.60)" stopOpacity={1} />
              <Stop offset="100%" stopColor="rgba(11, 8, 20, 0.94)" stopOpacity={1} />
            </LinearGradient>
            <LinearGradient id="glassGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.50)" stopOpacity={1} />
              <Stop offset="50%" stopColor="rgba(240, 244, 248, 0.45)" stopOpacity={1} />
              <Stop offset="100%" stopColor="rgba(255, 255, 255, 0.88)" stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect
            width="100%"
            height="100%"
            rx={24}
            fill={theme === 'dark' ? 'url(#glassGradientDark)' : 'url(#glassGradientLight)'}
          />
        </Svg>
      </View>

      {/* 3. Glossy top border reflection highlight */}
      <View
        style={[
          styles.glassHighlight,
          {
            backgroundColor:
              theme === 'dark'
                ? 'rgba(255, 255, 255, 0.16)'
                : 'rgba(255, 255, 255, 0.75)',
          },
        ]}
      />

      <ActiveIndicator
        activeIndex={activeIndex}
        totalTabs={totalTabs}
        containerWidth={containerWidth}
      />
      <View style={styles.contentRow}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: LAYOUT.TAB_BAR_MARGIN,
    right: LAYOUT.TAB_BAR_MARGIN,
    height: LAYOUT.TAB_BAR_HEIGHT,
    borderRadius: 24,
    borderWidth: 1,
    elevation: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    zIndex: 100,
    justifyContent: 'center',
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1.2,
    zIndex: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    zIndex: 3,
  },
});

export default NavigationContainer;
