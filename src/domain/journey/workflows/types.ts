export type WorkflowResult<T> =
  | { success: true; data: T }
  | { success: false; error: WorkflowError };

export interface WorkflowError {
  code: string;
  message: string;
  entity?: string;
  entityId?: string;
}

export interface CompletionSummary {
  exerciseId: string;
  sessionId: string;
  lessonCompleted: boolean;
  programCompleted: boolean;
  newProgress: ProgressSnapshot;
  unlocks: string[];
  nextAction: NextAction | null;
}

export interface ProgressSnapshot {
  exercisePercentage: number;
  lessonPercentage: number;
  programPercentage: number;
  journeyPercentage: number;
  currentLesson: string | null;
  currentExercise: string | null;
}

export interface NextAction {
  type: 'continue_lesson' | 'start_exercise' | 'suggest_recommendation';
  entityId: string;
  label: string;
}

export interface RecommendationInputs {
  activeProgramId: string | null;
  lastCompletedExerciseId: string | null;
  currentLessonId: string | null;
  currentExerciseId: string | null;
  mood?: 'distressed' | 'anxious' | 'sad' | 'angry' | 'positive' | 'neutral';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  completedExerciseIds: string[];
  programCompletionPercentage: number;
}

export interface RecommendationOutput {
  type: 'continue_lesson' | 'try_breathing' | 'start_meditation' | 'resume_journal';
  exerciseId: string;
  reason: string;
}

export interface Interruption {
  sessionId: string;
  exerciseId: string;
  type: 'running' | 'paused' | 'orphaned';
  detectedAt: Date;
}

export interface SyncResult {
  fixed: number;
  errors: number;
  details: string[];
}

export function success<T>(data: T): WorkflowResult<T> {
  return { success: true, data };
}

export function failure(code: string, message: string, entity?: string, entityId?: string): WorkflowResult<never> {
  return { success: false, error: { code, message, entity, entityId } };
}

export function progressSnapshot(
  exercisePercentage: number,
  lessonPercentage: number,
  programPercentage: number,
  journeyPercentage: number,
  currentLesson: string | null,
  currentExercise: string | null,
): ProgressSnapshot {
  return { exercisePercentage, lessonPercentage, programPercentage, journeyPercentage, currentLesson, currentExercise };
}
