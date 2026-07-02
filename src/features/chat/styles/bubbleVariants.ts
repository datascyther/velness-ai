import type { ViewStyle, DimensionValue } from 'react-native';
import { spacing, borderRadius } from '@/core/theme/tokens';

interface BubbleContainerStyle {
  marginVertical?: number;
  marginBottom?: number;
  maxWidth?: DimensionValue;
  borderRadius?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  flexDirection?: ViewStyle['flexDirection'];
  justifyContent?: ViewStyle['justifyContent'];
  width?: DimensionValue;
}

interface BubbleWrapperStyle {
  flexDirection?: ViewStyle['flexDirection'];
  alignItems?: ViewStyle['alignItems'];
  maxWidth?: DimensionValue;
}

interface BubbleInnerStyle {
  borderRadius?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  shadowOffset?: ViewStyle['shadowOffset'];
  shadowOpacity?: ViewStyle['shadowOpacity'];
  shadowRadius?: ViewStyle['shadowRadius'];
  elevation?: ViewStyle['elevation'];
}

export interface BubbleVariant {
  container: BubbleContainerStyle;
  wrapper?: BubbleWrapperStyle;
  bubble?: BubbleInnerStyle;
}

export const aiBubble: BubbleVariant = {
  container: {
    marginBottom: spacing.sm,
    maxWidth: '88%',
    borderRadius: 18,
    paddingHorizontal: spacing.xl,
    paddingVertical: 18,
  },
};

export const userBubble: BubbleVariant = {
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.sm,
    width: '100%',
  },
  wrapper: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    maxWidth: '82%',
  },
  bubble: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: 18,
    paddingVertical: spacing.lg,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
};
