import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, Platform, ActionSheetIOS } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/core/theme/tokens';
import * as Haptics from 'expo-haptics';

export interface Action {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  destructive?: boolean;
}

interface MessageActionSheetProps {
  visible: boolean;
  onClose: () => void;
  actions: Action[];
}

export function MessageActionSheet({ visible, onClose, actions }: MessageActionSheetProps) {
  const { colors } = useTheme();
  const actionsRef = useRef(actions);
  const onCloseRef = useRef(onClose);
  actionsRef.current = actions;
  onCloseRef.current = onClose;

  useEffect(() => {
    if (Platform.OS !== 'ios' || !visible) return;

    const currentActions = actionsRef.current;
    const currentOnClose = onCloseRef.current;

    const options = [...currentActions.map(a => a.label), 'Cancel'];
    const cancelButtonIndex = options.length - 1;
    const destructiveButtonIndex = currentActions.findIndex(a => a.destructive);

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex: destructiveButtonIndex >= 0 ? destructiveButtonIndex : undefined,
      },
      (buttonIndex) => {
        if (buttonIndex === cancelButtonIndex) {
          currentOnClose();
          return;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        currentActions[buttonIndex].onPress();
        currentOnClose();
      }
    );
  }, [visible]);

  if (Platform.OS === 'ios') return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.surface.primary }]}
          onPress={() => {}}
        >
          {actions.map((action, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.actionRow,
                pressed && { backgroundColor: colors.surface.secondary },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                action.onPress();
                onClose();
              }}
              accessibilityRole="menuitem"
            >
              {action.icon && <View style={styles.iconContainer}>{action.icon}</View>}
              <Text
                style={[
                  styles.actionLabel,
                  { color: action.destructive ? colors.danger : colors.text.primary },
                ]}
              >
                {action.label}
              </Text>
            </Pressable>
          ))}
          <View style={[styles.separator, { backgroundColor: colors.border.default }]} />
          <Pressable
            style={({ pressed }) => [
              styles.cancelRow,
              pressed && { backgroundColor: colors.surface.secondary },
            ]}
            onPress={onClose}
            accessibilityRole="menuitem"
            accessibilityLabel="Cancel"
          >
            <Text style={[styles.cancelLabel, { color: colors.text.primary }]}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: borderRadius.glass,
    borderTopRightRadius: borderRadius.glass,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '400',
  },
  separator: {
    height: 1,
    marginVertical: spacing.sm,
  },
  cancelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: borderRadius.sm,
  },
  cancelLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MessageActionSheet;
