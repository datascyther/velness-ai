// src/features/home/components/HomeHeader.tsx
//
// Top navigation bar: brand wordmark + notification + avatar.
// The greeting/headline has been moved into HeroCard.
// HomeHeader is now purely a top bar — no greeting copy here.

import React from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Avatar } from '@/shared/components/Avatar';
import { useUserDisplayName, useUser } from '@/shared/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

interface HomeHeaderProps {
  onNotificationPress?: () => void;
  /** Unread notifications count — controls the badge dot. */
  unreadCount?: number;
}

export function HomeHeader({ onNotificationPress, unreadCount = 0 }: HomeHeaderProps) {
  const displayName = useUserDisplayName();
  const user = useUser();
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={styles.container}
    >
      <View style={styles.brandLeft}>
        <Image
          source={require('@/shared/assets/velness-logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.wordmark, { color: colors.text.primary }]}>Velness</Text>
      </View>

      <View style={styles.brandRight}>
        <Pressable
          onPress={onNotificationPress}
          hitSlop={12}
          style={styles.iconButton}
          accessibilityLabel="View notifications"
          accessibilityRole="button"
        >
          <Bell size={20} color={colors.text.secondary} />
          {unreadCount > 0 && (
            <View style={[styles.notificationDot, { backgroundColor: colors.danger }]} />
          )}
        </Pressable>

        <Avatar
          photoURL={user?.photoURL ?? null}
          name={displayName}
          size="sm"
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 8,
  },
  wordmark: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  brandRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});

export default HomeHeader;
