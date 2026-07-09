export type Severity = 'error' | 'warning';

export interface ValidationRule {
  id: string;
  entity: string;
  field?: string;
  severity: Severity;
  description: string;
  constraint: string;
}

export const VALIDATION_RULES: readonly ValidationRule[] = [
  // ── Program ──
  {
    id: 'program.id.required',
    entity: 'Program',
    field: 'id',
    severity: 'error',
    description: 'Program must have a unique identifier',
    constraint: 'id is required and must be non-empty',
  },
  {
    id: 'program.title.required',
    entity: 'Program',
    field: 'title',
    severity: 'error',
    description: 'Program must have a title',
    constraint: 'title is required and must be non-empty',
  },
  {
    id: 'program.min-lessons',
    entity: 'Program',
    severity: 'error',
    description: 'Program must contain at least one lesson',
    constraint: 'lessonCount >= 1',
  },
  {
    id: 'program.difficulty.valid',
    entity: 'Program',
    field: 'difficulty',
    severity: 'error',
    description: 'Program difficulty must be a valid value',
    constraint: 'difficulty must be one of: beginner, intermediate, advanced',
  },
  {
    id: 'program.status.valid',
    entity: 'Program',
    field: 'status',
    severity: 'error',
    description: 'Program status must be a valid state',
    constraint: 'status must be one of: locked, available, active, completed, archived',
  },
  {
    id: 'program.estimatedDuration.positive',
    entity: 'Program',
    field: 'estimatedDuration',
    severity: 'error',
    description: 'Program estimated duration must be positive',
    constraint: 'estimatedDuration > 0',
  },

  // ── Lesson ──
  {
    id: 'lesson.id.required',
    entity: 'Lesson',
    field: 'id',
    severity: 'error',
    description: 'Lesson must have a unique identifier',
    constraint: 'id is required and must be non-empty',
  },
  {
    id: 'lesson.programId.required',
    entity: 'Lesson',
    field: 'programId',
    severity: 'error',
    description: 'Lesson must belong to one program',
    constraint: 'programId is required and must reference an existing program',
  },
  {
    id: 'lesson.title.required',
    entity: 'Lesson',
    field: 'title',
    severity: 'error',
    description: 'Lesson must have a title',
    constraint: 'title is required and must be non-empty',
  },
  {
    id: 'lesson.min-exercises',
    entity: 'Lesson',
    severity: 'error',
    description: 'Lesson must contain at least one exercise',
    constraint: 'exerciseCount >= 1',
  },
  {
    id: 'lesson.order.positive',
    entity: 'Lesson',
    field: 'order',
    severity: 'error',
    description: 'Lesson order must be positive',
    constraint: 'order >= 0',
  },

  // ── Exercise ──
  {
    id: 'exercise.id.required',
    entity: 'Exercise',
    field: 'id',
    severity: 'error',
    description: 'Exercise must have a unique identifier',
    constraint: 'id is required and must be non-empty',
  },
  {
    id: 'exercise.lessonId.required',
    entity: 'Exercise',
    field: 'lessonId',
    severity: 'error',
    description: 'Exercise must belong to one lesson',
    constraint: 'lessonId is required and must reference an existing lesson',
  },
  {
    id: 'exercise.type.required',
    entity: 'Exercise',
    field: 'type',
    severity: 'error',
    description: 'Exercise must have exactly one type',
    constraint: 'type is required and must be a valid ExerciseType',
  },
  {
    id: 'exercise.title.required',
    entity: 'Exercise',
    field: 'title',
    severity: 'error',
    description: 'Exercise must have a title',
    constraint: 'title is required and must be non-empty',
  },
  {
    id: 'exercise.duration.positive',
    entity: 'Exercise',
    field: 'duration',
    severity: 'error',
    description: 'Exercise duration must be positive',
    constraint: 'duration > 0',
  },

  // ── Session ──
  {
    id: 'session.exerciseId.required',
    entity: 'Session',
    field: 'exerciseId',
    severity: 'error',
    description: 'Session cannot exist without an exercise',
    constraint: 'exerciseId is required and must reference an existing exercise',
  },
  {
    id: 'session.startedAt.required',
    entity: 'Session',
    field: 'startedAt',
    severity: 'error',
    description: 'Session must have a start time',
    constraint: 'startedAt is required',
  },
  {
    id: 'session.elapsedTime.non-negative',
    entity: 'Session',
    field: 'elapsedTime',
    severity: 'error',
    description: 'Session elapsed time must be non-negative',
    constraint: 'elapsedTime >= 0',
  },
  {
    id: 'session.completionPercentage.range',
    entity: 'Session',
    field: 'completionPercentage',
    severity: 'error',
    description: 'Session completion percentage must be between 0 and 100',
    constraint: '0 <= completionPercentage <= 100',
  },

  // ── Progress ──
  {
    id: 'progress.completionPercentage.max',
    entity: 'Progress',
    field: 'completionPercentage',
    severity: 'error',
    description: 'Progress completion percentage cannot exceed 100%',
    constraint: '0 <= completionPercentage <= 100',
  },
  {
    id: 'progress.programId.required',
    entity: 'Progress',
    field: 'programId',
    severity: 'error',
    description: 'Progress must reference a program',
    constraint: 'programId is required and must reference an existing program',
  },

  // ── Completion ──
  {
    id: 'completion.program-not-locked',
    entity: 'Completion',
    severity: 'error',
    description: 'Completion cannot happen if the program is locked',
    constraint: 'Program.status must not be "locked" when completion is created',
  },
  {
    id: 'completion.lesson-not-locked',
    entity: 'Completion',
    severity: 'error',
    description: 'Completion cannot happen if the lesson is locked',
    constraint: 'Lesson.status must not be "locked" when completion is created',
  },
  {
    id: 'completion.exercise-started',
    entity: 'Completion',
    severity: 'error',
    description: 'Completion cannot happen if the exercise was never started',
    constraint: 'Exercise.status must not be "locked" when completion is created',
  },
];

export function getRulesForEntity(entity: string): ValidationRule[] {
  return VALIDATION_RULES.filter(r => r.entity === entity);
}

export function getRuleById(id: string): ValidationRule | undefined {
  return VALIDATION_RULES.find(r => r.id === id);
}
