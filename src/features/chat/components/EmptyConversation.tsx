import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Sparkles, Heart, HelpCircle, Flame } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

const { width } = Dimensions.get('window');

interface QuickStarter {
  icon: React.ComponentType<{ size: number; color: string }>;
  text: string;
  color: string;
}

const QUICK_STARTERS: QuickStarter[] = [
  { icon: Heart, text: "I'm feeling a bit overwhelmed today...", color: '#EF4444' },
  { icon: Sparkles, text: "Can we do a quick mindful check-in?", color: '#A78BFA' },
  { icon: Flame, text: "I want to share a small win!", color: '#F59E0B' },
  { icon: HelpCircle, text: "Help me process some thoughts", color: '#06B6D4' },
];

interface EmptyConversationProps {
  onQuickStarterPress?: (text: string) => void;
}

export function EmptyConversation({ onQuickStarterPress }: EmptyConversationProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.avatarCircle, { backgroundColor: `${colors.brand.primary}1A`, borderColor: colors.border.default }]}>
        <Text style={styles.emojiLogo}>🧠</Text>
      </View>

      <Text style={[styles.title, { color: colors.text.primary }]}>
        Neeva's Conversation Space
      </Text>
      
      <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
        Your safe space for emotional support and reflection. Share whatever is on your mind, without judgement.
      </Text>

      {/* Quick Starters Grid */}
      <View style={styles.startersGrid}>
        {QUICK_STARTERS.map((starter, index) => {
          const IconComponent = starter.icon;
          return (
            <Pressable
              key={index}
              onPress={() => onQuickStarterPress?.(starter.text)}
              style={({ pressed }) => [
                styles.starterCard,
                {
                  backgroundColor: pressed ? colors.background.secondary : colors.surface.secondary,
                  borderColor: colors.border.default,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={starter.text}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: `${starter.color}15` },
                ]}
              >
                <IconComponent size={16} color={starter.color} />
              </View>
              <Text style={[styles.starterText, { color: colors.text.primary }]}>
                {starter.text}
              </Text>
            </Pressable>
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
    paddingVertical: 40,
    width: '100%',
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emojiLogo: {
    fontSize: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 36,
    maxWidth: width * 0.85,
  },
  startersGrid: {
    width: '100%',
    gap: 12,
  },
  starterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  starterText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
});

export default EmptyConversation;
