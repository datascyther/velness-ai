import { createStateMachine, type StateDefinition } from './index';

export type ProgressState = 'not_started' | 'started' | 'in_progress' | 'completed';

export const PROGRESS_STATES: readonly ProgressState[] = [
  'not_started', 'started', 'in_progress', 'completed',
] as const;

export const PROGRESS_STATE_DEFINITIONS: readonly StateDefinition<ProgressState>[] = [
  {
    state: 'not_started',
    label: 'Not Started',
    description: 'No activity has been recorded',
    entryCondition: 'Entity is created or reset',
    exitCondition: 'First activity is recorded',
  },
  {
    state: 'started',
    label: 'Started',
    description: 'First activity has been recorded',
    entryCondition: 'User performs the first action',
    exitCondition: 'Further activity continues',
  },
  {
    state: 'in_progress',
    label: 'In Progress',
    description: 'Ongoing activity with partial completion',
    entryCondition: 'Multiple activities recorded but not all finished',
    exitCondition: 'All required activities are completed',
  },
  {
    state: 'completed',
    label: 'Completed',
    description: 'All required activities are finished',
    entryCondition: 'Completion criteria met (100%)',
    exitCondition: 'None (terminal unless reset)',
  },
];

export const progressStateMachine = createStateMachine(
  PROGRESS_STATES,
  'not_started' as ProgressState,
  PROGRESS_STATE_DEFINITIONS,
  [
    { from: 'not_started', to: 'started', label: 'start', description: 'First activity recorded' },
    { from: 'started', to: 'in_progress', label: 'continue', description: 'Subsequent activity recorded' },
    { from: 'started', to: 'completed', label: 'complete', description: 'Single-action activity completed' },
    { from: 'in_progress', to: 'completed', label: 'complete', description: 'All required activities completed' },
  ],
);
