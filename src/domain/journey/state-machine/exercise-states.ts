import { createStateMachine, type StateDefinition } from './index';

export type ExerciseState = 'locked' | 'ready' | 'running' | 'paused' | 'completed' | 'skipped' | 'failed';

export const EXERCISE_STATES: readonly ExerciseState[] = [
  'locked', 'ready', 'running', 'paused', 'completed', 'skipped', 'failed',
] as const;

export const EXERCISE_STATE_DEFINITIONS: readonly StateDefinition<ExerciseState>[] = [
  {
    state: 'locked',
    label: 'Locked',
    description: 'Exercise is not yet available',
    entryCondition: 'Lesson is locked or previous exercise not completed',
    exitCondition: 'Lesson becomes active and exercise is next in sequence',
  },
  {
    state: 'ready',
    label: 'Ready',
    description: 'Exercise is prepared and waiting for user action',
    entryCondition: 'Lesson is active and exercise is next in sequence',
    exitCondition: 'User begins the exercise',
  },
  {
    state: 'running',
    label: 'Running',
    description: 'Exercise is currently in progress',
    entryCondition: 'User starts the exercise',
    exitCondition: 'User pauses, completes, skips, or exercise fails',
  },
  {
    state: 'paused',
    label: 'Paused',
    description: 'Exercise has been temporarily stopped',
    entryCondition: 'User pauses the exercise',
    exitCondition: 'User resumes or cancels the exercise',
  },
  {
    state: 'completed',
    label: 'Completed',
    description: 'Exercise finished successfully',
    entryCondition: 'User completes all required actions',
    exitCondition: 'None (terminal)',
  },
  {
    state: 'skipped',
    label: 'Skipped',
    description: 'Exercise was deliberately skipped',
    entryCondition: 'User chooses to skip',
    exitCondition: 'None (terminal)',
  },
  {
    state: 'failed',
    label: 'Failed',
    description: 'Exercise did not complete successfully',
    entryCondition: 'Error or timeout during exercise',
    exitCondition: 'None (terminal)',
  },
];

export const exerciseStateMachine = createStateMachine(
  EXERCISE_STATES,
  'locked' as ExerciseState,
  EXERCISE_STATE_DEFINITIONS,
  [
    { from: 'locked', to: 'ready', label: 'prepare', description: 'Previous exercise completed or lesson becomes active' },
    { from: 'ready', to: 'running', label: 'start', description: 'User begins the exercise' },
    { from: 'ready', to: 'skipped', label: 'skip', description: 'User skips without starting' },
    { from: 'running', to: 'paused', label: 'pause', description: 'User pauses the exercise' },
    { from: 'running', to: 'completed', label: 'complete', description: 'Exercise finished successfully' },
    { from: 'running', to: 'skipped', label: 'skip', description: 'User abandons mid-exercise' },
    { from: 'running', to: 'failed', label: 'fail', description: 'Exercise encounters an error or times out' },
    { from: 'running', to: 'ready', label: 'restart', description: 'User restarts the exercise mid-run' },
    { from: 'paused', to: 'running', label: 'resume', description: 'User resumes the exercise' },
    { from: 'paused', to: 'ready', label: 'restart', description: 'User restarts from paused' },
    { from: 'paused', to: 'skipped', label: 'skip', description: 'User cancels while paused' },
  ],
);
