import React, { useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

interface ChatHeaderProps {
  onMorePress?: () => void;
}

export function ChatHeader({ onMorePress }: ChatHeaderProps) {
  const { colors } = useTheme();
  
  // Pulse animation for the online indicator
  const pulseOpacity = useSharedValue(0.4);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.4, { duration: 1000 })
      ),
      -1,
      true
    );
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedOuterPulse = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={[styles.headerContainer, { backgroundColor: colors.surface.primary, borderBottomColor: colors.border.default }]}>
      <View style={styles.leftSection}>
        <Image
          source={require('@/shared/assets/neeva-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.titleContainer}>
          <Text style={[styles.titleText, { color: colors.text.primary }]}>Neeva</Text>
          <View style={styles.statusRow}>
            <View style={styles.indicatorContainer}>
              <Animated.View
                style={[
                  styles.outerPulse,
                  { backgroundColor: colors.success },
                  animatedOuterPulse,
                ]}
              />
              <View style={[styles.innerDot, { backgroundColor: colors.success }]} />
            </View>
            <Text style={[styles.statusText, { color: colors.text.secondary }]}>Online</Text>
          </View>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Pressable
          onPress={onMorePress}
          style={[styles.menuButton, { backgroundColor: colors.background.secondary }]}
          hitSlop={12}
          accessibilityLabel="More options"
          accessibilityRole="button"
        >
          <MoreVertical size={20} color={colors.text.secondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 36,
    height: 36,
    marginRight: 12,
  },
  titleContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  indicatorContainer: {
    width: 8,
    height: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  innerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
  },
  outerPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatHeader;
