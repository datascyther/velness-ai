import type { ExerciseRepository } from '../repositories/ExerciseRepository';
import type { LessonRepository } from '../repositories/LessonRepository';
import type { ProgramRepository } from '../repositories/ProgramRepository';
import type { JourneyRepository } from '../repositories/JourneyRepository';
import type { ProgressRepository } from '../repositories/ProgressRepository';
import { ExerciseLifecycle } from './ExerciseLifecycle';
import { SessionEngine } from './SessionEngine';
import { LessonLifecycle } from './LessonLifecycle';
import { ProgramLifecycle } from './ProgramLifecycle';
import { ProgressEngine } from './ProgressEngine';
import { UnlockEngine } from './UnlockEngine';
import { RecommendationEngine } from './RecommendationEngine';
import {
  success,
  failure,
  progressSnapshot,
  type WorkflowResult,
  type CompletionSummary,
  type RecommendationInputs,
} from './types';

export class CompletionEngine {
  constructor(
    private exerciseLifecycle: ExerciseLifecycle,
    private sessionEngine: SessionEngine,
    private lessonLifecycle: LessonLifecycle,
    private programLifecycle: ProgramLifecycle,
    private progressEngine: ProgressEngine,
    private unlockEngine: UnlockEngine,
    private recommendationEngine: RecommendationEngine,
    private exerciseRepo: ExerciseRepository,
    private lessonRepo: LessonRepository,
    private programRepo: ProgramRepository,
    private journeyRepo: JourneyRepository,
    private progressRepo: ProgressRepository,
  ) {}

  async execute(
    userId: string,
    exerciseId: string,
    sessionId: string,
    mood?: RecommendationInputs['mood'],
    timeOfDay?: RecommendationInputs['timeOfDay'],
  ): Promise<WorkflowResult<CompletionSummary>> {
    const exercise = await this.exerciseRepo.getById(exerciseId);
    if (!exercise) return failure('EXERCISE_NOT_FOUND', `Exercise ${exerciseId} not found`, 'Exercise', exerciseId);

    const completeResult = await this.exerciseLifecycle.complete(exerciseId);
    if ('error' in completeResult) return failure(completeResult.error.code, completeResult.error.message);

    const finishResult = await this.sessionEngine.finish(sessionId);
    if ('error' in finishResult) return failure(finishResult.error.code, finishResult.error.message);

    let lessonCompleted = false;
    let programCompleted = false;

    const lesson = await this.lessonRepo.getById(exercise.lessonId);
    if (!lesson) return failure('LESSON_NOT_FOUND', `Lesson ${exercise.lessonId} not found`, 'Lesson', exercise.lessonId);

    const lessonExercises = await this.exerciseRepo.getByLessonId(lesson.id);
    const completedExerciseIds = lessonExercises
      .filter(e => e.status === 'completed' || e.id === exerciseId)
      .map(e => e.id);

    if (this.progressEngine.isLessonComplete(lessonExercises, completedExerciseIds)) {
      const completeLessonResult = await this.lessonLifecycle.complete(userId, lesson.id);
      if (completeLessonResult.success) {
        lessonCompleted = true;
      }
    }

    const programLessons = await this.lessonRepo.getByProgramId(lesson.programId);
    const completedLessonIds = programLessons
      .filter(l => l.status === 'completed' || (lessonCompleted && l.id === lesson.id))
      .map(l => l.id);

    if (this.progressEngine.isProgramComplete(programLessons, completedLessonIds)) {
      const completeProgramResult = await this.programLifecycle.complete(userId, lesson.programId);
      if (completeProgramResult.success) {
        programCompleted = true;
      }
    }

    const unlockResult = await this.unlockEngine.processCompletion('exercise', exerciseId);

    const allPrograms = await this.programRepo.getAll();
    const completedProgramCount = allPrograms.filter(p => p.status === 'completed').length;

    const journey = await this.journeyRepo.get(userId);
    if (journey) {
      const journeyProgress = await this.progressRepo.getJourneyProgress(journey.id);
      if (journeyProgress) {
        journeyProgress.totalExercisesCompleted += 1;
        journeyProgress.totalProgramsCompleted = completedProgramCount;
        journeyProgress.lastActivityAt = new Date();
        await this.progressRepo.updateJourneyProgress(journeyProgress);
      }
    }

    const exPercent = this.progressEngine.calculateExercisePercentage(exercise);
    const lessonPercent = this.progressEngine.calculateLessonPercentage(completedExerciseIds, lessonExercises.length);
    const programPercent = this.progressEngine.calculateProgramPercentage(completedLessonIds, programLessons.length);
    const journeyPercent = programCompleted
      ? 100
      : Math.round((completedProgramCount / (allPrograms.length || 1)) * 100);

    const recommendationInputs: RecommendationInputs = {
      activeProgramId: lesson.programId,
      lastCompletedExerciseId: exerciseId,
      currentLessonId: lessonCompleted ? null : lesson.id,
      currentExerciseId: null,
      mood,
      timeOfDay,
      completedExerciseIds,
      programCompletionPercentage: programPercent,
    };

    const recommendationResult = await this.recommendationEngine.generate(recommendationInputs);
    const nextAction = recommendationResult.success
      ? {
          type: recommendationResult.data.type === 'continue_lesson' ? ('continue_lesson' as const) : ('suggest_recommendation' as const),
          entityId: recommendationResult.data.exerciseId || exerciseId,
          label: recommendationResult.data.reason,
        }
      : null;

    const currentLessonId = this.progressEngine.getCurrentLesson(completedLessonIds, programLessons);
    const currentExerciseId = this.progressEngine.getCurrentExercise(completedExerciseIds, lessonExercises);

    return success({
      exerciseId,
      sessionId,
      lessonCompleted,
      programCompleted,
      newProgress: progressSnapshot(exPercent, lessonPercent, programPercent, journeyPercent, currentLessonId, currentExerciseId),
      unlocks: [
        ...(unlockResult.success ? unlockResult.data.unlockedExercises.map(e => e.id) : []),
        ...(unlockResult.success ? unlockResult.data.unlockedLessons.map(l => l.id) : []),
      ],
      nextAction,
    });
  }
}
