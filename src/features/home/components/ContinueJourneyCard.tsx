import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ProgressBar } from '@/shared/components/ProgressBar';

interface ContinueJourneyCardProps {
  title: string;
  currentStep: number;
  totalSteps: number;
  percent: number;
  onContinue: () => void;
  disabled?: boolean;
}

export const ContinueJourneyCard = React.memo(({
  title,
  currentStep,
  totalSteps,
  percent,
  onContinue,
  disabled = false,
}: ContinueJourneyCardProps) => {
  return (
    <Animated.View
      entering={FadeInDown.delay(100).duration(600).springify()}
    >
      <Pressable
        onPress={onContinue}
        disabled={disabled}
        style={styles.card}
        accessibilityRole="button"
        accessibilityLabel={`${title}, Lesson ${currentStep} of ${totalSteps}, ${percent} percent complete`}
      >
        <View style={styles.topRow}>
          <View style={styles.thumbnail}>
            <Text style={styles.thumbnailText}>🧠</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.lesson}>
              Lesson {currentStep} of {totalSteps}
            </Text>
          </View>
          <View style={styles.chevron}>
            <Text style={styles.chevronText}>›</Text>
          </View>
        </View>

        <View style={styles.progressRow}>
          <ProgressBar percent={percent} height={6} style={styles.progress} />
          <Text style={styles.percentText}>{percent}% Complete</Text>
        </View>

        <View style={styles.button}>
          <Text style={styles.buttonText}>Continue</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(149, 0, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  thumbnailText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  lesson: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  chevron: {
    marginLeft: 8,
  },
  chevronText: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.3)',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  progress: {
    flex: 1,
    marginRight: 12,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6C4CF1',
  },
  button: {
    backgroundColor: '#6C4CF1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ContinueJourneyCard;
