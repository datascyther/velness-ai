import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';

// ── Real reanimated isAnimated (copied from react-native-reanimated 4.1.7) ──
export function isAnimated(prop) {
  if (Array.isArray(prop)) return prop.some(isAnimated);
  else if (typeof prop === 'object' && prop !== null) {
    if (prop.onFrame !== undefined) return true;
    return Object.values(prop).some(isAnimated);
  }
  return false;
}

// Instrumented check: replicate when reanimated's createAnimatedComponent calls
// isAnimated on a prop. `entering`/`exiting` use animation objects (onFrame) so
// they short-circuit; a plain circular object in `style` recurses -> RangeError.
function checkProps(props, name) {
  for (const [key, v] of Object.entries(props)) {
    if (v == null) continue;
    if (typeof v === 'function') continue;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') continue;
    if (v.$$typeof) continue; // React element
    try {
      isAnimated(v);
    } catch (e) {
      if (e instanceof RangeError) {
        const stack = new Error().stack;
        throw new Error(
          `[RECURSION] circular object detected in prop "${key}" of <${name}>: ${e.message}\n${stack}`
        );
      }
      throw e;
    }
  }
}

function wrap(Comp, name) {
  const W = (props) => {
    checkProps(props, name);
    return React.createElement(Comp, props);
  };
  W.displayName = name;
  return W;
}

const makeAnim = () => {
  const a = { onFrame: () => {} };
  const chain = () => a;
  a.duration = chain;
  a.delay = chain;
  a.springify = chain;
  a.damping = chain;
  a.stiffness = chain;
  a.mass = chain;
  return a;
};

export const FadeIn = makeAnim();
export const FadeInDown = makeAnim();
export const FadeInUp = makeAnim();
export const ZoomIn = makeAnim();

export const Animated = {
  View: wrap(View, 'Animated.View'),
  Text: wrap(Text, 'Animated.Text'),
  Pressable: wrap(Pressable, 'Animated.Pressable'),
  ScrollView: wrap(ScrollView, 'Animated.ScrollView'),
  Image: wrap(Image, 'Animated.Image'),
  FlatList: wrap(FlatList, 'Animated.FlatList'),
  Modal: wrap(Modal, 'Animated.Modal'),
  createAnimatedComponent: (C) =>
    wrap(C, (C && (C.displayName || C.name)) || 'AnimatedComponent'),
};

export const useAnimatedStyle = (fn) => {
  try {
    return fn();
  } catch {
    return {};
  }
};
export const useAnimatedProps = (fn) => {
  try {
    return fn();
  } catch {
    return {};
  }
};
export const useDerivedValue = () => ({ value: undefined });
export const useSharedValue = (v) => ({
  value: v,
  addEventListener() {},
  removeEventListener() {},
  modify() {},
  set() {},
});
export const useAnimatedScrollHandler = () => () => {};
export const useAnimatedRef = () => ({ current: null });
export const useAnimatedReaction = () => {};
export const useReducedMotion = () => false;
export const useAnimatedKeyboard = () => ({ height: { value: 0 }, state: { value: 0 } });
export const useAnimatedSensor = () => ({ sensor: {}, event: { value: {} } });
export const useHandler = () => () => {};
export const useEvent = () => () => {};
export const useComposedEventHandler = () => () => {};
export const useFrameCallback = () => ({ isRegistered: false });
export const useScrollOffset = () => ({ value: 0 });
export const makeMutable = (v) => ({ value: v });
export const runOnJS = (fn) => fn;
export const withTiming = (v) => v;
export const withSpring = (v) => v;
export const withDelay = (d, a) => a;
export const withSequence = (...a) => a[a.length - 1];
export const withRepeat = (a) => a;
export const withDecay = (a) => a;
export const cancelAnimation = () => {};
export const interpolateColor = (v) => v;
export const Extrapolate = { EXTEND: 'extend', CLAMP: 'clamp', IDENTITY: 'identity' };
export const Easing = {
  linear: (v) => v,
  ease: (v) => v,
  out: (v) => v,
  in: (v) => v,
  inOut: (v) => v,
  bezier: () => (v) => v,
  back: () => (v) => v,
  circle: () => (v) => v,
  elastic: () => (v) => v,
  bounce: () => (v) => v,
};
export const defineAnimation = (a) => a;
export const configureReanimatedLogger = () => {};
export const enableLayoutAnimations = () => {};
export const getViewProp = () => Promise.resolve();
export const isConfigured = () => true;
export const isColor = () => true;
export const processColor = (c) => c;
export const convertToRGBA = (c) => c;
export default Animated;
