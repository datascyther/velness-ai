import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';
import { TabName, useNavigationContext } from './NavigationContext';
import IconWrapper from './IconWrapper';
import Badge from './Badge';

const springConfig: WithSpringConfig = {
  stiffness: 300,
  damping: 15,
  mass: 1,
};

interface NavigationItemProps {
  name: TabName;
  label: string;
  hint: string;
}

export function NavigationItem({ name, label, hint }: NavigationItemProps) {
  const {
    activeTab,
    pressedTab,
    setPressedTab,
    disabledTabs,
    badges,
    colors,
    onTabPress,
  } = useNavigationContext();

  const isActive = activeTab === name;
  const isDisabled = disabledTabs.includes(name);
  const badgeCount = badges[name] ?? 0;

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (isDisabled) return;
    setPressedTab(name);
    scale.value = withSpring(0.9, springConfig);
  };

  const handlePressOut = () => {
    if (isDisabled) return;
    setPressedTab(null);
    scale.value = withSpring(1, springConfig);
  };

  const handlePress = () => {
    if (isDisabled) return;
    onTabPress(name);
  };

  let textColor: string;
  if (isDisabled) {
    textColor = colors.text.disabled;
  } else if (isActive) {
    textColor = colors.brand.primary;
  } else {
    textColor = colors.text.secondary;
  }

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive, disabled: isDisabled }}
      accessibilityLabel={label}
      accessibilityHint={hint}
      style={styles.pressable}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.iconContainer}>
          <IconWrapper
            name={name}
            isActive={isActive}
            isPressed={pressedTab === name}
            isDisabled={isDisabled}
          />
          <Badge count={badgeCount} />
        </View>
        <Text style={[styles.label, { color: textColor }]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});

export default NavigationItem;
