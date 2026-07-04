import { generateResponse } from '@/services/ai';
import { getTodaysRecommendations } from '@/features/journey/services/RecommendationEngine';
import { getTimeOfDay } from '@/prompts/mentalWellnessPrompt';
import { logger } from '@/services/logging';
import { buildPersonalizationSystemPrompt, buildPersonalizationContext } from './prompts';
import type { PersonalizationInputs, PersonalizationOutput, AIRecommendation } from './types';
import type { Recommendation } from '@/features/journey/models/Recommendation';
import type { RecommendationInputs } from '@/features/journey/services/RecommendationEngine';
import type { Category } from '@/features/journey/models/Category';
import { DEFAULT_CATEGORIES } from '@/features/journey/data/categories';

const CACHE_TTL_MS = 30 * 60 * 1000;

export class PersonalizationEngine {
  private cachedOutput: PersonalizationOutput | null = null;
  private cacheTimestamp = 0;
  private inFlight: Promise<PersonalizationOutput> | null = null;

  async generate(inputs: PersonalizationInputs): Promise<PersonalizationOutput> {
    const cached = this.getCached();
    if (cached) return cached;

    if (this.inFlight) return this.inFlight;

    this.inFlight = this._generate(inputs);
    try {
      return await this.inFlight;
    } finally {
      this.inFlight = null;
    }
  }

  private async _generate(inputs: PersonalizationInputs): Promise<PersonalizationOutput> {
    const ruleRecs = this.runRuleEngine(inputs);

    let aiOutput: PersonalizationOutput | null = null;
    try {
      const systemPrompt = buildPersonalizationSystemPrompt();
      const context = buildPersonalizationContext(inputs);
      const prompt = `${systemPrompt}\n\n${context}`;

      const response = await generateResponse({
        text: prompt,
        uid: inputs.userId,
      });

      aiOutput = this.parseAIResponse(response.content);
    } catch (e) {
      logger.warn('general', 'AI personalization engine failed, falling back to rules', {
        error: String(e),
      });
    }

    const output = this.mergeOutputs(aiOutput, ruleRecs, inputs);
    this.cacheOutput(output);
    return output;
  }

  private runRuleEngine(
    inputs: PersonalizationInputs,
  ): Recommendation[] {
    try {
      const recInputs: RecommendationInputs = {
        userProgress: inputs.userProgress,
        categories: DEFAULT_CATEGORIES as Category[],
        allExercises: inputs.allExercises,
        moodHistory: inputs.moodHistory,
        recentExercises: inputs.recentExercises
          .filter((ex) => ex.lastCompletedAt)
          .map((ex) => ex.id),
        completedLessons: Object.values(inputs.programProgress).flatMap(
          (p) => p.completedLessonIds,
        ),
      };

      return getTodaysRecommendations(recInputs);
    } catch (e) {
      logger.warn('general', 'Rule engine failed', { error: String(e) });
      return [];
    }
  }

  private parseAIResponse(content: string): PersonalizationOutput | null {
    try {
      let json = content.trim();

      const jsonMatch = json.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        json = jsonMatch[1];
      }

      const braceStart = json.indexOf('{');
      const braceEnd = json.lastIndexOf('}');
      if (braceStart !== -1 && braceEnd !== -1 && braceEnd > braceStart) {
        json = json.slice(braceStart, braceEnd + 1);
      }

      const parsed = JSON.parse(json);

      const output: PersonalizationOutput = {
        todaysRecommendation: null,
        continueJourney: null,
        suggestedExercise: null,
        personalReflection: null,
      };

      if (parsed.todaysRecommendation && parsed.todaysRecommendation.exerciseId) {
        output.todaysRecommendation = {
          id: `ai-rec-${parsed.todaysRecommendation.exerciseId}-${Date.now()}`,
          exerciseId: parsed.todaysRecommendation.exerciseId,
          title: parsed.todaysRecommendation.title || '',
          description: '',
          reason: parsed.todaysRecommendation.reason || '',
          durationMinutes: 0,
          confidence: parsed.todaysRecommendation.confidence ?? 0.5,
          source: 'ai',
        };
      }

      if (parsed.personalReflection && parsed.personalReflection.prompt) {
        output.personalReflection = {
          prompt: parsed.personalReflection.prompt,
          context: parsed.personalReflection.context || '',
        };
      }

      return output;
    } catch {
      return null;
    }
  }

  private enrichAIRecommendation(
    ai: AIRecommendation,
    allExercises: PersonalizationInputs['allExercises'],
  ): AIRecommendation {
    const exercise = allExercises.find((ex) => ex.id === ai.exerciseId);
    if (exercise) {
      return {
        ...ai,
        title: ai.title || exercise.title,
        description: exercise.description,
        durationMinutes: exercise.estimatedTime,
      };
    }
    return ai;
  }

  private recToAIRecommendation(rec: Recommendation): AIRecommendation {
    return {
      id: rec.id,
      exerciseId: rec.exerciseId,
      title: rec.title,
      description: rec.description,
      reason: rec.reason,
      durationMinutes: rec.durationMinutes,
      confidence: 0.7,
      source: 'rule',
    };
  }

  private computeContinueJourney(
    inputs: PersonalizationInputs,
  ): PersonalizationOutput['continueJourney'] {
    const activePrograms = Object.values(inputs.programProgress)
      .filter((p) => p.status === 'active')
      .sort((a, b) => b.completionPercent - a.completionPercent);

    if (activePrograms.length === 0) return null;

    const top = activePrograms[0];
    const lastLessonId =
      top.completedLessonIds.length > 0
        ? top.completedLessonIds[top.completedLessonIds.length - 1]
        : null;

    const lastExercise = lastLessonId
      ? inputs.allExercises
          .filter((ex) => ex.lessonId === lastLessonId)
          .sort((a, b) => b.sortOrder - a.sortOrder)[0]
      : null;

    return {
      programId: top.programId,
      lessonId: lastLessonId,
      exerciseId: lastExercise?.id ?? null,
      progress: top.completionPercent,
    };
  }

  private mergeOutputs(
    ai: PersonalizationOutput | null,
    ruleRecs: Recommendation[],
    inputs: PersonalizationInputs,
  ): PersonalizationOutput {
    const output: PersonalizationOutput = {
      todaysRecommendation: null,
      continueJourney: null,
      suggestedExercise: null,
      personalReflection: null,
    };

    if (ai?.todaysRecommendation) {
      output.todaysRecommendation = this.enrichAIRecommendation(
        ai.todaysRecommendation,
        inputs.allExercises,
      );
    } else if (ruleRecs.length > 0) {
      output.todaysRecommendation = this.recToAIRecommendation(ruleRecs[0]);
    }

    if (ai?.continueJourney) {
      output.continueJourney = ai.continueJourney;
    } else {
      output.continueJourney = this.computeContinueJourney(inputs);
    }

    if (ai?.suggestedExercise) {
      output.suggestedExercise = this.enrichAIRecommendation(
        ai.suggestedExercise,
        inputs.allExercises,
      );
    } else if (ruleRecs.length > 1) {
      output.suggestedExercise = this.recToAIRecommendation(ruleRecs[1]);
    }

    if (ai?.personalReflection) {
      output.personalReflection = ai.personalReflection;
    }

    return output;
  }

  private getCached(): PersonalizationOutput | null {
    if (
      this.cachedOutput &&
      Date.now() - this.cacheTimestamp < CACHE_TTL_MS
    ) {
      return this.cachedOutput;
    }
    return null;
  }

  private cacheOutput(output: PersonalizationOutput): void {
    this.cachedOutput = output;
    this.cacheTimestamp = Date.now();
  }

  clearCache(): void {
    this.cachedOutput = null;
    this.cacheTimestamp = 0;
    this.inFlight = null;
  }
}

export const personalizationEngine = new PersonalizationEngine();
