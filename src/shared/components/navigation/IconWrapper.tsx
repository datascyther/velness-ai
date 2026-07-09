import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { TabName, useNavigationContext } from './NavigationContext';

const RiChatAiFillIcon = React.memo(function RiChatAiFillIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M20.7134 8.12811L20.4668 8.69379C20.2864 9.10792 19.7136 9.10792 19.5331 8.69379L19.2866 8.12811C18.8471 7.11947 18.0555 6.31641 17.0677 5.87708L16.308 5.53922C15.8973 5.35653 15.8973 4.75881 16.308 4.57612L17.0252 4.25714C18.0384 3.80651 18.8442 2.97373 19.2761 1.93083L19.5293 1.31953C19.7058 0.893489 20.2942 0.893489 20.4706 1.31953L20.7238 1.93083C21.1558 2.97373 21.9616 3.80651 22.9748 4.25714L23.6919 4.57612C24.1027 4.75881 24.1027 5.35653 23.6919 5.53922L22.9323 5.87708C21.9445 6.31641 21.1529 7.11947 20.7134 8.12811ZM20 11C20.6986 11 21.3694 10.8806 21.9929 10.6611C21.9976 10.7735 22 10.8865 22 11C22 15.4183 18.4183 19 14 19V22.5C9 20.5 2 17.5 2 11C2 6.58172 5.58172 3 10 3H14C14.1135 3 14.2265 3.00237 14.3389 3.00705C14.1194 3.63061 14 4.30136 14 5C14 8.31371 16.6863 11 20 11Z" />
    </Svg>
  );
});

const GiHorizonRoadIcon = React.memo(function GiHorizonRoadIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
      <Path d="M129.8 19.64 64.66 113.4H32v18h272.8c12.3 23.5 21.4 40.3 28.1 68.3-118 19.8-137.8 26.8-247.03 65.1C126.4 344.9 167 425 232.8 492.4l246.2-.3c-87.1-63.9-203.5-127.6-260.1-201.3 64.2-33.7 98.8-49.9 155.5-74.6-11.5-28.8-30.3-59.7-53.9-84.8H480v-18H251.2l-54.5-67.85-35.6 23.16z" />
    </Svg>
  );
});

function ImHomeIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <Path d="M16 9.226l-8-6.21-8 6.21v-2.532l8-6.21 8 6.21zM14 9v6h-4v-4h-4v4h-4v-6l6-4.5z" />
    </Svg>
  );
}

const FaUserLargeIcon = React.memo(function FaUserLargeIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
      <Path d="M256 288A144 144 0 1 0 256 0a144 144 0 1 0 0 288zm-94.7 32C72.2 320 0 392.2 0 481.3c0 17 13.8 30.7 30.7 30.7l450.6 0c17 0 30.7-13.8 30.7-30.7C512 392.2 439.8 320 350.7 320l-189.4 0z" />
    </Svg>
  );
});

interface IconWrapperProps {
  name: TabName;
  isActive: boolean;
  isPressed: boolean;
  isDisabled: boolean;
  size?: number;
}

export function IconWrapper({
  name,
  isActive,
  isPressed,
  isDisabled,
  size = 22,
}: IconWrapperProps) {
  const { colors } = useNavigationContext();

  const pulse = useSharedValue(1);

  useEffect(() => {
    if (name === 'chat' && isActive) {
      pulse.value = withRepeat(
        withTiming(1.06, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
    } else {
      pulse.value = withTiming(1, { duration: 200 });
    }
    return () => {
      pulse.value = 1;
    };
  }, [isActive, name]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  let iconColor: string;
  if (isDisabled) {
    iconColor = colors.text.disabled;
  } else if (isActive) {
    iconColor = colors.brand.primary;
  } else if (isPressed) {
    iconColor = colors.text.primary;
  } else {
    iconColor = colors.text.secondary;
  }

  const renderIcon = () => {
    switch (name) {
      case 'home':
        return <ImHomeIcon size={size} color={iconColor} />;
      case 'chat':
        return <RiChatAiFillIcon size={size} color={iconColor} />;
      case 'journey':
        return <GiHorizonRoadIcon size={size} color={iconColor} />;
      case 'profile':
        return <FaUserLargeIcon size={size} color={iconColor} />;
      default:
        return <ImHomeIcon size={size} color={iconColor} />;
    }
  };

  const iconElement = renderIcon();

  if (name === 'chat') {
    return (
      <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={animatedStyle}>
          {iconElement}
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
      {iconElement}
    </View>
  );
}

export default IconWrapper;
