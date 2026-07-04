import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Sparkles, MessageSquare } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/core/theme';

interface PersonalReflectionCardProps {
  prompt: string;
  context: string;
  onReflect?: () => void;
}

export const PersonalReflectionCard = React.memo(({
  prompt,
  context,
  onReflect,
}: PersonalReflectionCardProps) => {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  const accentColor = '#8B5CF6';

  return (
    <Animated.View
      entering={FadeInDown.delay(360).duration(500).springify()}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? 'rgba(139,92,246,0.05)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(139,92,246,0.2)' : '#E5E7EB',
            borderLeftColor: accentColor,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: isDark ? 'rgba(139,92,246,0.15)' : `${accentColor}10` },
            ]}
          >
            <Sparkles size={14} color={accentColor} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.headerLabel, { color: accentColor }]}>
              Personal reflection
            </Text>
            <Text style={[styles.headerContext, { color: colors.text.secondary }]} numberOfLines={1}>
              {context}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={[styles.prompt, { color: colors.text.primary }]}>
          "{prompt}"
        </Text>

        {onReflect && (
          <Pressable
            onPress={onReflect}
            style={[
              styles.reflectButton,
              {
                backgroundColor: isDark ? 'rgba(139,92,246,0.12)' : `${accentColor}10`,
                borderColor: isDark ? 'rgba(139,92,246,0.2)' : `${accentColor}20`,
              },
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Write a reflection"
          >
            <MessageSquare size={14} color={accentColor} />
            <Text style={[styles.reflectText, { color: accentColor }]}>
              Write a reflection
            </Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
});

PersonalReflectionCard.displayName = 'PersonalReflectionCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  headerContext: {
    fontSize: 11,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(139,92,246,0.1)',
    marginVertical: spacing.md,
  },
  prompt: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 23,
    fontStyle: 'italic',
    letterSpacing: 0.1,
    marginBottom: spacing.lg,
  },
  reflectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: 6,
  },
  reflectText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default PersonalReflectionCard;
