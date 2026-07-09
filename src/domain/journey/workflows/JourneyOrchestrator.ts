import type { ProgramRepository } from '../repositories/ProgramRepository';
import type { LessonRepository } from '../repositories/LessonRepository';
import type { ExerciseRepository } from '../repositories/ExerciseRepository';
import type { SessionRepository } from '../repositories/SessionRepository';
import type { JourneyRepository } from '../repositories/JourneyRepository';
import type { ProgressRepository } from '../repositories/ProgressRepository';
import { ProgramLifecycle } from './ProgramLifecycle';
import { LessonLifecycle } from './LessonLifecycle';
import { ExerciseLifecycle } from './ExerciseLifecycle';
import { SessionEngine } from './SessionEngine';
import { ProgressEngine } from './ProgressEngine';
import { UnlockEngine } from './UnlockEngine';
import { RecommendationEngine } from './RecommendationEngine';
import { CompletionEngine } from './CompletionEngine';
import { RecoveryEngine } from './RecoveryEngine';
import {
  success,
  failure,
  type WorkflowResult,
  type CompletionSummary,
  type NextAction,
  type RecommendationInputs,
} from './types';

export class JourneyOrchestrator {
  readonly programLifecycle: ProgramLifecycle;
  readonly lessonLifecycle: LessonLifecycle;
  readonly exerciseLifecycle: ExerciseLifecycle;
  readonly sessionEngine: SessionEngine;
  readonly progressEngine: ProgressEngine;
  readonly unlockEngine: UnlockEngine;
  readonly recommendationEngine: RecommendationEngine;
  readonly completionEngine: CompletionEngine;
  readonly recoveryEngine: RecoveryEngine;

  constructor(
    private programRepo: ProgramRepository,
    private lessonRepo: LessonRepository,
    private exerciseRepo: ExerciseRepository,
    private sessionRepo: SessionRepository,
    private journeyRepo: JourneyRepository,
    private progressRepo: ProgressRepository,
  ) {
    this.progressEngine = new ProgressEngine();
    this.sessionEngine = new SessionEngine(this.sessionRepo);
    this.exerciseLifecycle = new ExerciseLifecycle(this.exerciseRepo, this.sessionEngine);
    this.recommendationEngine = new RecommendationEngine(this.exerciseRepo, this.lessonRepo);
    this.unlockEngine = new UnlockEngine(this.programRepo, this.lessonRepo, this.exerciseRepo);
    this.programLifecycle = new ProgramLifecycle(
      this.programRepo, this.lessonRepo, this.progressRepo, this.progressEngine, this.unlockEngine,
    );
    this.lessonLifecycle = new LessonLifecycle(
      this.lessonRepo, this.exerciseRepo, this.progressRepo, this.progressEngine,
    );
    this.completionEngine = new CompletionEngine(
      this.exerciseLifecycle, this.sessionEngine, this.lessonLifecycle, this.programLifecycle,
      this.progressEngine, this.unlockEngine, this.recommendationEngine,
      this.exerciseRepo, this.lessonRepo, this.programRepo, this.journeyRepo, this.progressRepo,
    );
    this.recoveryEngine = new RecoveryEngine(
      this.sessionRepo, this.exerciseRepo, this.progressRepo, this.journeyRepo, this.sessionEngine, this.exerciseLifecycle,
    );
  }

  async startProgram(userId: string, programId: string): Promise<WorkflowResult<{ programId: string; firstLessonId: string | null }>> {
    const result = await this.programLifecycle.start(userId, programId);
    if ('error' in result) return failure(result.error.code, result.error.message, result.error.entity, result.error.entityId);

    const journey = await this.journeyRepo.get(userId);
    if (journey) {
      journey.currentProgramId = programId;
      journey.status = 'active';
      if (!journey.startedAt) journey.startedAt = new Date();
      await this.journeyRepo.update(journey);
    }

    return success({ programId, firstLessonId: null });
  }

  async continueProgram(userId: string): Promise<WorkflowResult<{ programId: string; lessonId: string | null; exerciseId: string | null }>> {
    const journey = await this.journeyRepo.get(userId);
    if (!journey || !journey.currentProgramId) {
      return failure('NO_ACTIVE_PROGRAM', 'No active program found', 'Journey');
    }

    const resumeResult = await this.programLifecycle.resume(journey.currentProgramId);
    if ('error' in resumeResult) return failure(resumeResult.error.code, resumeResult.error.message, resumeResult.error.entity, resumeResult.error.entityId);

    let exerciseId: string | null = null;
    if (resumeResult.data.currentLessonId) {
      const lessonResult = await this.lessonLifecycle.resume(resumeResult.data.currentLessonId);
      if (lessonResult.success) {
        exerciseId = lessonResult.data.currentExerciseId;
      }
    }

    return success({
      programId: journey.currentProgramId,
      lessonId: resumeResult.data.currentLessonId,
      exerciseId,
    });
  }

  async resumeLesson(lessonId: string): Promise<WorkflowResult<{ lessonId: string; exerciseId: string | null }>> {
    const result = await this.lessonLifecycle.resume(lessonId);
    if ('error' in result) return failure(result.error.code, result.error.message, result.error.entity, result.error.entityId);
    return success({ lessonId, exerciseId: result.data.currentExerciseId });
  }

  async completeLesson(userId: string, lessonId: string): Promise<WorkflowResult<void>> {
    const result = await this.lessonLifecycle.complete(userId, lessonId);
    if ('error' in result) return failure(result.error.code, result.error.message, result.error.entity, result.error.entityId);

    const unlockResult = await this.unlockEngine.processCompletion('lesson', lessonId);
    if ('error' in unlockResult) return failure(unlockResult.error.code, unlockResult.error.message, unlockResult.error.entity, unlockResult.error.entityId);

    return success(undefined);
  }

  async completeExercise(
    userId: string,
    exerciseId: string,
    sessionId: string,
    mood?: RecommendationInputs['mood'],
    timeOfDay?: RecommendationInputs['timeOfDay'],
  ): Promise<WorkflowResult<CompletionSummary>> {
    return this.completionEngine.execute(userId, exerciseId, sessionId, mood, timeOfDay);
  }

  async unlockLesson(programId: string, lessonId: string): Promise<WorkflowResult<void>> {
    const result = await this.unlockEngine.unlockLesson(programId);
    if ('error' in result) return failure(result.error.code, result.error.message, result.error.entity, result.error.entityId);
    return success(undefined);
  }

  async unlockProgram(programId: string): Promise<WorkflowResult<void>> {
    const result = await this.unlockEngine.unlockProgram(programId);
    if ('error' in result) return failure(result.error.code, result.error.message, result.error.entity, result.error.entityId);
    return success(undefined);
  }

  async updateProgress(userId: string): Promise<WorkflowResult<void>> {
    const journey = await this.journeyRepo.get(userId);
    if (!journey) return failure('JOURNEY_NOT_FOUND', 'Journey not found', 'Journey');

    const journeyProgress = await this.progressRepo.getJourneyProgress(journey.id);
    if (!journeyProgress) return success(undefined);

    const allPrograms = await this.programRepo.getAll();
    const completedCount = allPrograms.filter(p => p.status === 'completed').length;
    journeyProgress.totalProgramsCompleted = completedCount;

    let totalExercises = 0;
    for (const programId of journey.programIds) {
      const pp = await this.progressRepo.getProgramProgress(programId, userId);
      if (pp) {
        totalExercises += pp.completedExercises.length;
      }
    }
    journeyProgress.totalExercisesCompleted = totalExercises;
    journeyProgress.lastActivityAt = new Date();

    await this.progressRepo.updateJourneyProgress(journeyProgress);
    return success(undefined);
  }

  async generateNextAction(userId: string): Promise<WorkflowResult<NextAction>> {
    const journey = await this.journeyRepo.get(userId);
    if (!journey) return failure('JOURNEY_NOT_FOUND', 'Journey not found', 'Journey');

    let activeProgramId: string | null = journey.currentProgramId;
    let currentLessonId: string | null = null;
    let currentExerciseId: string | null = null;
    let completedIds: string[] = [];
    let programPercent = 0;

    if (activeProgramId) {
      const resumeResult = await this.programLifecycle.resume(activeProgramId);
      if (resumeResult.success) {
        currentLessonId = resumeResult.data.currentLessonId;
        if (currentLessonId) {
          const lessonResult = await this.lessonLifecycle.resume(currentLessonId);
          if (lessonResult.success) {
            currentExerciseId = lessonResult.data.currentExerciseId;
          }
        }
      }

      const progress = await this.progressRepo.getProgramProgress(activeProgramId, userId);
      if (progress) {
        completedIds = progress.completedExercises;
        programPercent = progress.completionPercentage;
      }
    }

    const recResult = await this.recommendationEngine.generate({
      activeProgramId,
      lastCompletedExerciseId: null,
      currentLessonId,
      currentExerciseId,
      completedExerciseIds: completedIds,
      programCompletionPercentage: programPercent,
    });

    if ('error' in recResult) {
      return success({
        type: 'suggest_recommendation',
        entityId: '',
        label: 'Take a moment to breathe',
      });
    }

    return success({
      type: recResult.data.type === 'continue_lesson' ? 'continue_lesson' : 'suggest_recommendation',
      entityId: recResult.data.exerciseId || currentExerciseId || '',
      label: recResult.data.reason,
    });
  }
}
