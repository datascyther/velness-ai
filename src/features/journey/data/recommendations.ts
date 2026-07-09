import { EXERCISE_TYPE, CATEGORY_ID } from '../constants';
import type { Recommendation } from '../models/Recommendation';

export const DEFAULT_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-morning-breathing',
    exerciseId: 'box-breathing-l1-ex1',
    title: '5-Minute Breathing Space',
    description: 'Start your day with calm and clarity.',
    categoryId: CATEGORY_ID.BREATHING,
    exerciseType: EXERCISE_TYPE.BREATHING,
    durationMinutes: 5,
    reason: 'A quick way to center yourself in the morning',
  },
  {
    id: 'rec-gratitude-journal',
    exerciseId: 'gratitude-practice-l1-ex1',
    title: 'Gratitude Journal',
    description: 'Write down three things you are grateful for.',
    categoryId: CATEGORY_ID.CBT,
    exerciseType: EXERCISE_TYPE.JOURNALING,
    durationMinutes: 5,
    reason: 'Boosts positive emotions and well-being',
  },
  {
    id: 'rec-body-scan',
    exerciseId: 'better-sleep-l1-ex1',
    title: 'Body Scan Relaxation',
    description: 'Full body relaxation to release tension.',
    categoryId: CATEGORY_ID.MEDITATION,
    exerciseType: EXERCISE_TYPE.MEDITATION,
    durationMinutes: 15,
    reason: 'Helps release physical stress and improve sleep',
  },
  {
    id: 'rec-mindful-awareness',
    exerciseId: 'mindfulness-basics-l1-ex1',
    title: 'Mindful Awareness',
    description: 'Present moment awareness practice.',
    categoryId: CATEGORY_ID.MEDITATION,
    exerciseType: EXERCISE_TYPE.MEDITATION,
    durationMinutes: 15,
    reason: 'Builds focus and reduces anxiety',
  },
];
