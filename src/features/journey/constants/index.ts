export const DIFFICULTY = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;
export type Difficulty = (typeof DIFFICULTY)[keyof typeof DIFFICULTY];

export const CATEGORY_ID = {
  CBT: 'cbt',
  BREATHING: 'breathing',
  MEDITATION: 'meditation',
  WELLNESS: 'wellness',
} as const;
export type CategoryId = (typeof CATEGORY_ID)[keyof typeof CATEGORY_ID];

export const PROGRAM_STATUS = {
  NOT_STARTED: 'not_started',
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const;
export type ProgramStatus = (typeof PROGRAM_STATUS)[keyof typeof PROGRAM_STATUS];

export const EXERCISE_TYPE = {
  MEDITATION: 'meditation',
  JOURNALING: 'journaling',
  GRATITUDE: 'gratitude',
  BREATHING: 'breathing',
} as const;
export type ExerciseType = (typeof EXERCISE_TYPE)[keyof typeof EXERCISE_TYPE];

export const COMPLETION_STATUS = {
  LOCKED: 'locked',
  AVAILABLE: 'available',
  COMPLETED: 'completed',
} as const;
export type CompletionStatus = (typeof COMPLETION_STATUS)[keyof typeof COMPLETION_STATUS];
