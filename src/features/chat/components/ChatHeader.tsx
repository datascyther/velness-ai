import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { ArrowLeft, Bell } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Avatar } from '@/shared/components/Avatar';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/core/theme/tokens';
import { LAYOUT } from '@/shared/constants';

function formatSessionTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    const hours = date.getHours();
    const mins = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return `${h}:${mins.toString().padStart(2, '0')} ${ampm}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Yesterday';
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

interface ChatHeaderProps {
  showBackButton?: boolean;
  title: string;
  status?: string;
  avatarUrl?: string | null;
  userName?: string | null;
  onBackPress?: () => void;
  onNotificationPress?: () => void;
  inConversation?: boolean;
  sessionStartedAt?: Date;
}

const BACK_BUTTON_SIZE = 40;
const BELL_ICON_SIZE = 20;
const STATUS_DOT_SIZE = 8;
const NOTIFICATION_DOT_SIZE = 8;

export function ChatHeader({
  showBackButton = false,
  title,
  status = 'Listening',
  avatarUrl,
  userName,
  onBackPress,
  onNotificationPress,
  inConversation = false,
  sessionStartedAt,
}: ChatHeaderProps) {
  const { colors } = useTheme();

  // Pulse animation for the "Listening" status dot
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 1500 }),
        withTiming(1.0, { duration: 1500 })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 1500 }),
        withTiming(1.0, { duration: 1500 })
      ),
      -1,
      true
    );
  }, [scale, opacity]);

  const pulsatingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Resolve content based on conversation state
  const resolvedTitle = inConversation ? "Today's Companion" : "Velness";
  const resolvedSubtitle = inConversation && sessionStartedAt
    ? `Session started ${formatSessionTime(sessionStartedAt)}`
    : "Always here when you need it";

  return (
    <View style={[styles.container, { backgroundColor: colors.surface.primary, borderBottomWidth: 1, borderBottomColor: colors.border.default }]}>
      <View style={styles.backSection}>
        {showBackButton && inConversation ? (
          <Pressable
            onPress={onBackPress}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: pressed ? colors.background.secondary : 'transparent' }
            ]}
            hitSlop={spacing.sm}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ArrowLeft size={22} color={colors.text.primary} />
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
      </View>

      <View style={styles.leftSection}>
        {!inConversation && (
          <Image
            source={require('@/shared/assets/velness-logo.jpg')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        )}
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.titleText,
              { color: colors.text.primary },
              !inConversation && styles.brandingTitle
            ]}
            numberOfLines={1}
          >
            {resolvedTitle}
          </Text>
          
          <View style={styles.metaRow}>
            <View style={styles.statusRow}>
              <Animated.View style={[styles.statusDot, pulsatingStyle, { backgroundColor: colors.success }]} />
              <Text style={[styles.statusText, { color: colors.text.secondary }]}>
                {status}
              </Text>
            </View>
            <Text style={[styles.dotDivider, { color: colors.text.secondary }]}>•</Text>
            <Text style={[styles.subtitleText, { color: colors.text.secondary }]} numberOfLines={1}>
              {resolvedSubtitle}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Pressable
          onPress={onNotificationPress}
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: pressed ? colors.background.secondary : 'transparent' }
          ]}
          hitSlop={spacing.sm}
          accessibilityLabel="Notifications"
          accessibilityRole="button"
        >
          <Bell size={BELL_ICON_SIZE} color={colors.text.secondary} />
          <View
            style={[styles.notificationDot, { backgroundColor: colors.brand.primary }]}
          />
        </Pressable>

        <Avatar
          photoURL={avatarUrl ?? null}
          name={userName ?? null}
          size="sm"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: LAYOUT.HEADER_HEIGHT,
    paddingHorizontal: spacing.lg,
  },
  backSection: {
    marginRight: spacing.xs,
  },
  backButton: {
    width: BACK_BUTTON_SIZE,
    height: BACK_BUTTON_SIZE,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  brandingTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: STATUS_DOT_SIZE,
    height: STATUS_DOT_SIZE,
    borderRadius: STATUS_DOT_SIZE / 2,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  dotDivider: {
    marginHorizontal: 6,
    fontSize: 10,
  },
  subtitleText: {
    fontSize: 12,
    fontWeight: '400',
    flexShrink: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  iconButton: {
    width: BACK_BUTTON_SIZE,
    height: BACK_BUTTON_SIZE,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  notificationDot: {
    position: 'absolute',
    top: spacing.sm - 2,
    right: spacing.sm - 2,
    width: NOTIFICATION_DOT_SIZE,
    height: NOTIFICATION_DOT_SIZE,
    borderRadius: NOTIFICATION_DOT_SIZE / 2,
  },
  logoImage: {
    width: 28,
    height: 28,
    marginRight: spacing.sm,
    borderRadius: 7,
  },
});

export default ChatHeader;
