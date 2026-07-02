import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { Avatar } from '@/shared/components/Avatar';
import { useTheme } from '@/hooks/useTheme';
import { typography, spacing, borderRadius } from '@/core/theme/tokens';
import { LAYOUT } from '@/shared/constants';

interface ChatHeaderProps {
  showBackButton?: boolean;
  title: string;
  status?: string;
  avatarUrl?: string | null;
  userName?: string | null;
  onBackPress?: () => void;
  onNotificationPress?: () => void;
}

const BACK_BUTTON_SIZE = 40;
const BELL_ICON_SIZE = 20;
const LOGO_SIZE = 32;
const STATUS_DOT_SIZE = 6;
const NOTIFICATION_DOT_SIZE = 8;

export function ChatHeader({
  showBackButton = false,
  title,
  status = 'Online',
  avatarUrl,
  userName,
  onBackPress,
  onNotificationPress,
}: ChatHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface.primary }]}>
      <View style={styles.backSection}>
        {showBackButton ? (
          <Pressable
            onPress={onBackPress}
            style={styles.backButton}
            hitSlop={spacing.sm}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ArrowLeft size={BELL_ICON_SIZE} color={colors.text.primary} />
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
      </View>

      <View style={styles.leftSection}>
        <Image
          source={require('@/shared/assets/neeva-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.titleText,
              { color: colors.text.primary },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.statusText, { color: colors.text.secondary }]}>
              {status}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Pressable
          onPress={onNotificationPress}
          style={styles.iconButton}
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
    marginRight: spacing.sm,
  },
  backButton: {
    width: BACK_BUTTON_SIZE,
    height: BACK_BUTTON_SIZE,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: BACK_BUTTON_SIZE,
    height: BACK_BUTTON_SIZE,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    marginRight: spacing.md,
  },
  titleContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: typography.fontSize['body-lg'],
    fontWeight: '700',
    letterSpacing: typography.letterSpacing['section-title'],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  statusDot: {
    width: STATUS_DOT_SIZE,
    height: STATUS_DOT_SIZE,
    borderRadius: STATUS_DOT_SIZE / 2,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.label,
    fontWeight: typography.fontWeight.label,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.lg,
  },
  iconButton: {
    width: BACK_BUTTON_SIZE,
    height: BACK_BUTTON_SIZE,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  notificationDot: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: NOTIFICATION_DOT_SIZE,
    height: NOTIFICATION_DOT_SIZE,
    borderRadius: NOTIFICATION_DOT_SIZE / 2,
  },
});

export default ChatHeader;
