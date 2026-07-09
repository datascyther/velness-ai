import { createStateMachine, type StateDefinition } from './index';

export type LessonState = 'locked' | 'available' | 'active' | 'completed' | 'skipped';

export const LESSON_STATES: readonly LessonState[] = [
  'locked', 'available', 'active', 'completed', 'skipped',
] as const;

export const LESSON_STATE_DEFINITIONS: readonly StateDefinition<LessonState>[] = [
  {
    state: 'locked',
    label: 'Locked',
    description: 'Lesson is not yet available',
    entryCondition: 'Previous lesson is not completed or program is locked',
    exitCondition: 'Previous lesson is completed and program is active',
  },
  {
    state: 'available',
    label: 'Available',
    description: 'Lesson is ready to be started',
    entryCondition: 'Prerequisites are met',
    exitCondition: 'User starts the lesson or skips it',
  },
  {
    state: 'active',
    label: 'Active',
    description: 'User is currently working through the lesson',
    entryCondition: 'User starts the lesson',
    exitCondition: 'All exercises are completed or lesson is skipped',
  },
  {
    state: 'completed',
    label: 'Completed',
    description: 'All exercises in the lesson are finished',
    entryCondition: 'All required exercises are completed',
    exitCondition: 'None (terminal unless reopened)',
  },
  {
    state: 'skipped',
    label: 'Skipped',
    description: 'Lesson was deliberately skipped by the user',
    entryCondition: 'User chooses to skip the lesson',
    exitCondition: 'None (terminal unless reopened)',
  },
];

export const lessonStateMachine = createStateMachine(
  LESSON_STATES,
  'locked' as LessonState,
  LESSON_STATE_DEFINITIONS,
  [
    { from: 'locked', to: 'available', label: 'unlock', description: 'Previous lesson completed, current lesson becomes available' },
    { from: 'available', to: 'active', label: 'start', description: 'User begins the lesson' },
    { from: 'available', to: 'skipped', label: 'skip', description: 'User skips the lesson' },
    { from: 'active', to: 'completed', label: 'complete', description: 'All exercises completed' },
    { from: 'active', to: 'skipped', label: 'skip', description: 'User skips mid-lesson' },
  ],
);
