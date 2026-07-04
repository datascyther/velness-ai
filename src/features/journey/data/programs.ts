import { DIFFICULTY, CATEGORY_ID, PROGRAM_STATUS } from '../constants';
import type { Program } from '../models/Program';
import type { Lesson } from '../models/Lesson';

export const DEFAULT_PROGRAMS: Program[] = [
  {
    id: 'wellness-basics',
    title: 'Wellness Basics',
    description: 'Build a strong foundation for mental well-being',
    difficulty: DIFFICULTY.BEGINNER,
    duration: 30,
    thumbnail: '',
    categoryId: CATEGORY_ID.CBT,
    lessonCount: 4,
    status: PROGRAM_STATUS.NOT_STARTED,
    sortOrder: 0,
  },
  {
    id: 'mindful-breathing',
    title: 'Mindful Breathing',
    description: 'Learn calming breathing techniques',
    difficulty: DIFFICULTY.BEGINNER,
    duration: 15,
    thumbnail: '',
    categoryId: CATEGORY_ID.BREATHING,
    lessonCount: 2,
    status: PROGRAM_STATUS.NOT_STARTED,
    sortOrder: 1,
  },
];

export const DEFAULT_LESSONS: Lesson[] = [
  {
    id: 'lesson-1',
    programId: 'wellness-basics',
    title: 'Introduction to Mindfulness',
    description: 'Start your wellness journey with basic mindfulness',
    order: 1,
    duration: 10,
    exerciseIds: ['1', '2'],
  },
  {
    id: 'lesson-2',
    programId: 'wellness-basics',
    title: 'Breathing Fundamentals',
    description: 'Learn essential breathing techniques',
    order: 2,
    duration: 15,
    exerciseIds: ['3', '4'],
  },
  {
    id: 'lesson-3',
    programId: 'wellness-basics',
    title: 'Body Awareness',
    description: 'Develop body-mind connection',
    order: 3,
    duration: 20,
    exerciseIds: ['breathing-basic', 'body-scan'],
  },
  {
    id: 'lesson-4',
    programId: 'wellness-basics',
    title: 'Compassion Practice',
    description: 'Cultivate kindness towards yourself and others',
    order: 4,
    duration: 15,
    exerciseIds: ['mindfulness', 'loving-kindness'],
  },
  {
    id: 'lesson-5',
    programId: 'mindful-breathing',
    title: 'Basic Breathing',
    description: 'Master the foundation of breath work',
    order: 1,
    duration: 8,
    exerciseIds: ['3'],
  },
  {
    id: 'lesson-6',
    programId: 'mindful-breathing',
    title: 'Advanced Breathing',
    description: 'Deepen your breathing practice',
    order: 2,
    duration: 10,
    exerciseIds: ['breathing-basic'],
  },
];
