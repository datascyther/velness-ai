import { CATEGORY_ID } from '../constants';
import type { Category } from '../models/Category';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: CATEGORY_ID.CBT,
    title: 'CBT Exercises',
    description: 'Reframe thoughts and build skills',
    iconType: 'brain',
    accentColor: '#6C4CF1',
    exerciseCount: 8,
    sortOrder: 0,
  },
  {
    id: CATEGORY_ID.BREATHING,
    title: 'Breathing',
    description: 'Reduce stress and relax',
    iconType: 'wind',
    accentColor: '#06B6D4',
    exerciseCount: 6,
    sortOrder: 1,
  },
  {
    id: CATEGORY_ID.MEDITATION,
    title: 'Meditation',
    description: 'Mindfulness made simple',
    iconType: 'sparkles',
    accentColor: '#8B5CF6',
    exerciseCount: 12,
    sortOrder: 2,
  },
  {
    id: CATEGORY_ID.WELLNESS,
    title: 'Wellness Studio',
    description: 'Tools for everyday well-being',
    iconType: 'leaf',
    accentColor: '#10B981',
    exerciseCount: 9,
    sortOrder: 3,
  },
];
