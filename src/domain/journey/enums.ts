// ── Difficulty ──
export const DIFFICULTY = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;
export type Difficulty = (typeof DIFFICULTY)[keyof typeof DIFFICULTY];

// ── Category ──
export const CATEGORY_ID = {
  CBT: 'cbt',
  BREATHING: 'breathing',
  MEDITATION: 'meditation',
  WELLNESS: 'wellness',
} as const;
export type CategoryId = (typeof CATEGORY_ID)[keyof typeof CATEGORY_ID];

// ── Journey ──
export const JOURNEY_STATUS = {
  NOT_STARTED: 'not_started',
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const;
export type JourneyStatus = (typeof JOURNEY_STATUS)[keyof typeof JOURNEY_STATUS];

// ── Program States (Sprint 1.2) ──
export const PROGRAM_STATE = {
  LOCKED: 'locked',
  AVAILABLE: 'available',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;
export type ProgramState = (typeof PROGRAM_STATE)[keyof typeof PROGRAM_STATE];

// ── Lesson States (Sprint 1.2) ──
export const LESSON_STATE = {
  LOCKED: 'locked',
  AVAILABLE: 'available',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
} as const;
export type LessonState = (typeof LESSON_STATE)[keyof typeof LESSON_STATE];

// ── Exercise States (Sprint 1.2) ──
export const EXERCISE_STATE = {
  LOCKED: 'locked',
  READY: 'ready',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
  FAILED: 'failed',
} as const;
export type ExerciseState = (typeof EXERCISE_STATE)[keyof typeof EXERCISE_STATE];

// ── Session States (Sprint 1.2) ──
export const SESSION_STATE = {
  CREATED: 'created',
  RUNNING: 'running',
  PAUSED: 'paused',
  FINISHED: 'finished',
  CANCELLED: 'cancelled',
} as const;
export type SessionState = (typeof SESSION_STATE)[keyof typeof SESSION_STATE];

// ── Progress States (Sprint 1.2) ──
export const PROGRESS_STATE = {
  NOT_STARTED: 'not_started',
  STARTED: 'started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;
export type ProgressState = (typeof PROGRESS_STATE)[keyof typeof PROGRESS_STATE];

// ── Recommendation States (Sprint 1.2) ──
export const RECOMMENDATION_STATE = {
  NONE: 'none',
  SUGGESTED: 'suggested',
  ACTIVE: 'active',
  DISMISSED: 'dismissed',
} as const;
export type RecommendationState = (typeof RECOMMENDATION_STATE)[keyof typeof RECOMMENDATION_STATE];

// ── Completion Status ──
export const COMPLETION_STATUS = {
  LOCKED: 'locked',
  AVAILABLE: 'available',
  COMPLETED: 'completed',
} as const;
export type CompletionStatus = (typeof COMPLETION_STATUS)[keyof typeof COMPLETION_STATUS];

// ── Exercise Types (Sprint 1.4) ──
export const EXERCISE_TYPE = {
  BREATHING: 'breathing',
  MEDITATION: 'meditation',
  CBT: 'cbt',
  JOURNAL: 'journal',
  GROUNDING: 'grounding',
  REFLECTION: 'reflection',
  QUIZ: 'quiz',
  CHECKLIST: 'checklist',
  AUDIO: 'audio',
  VIDEO: 'video',
} as const;
export type ExerciseType = (typeof EXERCISE_TYPE)[keyof typeof EXERCISE_TYPE];
