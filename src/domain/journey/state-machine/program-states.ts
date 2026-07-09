import { createStateMachine, type StateDefinition } from './index';

export type ProgramState = 'locked' | 'available' | 'active' | 'completed' | 'archived';

export const PROGRAM_STATES: readonly ProgramState[] = [
  'locked', 'available', 'active', 'completed', 'archived',
] as const;

export const PROGRAM_STATE_DEFINITIONS: readonly StateDefinition<ProgramState>[] = [
  {
    state: 'locked',
    label: 'Locked',
    description: 'Program is not yet available to the user',
    entryCondition: 'Program is created or prerequisites are not met',
    exitCondition: 'All prerequisites are fulfilled',
  },
  {
    state: 'available',
    label: 'Available',
    description: 'Program is ready to be started',
    entryCondition: 'Prerequisites are met and program is unlocked',
    exitCondition: 'User begins the program or archives it',
  },
  {
    state: 'active',
    label: 'Active',
    description: 'User is currently working through the program',
    entryCondition: 'User starts the program',
    exitCondition: 'All lessons are completed or program is archived',
  },
  {
    state: 'completed',
    label: 'Completed',
    description: 'All lessons and exercises in the program are finished',
    entryCondition: 'All required lessons are marked completed',
    exitCondition: 'Program is archived',
  },
  {
    state: 'archived',
    label: 'Archived',
    description: 'Program is no longer active and has been archived',
    entryCondition: 'Program is archived from any active state',
    exitCondition: 'Program is restored (not yet supported)',
  },
];

export const programStateMachine = createStateMachine(
  PROGRAM_STATES,
  'locked' as ProgramState,
  PROGRAM_STATE_DEFINITIONS,
  [
    { from: 'locked', to: 'available', label: 'unlock', description: 'Prerequisites fulfilled, program becomes available' },
    { from: 'available', to: 'active', label: 'start', description: 'User begins the program' },
    { from: 'available', to: 'archived', label: 'archive', description: 'Program archived without starting' },
    { from: 'active', to: 'completed', label: 'complete', description: 'All lessons completed' },
    { from: 'active', to: 'archived', label: 'archive', description: 'Active program archived' },
    { from: 'completed', to: 'archived', label: 'archive', description: 'Completed program archived' },
  ],
);
