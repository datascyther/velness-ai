import { createStateMachine, type StateDefinition } from './index';

export type SessionState = 'created' | 'running' | 'paused' | 'finished' | 'cancelled';

export const SESSION_STATES: readonly SessionState[] = [
  'created', 'running', 'paused', 'finished', 'cancelled',
] as const;

export const SESSION_STATE_DEFINITIONS: readonly StateDefinition<SessionState>[] = [
  {
    state: 'created',
    label: 'Created',
    description: 'Session record has been created but not yet started',
    entryCondition: 'User selects an exercise to begin',
    exitCondition: 'Exercise countdown or start action triggers',
  },
  {
    state: 'running',
    label: 'Running',
    description: 'Exercise is actively being performed',
    entryCondition: 'Session starts and timer begins',
    exitCondition: 'Exercise completes, user pauses, or cancels',
  },
  {
    state: 'paused',
    label: 'Paused',
    description: 'Session has been temporarily stopped',
    entryCondition: 'User pauses the session',
    exitCondition: 'User resumes or cancels',
  },
  {
    state: 'finished',
    label: 'Finished',
    description: 'Exercise completed successfully within the session',
    entryCondition: 'All exercise actions are completed',
    exitCondition: 'None (terminal)',
  },
  {
    state: 'cancelled',
    label: 'Cancelled',
    description: 'Session was terminated before completion',
    entryCondition: 'User cancels or abandons the session',
    exitCondition: 'None (terminal)',
  },
];

export const sessionStateMachine = createStateMachine(
  SESSION_STATES,
  'created' as SessionState,
  SESSION_STATE_DEFINITIONS,
  [
    { from: 'created', to: 'running', label: 'start', description: 'Session begins' },
    { from: 'created', to: 'cancelled', label: 'cancel', description: 'Session cancelled before starting' },
    { from: 'running', to: 'paused', label: 'pause', description: 'User pauses the session' },
    { from: 'running', to: 'finished', label: 'finish', description: 'Exercise completed' },
    { from: 'running', to: 'cancelled', label: 'cancel', description: 'User abandons session' },
    { from: 'paused', to: 'running', label: 'resume', description: 'User resumes the session' },
    { from: 'paused', to: 'cancelled', label: 'cancel', description: 'User cancels while paused' },
  ],
);
