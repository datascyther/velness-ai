import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MOOD_MAP, getMoodEmotion } from '@/shared/types';
import type { MoodRating } from '@/shared/types';
import { MoodOption } from './MoodOption';

export interface MoodSelectorProps {
  selectedMood: MoodRating | null;
  onSelectMood: (value: MoodRating) => void;
}

const VALUES: MoodRating[] = [5, 4, 3, 2, 1];

export const MoodSelector = React.memo(({ selectedMood, onSelectMood }: MoodSelectorProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {VALUES.map((value) => (
          <MoodOption
            key={value}
            emotion={getMoodEmotion(value)}
            label={MOOD_MAP[value].label}
            isSelected={selectedMood === value}
            onPress={() => onSelectMood(value)}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
});

export default MoodSelector;
