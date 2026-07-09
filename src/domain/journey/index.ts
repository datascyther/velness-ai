// Enums
export {
  DIFFICULTY,
  CATEGORY_ID,
  JOURNEY_STATUS,
  PROGRAM_STATE,
  LESSON_STATE,
  EXERCISE_STATE,
  SESSION_STATE,
  PROGRESS_STATE,
  RECOMMENDATION_STATE,
  COMPLETION_STATUS,
  EXERCISE_TYPE,
} from './enums';
export type {
  Difficulty,
  CategoryId,
  JourneyStatus,
  ProgramState,
  LessonState,
  ExerciseState,
  SessionState,
  ProgressState,
  RecommendationState,
  CompletionStatus,
  ExerciseType,
} from './enums';

// Entities
export type { Journey } from './entities/Journey';
export type { Program } from './entities/Program';
export type { Lesson } from './entities/Lesson';
export type { Exercise } from './entities/Exercise';
export type { Session } from './entities/Session';
export type {
  ResumeTarget,
  ExerciseProgress,
  ProgramProgress,
  JourneyProgress,
} from './entities/Progress';
export type { Recommendation } from './entities/Recommendation';
export type { Completion, CompletionEntityType } from './entities/Completion';
export type { Achievement } from './entities/Achievement';

// Types
export type {
  ExerciseContent,
  BreathingContent,
  MeditationContent,
  CBTContent,
  JournalContent,
  GroundingContent,
  ReflectionContent,
  QuizContent,
  ChecklistContent,
  AudioContent,
  VideoContent,
} from './types/ExerciseContent';

// State Machines
export { createStateMachine } from './state-machine';
export type { Transition, StateDefinition, StateMachine } from './state-machine';
export { programStateMachine } from './state-machine/program-states';
export type { ProgramState as SMProgramState } from './state-machine/program-states';
export { lessonStateMachine } from './state-machine/lesson-states';
export type { LessonState as SMLessonState } from './state-machine/lesson-states';
export { exerciseStateMachine } from './state-machine/exercise-states';
export type { ExerciseState as SMExerciseState } from './state-machine/exercise-states';
export { sessionStateMachine } from './state-machine/session-states';
export type { SessionState as SMSessionState } from './state-machine/session-states';
export { progressStateMachine } from './state-machine/progress-states';
export type { ProgressState as SMProgressState } from './state-machine/progress-states';
export { recommendationStateMachine } from './state-machine/recommendation-states';
export type { RecommendationState as SMRecommendationState } from './state-machine/recommendation-states';
