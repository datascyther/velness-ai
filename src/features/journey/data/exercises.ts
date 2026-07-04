import { EXERCISE_TYPE } from '../constants';
import type { Exercise } from '../models/Exercise';

export const DEFAULT_EXERCISES: Exercise[] = [
  { id: '1', lessonId: 'lesson-1', type: EXERCISE_TYPE.MEDITATION, title: 'Mindful Breathing', description: 'A guided meditation', estimatedTime: 10, content: {}, sortOrder: 0 },
  { id: '2', lessonId: 'lesson-1', type: EXERCISE_TYPE.JOURNALING, title: 'Gratitude Journal', description: 'Write what you\'re grateful for', estimatedTime: 5, content: {}, sortOrder: 1 },
  { id: '3', lessonId: 'lesson-2', type: EXERCISE_TYPE.BREATHING, title: '4-7-8 Breathing', description: 'A calming breathing exercise', estimatedTime: 5, content: {}, sortOrder: 0 },
  { id: '4', lessonId: 'lesson-2', type: EXERCISE_TYPE.MEDITATION, title: 'Body Scan', description: 'Full body relaxation', estimatedTime: 15, content: {}, sortOrder: 1 },
  { id: 'breathing-basic', lessonId: 'lesson-3', type: EXERCISE_TYPE.BREATHING, title: 'Basic Breathing Meditation', description: 'Foundation breathing', estimatedTime: 8, content: {}, sortOrder: 0 },
  { id: 'body-scan', lessonId: 'lesson-3', type: EXERCISE_TYPE.MEDITATION, title: 'Body Scan Relaxation', description: 'Deep relaxation', estimatedTime: 20, content: {}, sortOrder: 1 },
  { id: 'mindfulness', lessonId: 'lesson-4', type: EXERCISE_TYPE.MEDITATION, title: 'Mindful Awareness', description: 'Present moment awareness', estimatedTime: 12, content: {}, sortOrder: 0 },
  { id: 'loving-kindness', lessonId: 'lesson-4', type: EXERCISE_TYPE.MEDITATION, title: 'Loving Kindness', description: 'Compassion meditation', estimatedTime: 15, content: {}, sortOrder: 1 },
];
