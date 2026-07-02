import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/core/store/useAppStore';
import { spacing, typography, borderRadius } from '@/core/theme/tokens';
import { CHAT_STARTERS } from '@/features/chat/constants/chat-starters';

function getGreeting(name?: string): string {
  const hour = new Date().getHours();
  const prefix =
    hour >= 5 && hour < 12
      ? 'Good morning'
      : hour >= 12 && hour < 17
        ? 'Good afternoon'
        : 'Good evening';

  if (name) {
    return `${prefix}, ${name}.`;
  }

  return 'Hello.';
}

interface EmptyConversationProps {
  onQuickStarterSelect?: (text: string) => void;
}

export function EmptyConversation({ onQuickStarterSelect }: EmptyConversationProps) {
  const { colors } = useTheme();
  const user = useAppStore((state) => state.session.user);
  const firstName = user?.name?.split(' ')[0];

  return (
    <View style={styles.emptyContainer}>
      <Text style={[styles.greeting, { color: colors.text.primary }]}>
        {getGreeting(firstName)}
      </Text>

      <Text style={[styles.prompt, { color: colors.text.secondary }]}>
        How are you feeling today?
      </Text>

      <View style={styles.startersGrid}>
        {CHAT_STARTERS.map((starter, index) => {
          const IconComponent = starter.icon;
          return (
            <Animated.View
              key={index}
              entering={FadeIn.duration(300).delay(index * 100)}
              style={{ width: '100%' }}
            >
              <Pressable
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  onQuickStarterSelect?.(starter.text);
                }}
                style={({ pressed }) => [
                  styles.starterCard,
                  {
                    backgroundColor: pressed
                      ? colors.background.secondary
                      : colors.surface.secondary,
                    borderColor: colors.border.default,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={starter.text}
                accessibilityHint="Starts a conversation with this prompt"
              >
                <View
                  style={[styles.iconCircle, { backgroundColor: colors.surface.primary }]}
                >
                  <IconComponent size={16} color={colors.brand.primary} />
                </View>
                <Text style={[styles.starterText, { color: colors.text.primary }]}>
                  {starter.text}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing['8xl'],
    paddingBottom: spacing['3xl'],
    width: '100%',
  },
  greeting: {
    fontSize: typography.fontSize['section-title'],
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: typography.letterSpacing['section-title'],
    marginBottom: spacing['2xl'],
  },
  prompt: {
    fontSize: typography.fontSize.body,
    textAlign: 'center',
    lineHeight: typography.fontSize.body * typography.lineHeight.body,
    marginBottom: spacing['6xl'],
  },
  startersGrid: {
    width: '100%',
    gap: spacing.lg,
  },
  starterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  starterText: {
    fontSize: typography.fontSize['body-sm'],
    fontWeight: '600',
    flex: 1,
  },
});

export default EmptyConversation;
