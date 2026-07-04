import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Heart, Shield, Lightbulb, ThumbsUp } from 'lucide-react-native';

const REACTION_CONFIG: Record<string, { icon: React.ElementType; label: string }> = {
  like: { icon: ThumbsUp, label: 'Like' },
  love: { icon: Heart, label: 'Love' },
  support: { icon: Shield, label: 'Support' },
  insightful: { icon: Lightbulb, label: 'Insightful' },
};

interface ReactionBarProps {
  reactionCounts: Record<string, number>;
  userReaction: string | null;
  onToggle: (type: string) => void;
  disabled?: boolean;
}

export function ReactionBar({
  reactionCounts,
  userReaction,
  onToggle,
  disabled,
}: ReactionBarProps) {
  return (
    <View className="flex-row items-center gap-3 mt-2">
      {Object.entries(REACTION_CONFIG).map(([type, config]) => {
        const Icon = config.icon;
        const count = reactionCounts[type] ?? 0;
        const isActive = userReaction === type;

        return (
          <Pressable
            key={type}
            onPress={() => onToggle(type)}
            disabled={disabled}
            className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full active:opacity-70 ${
              isActive
                ? 'bg-neeva-purple-600/30 border border-neeva-purple-500/50'
                : 'bg-neeva-glass-dark/20 border border-neeva-glass-border'
            }`}
          >
            <Icon
              size={16}
              color={isActive ? '#A78BFA' : 'rgba(255,255,255,0.5)'}
              fill={isActive ? '#A78BFA' : 'transparent'}
            />
            {count > 0 && (
              <Text
                className={`text-label font-medium ${
                  isActive ? 'text-neeva-purple-300' : 'text-white/50'
                }`}
              >
                {count}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
