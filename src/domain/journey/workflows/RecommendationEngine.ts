import type { ExerciseRepository } from '../repositories/ExerciseRepository';
import type { LessonRepository } from '../repositories/LessonRepository';
import type { RecommendationInputs, RecommendationOutput, WorkflowResult } from './types';
import { EXERCISE_TYPE } from '../enums';
import { success } from './types';

const MOOD_EXERCISE_MAP: Record<string, { type: RecommendationOutput['type']; exerciseType: string; reason: string }> = {
  distressed: { type: 'try_breathing', exerciseType: EXERCISE_TYPE.BREATHING, reason: 'Breathing exercises can help calm your nervous system' },
  anxious: { type: 'try_breathing', exerciseType: EXERCISE_TYPE.BREATHING, reason: 'Deep breathing helps reduce anxiety' },
  sad: { type: 'start_meditation', exerciseType: EXERCISE_TYPE.MEDITATION, reason: 'Meditation can help process difficult emotions' },
  angry: { type: 'try_breathing', exerciseType: EXERCISE_TYPE.BREATHING, reason: 'Take a moment to breathe and reset' },
  positive: { type: 'resume_journal', exerciseType: EXERCISE_TYPE.JOURNAL, reason: 'Capture your positive energy in a journal entry' },
};

const TIME_EXERCISE_MAP: Record<string, { type: RecommendationOutput['type']; exerciseType: string; reason: string }> = {
  morning: { type: 'start_meditation', exerciseType: EXERCISE_TYPE.MEDITATION, reason: 'Start your day with mindfulness' },
  afternoon: { type: 'try_breathing', exerciseType: EXERCISE_TYPE.BREATHING, reason: 'A midday breathing break can reset your focus' },
  evening: { type: 'resume_journal', exerciseType: EXERCISE_TYPE.JOURNAL, reason: 'Reflect on your day with a journal entry' },
  night: { type: 'start_meditation', exerciseType: EXERCISE_TYPE.MEDITATION, reason: 'Wind down with a calming meditation' },
};

export class RecommendationEngine {
  constructor(
    private exerciseRepo: ExerciseRepository,
    private lessonRepo: LessonRepository,
  ) {}

  async generate(inputs: RecommendationInputs): Promise<WorkflowResult<RecommendationOutput>> {
    const rec = this.generateSync(inputs);
    return success(rec);
  }

  generateSync(inputs: RecommendationInputs): RecommendationOutput {
    if (inputs.activeProgramId && inputs.currentLessonId) {
      if (inputs.currentExerciseId) {
        return {
          type: 'continue_lesson',
          exerciseId: inputs.currentExerciseId,
          reason: 'Continue where you left off',
        };
      }
      if (inputs.programCompletionPercentage > 0 && inputs.programCompletionPercentage < 100) {
        return {
          type: 'continue_lesson',
          exerciseId: inputs.lastCompletedExerciseId ?? '',
          reason: 'Resume your current program',
        };
      }
    }

    if (inputs.mood && MOOD_EXERCISE_MAP[inputs.mood]) {
      const match = MOOD_EXERCISE_MAP[inputs.mood];
      return { type: match.type, exerciseId: '', reason: match.reason };
    }

    if (inputs.timeOfDay && TIME_EXERCISE_MAP[inputs.timeOfDay]) {
      const match = TIME_EXERCISE_MAP[inputs.timeOfDay];
      return { type: match.type, exerciseId: '', reason: match.reason };
    }

    return {
      type: 'try_breathing',
      exerciseId: '',
      reason: 'Take a moment to focus on your breath',
    };
  }
}
