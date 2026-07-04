import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PersonalizationEngine } from '../PersonalizationEngine';
import type { PersonalizationInputs, PersonalizationOutput } from '../types';
import type { Mood, UserPreferences } from '@/shared/types';
import type { UserProgress, ProgramProgress } from '@/features/journey/models/Progress';
import type { Streak } from '@/features/journey/models/Streak';
import type { Exercise } from '@/features/journey/models/Exercise';

vi.mock('@/services/ai', () => ({
  generateResponse: vi.fn(),
}));

vi.mock('@/services/logging', () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/features/journey/services/RecommendationEngine', () => ({
  getTodaysRecommendations: vi.fn(),
}));

vi.mock('@/prompts/mentalWellnessPrompt', () => ({
  getTimeOfDay: () => 'morning' as const,
}));

const mockExercises: Exercise[] = [
  { id: '1', lessonId: 'lesson-1', type: 'meditation', title: 'Mindful Breathing', description: 'A guided meditation', estimatedTime: 10, content: {}, sortOrder: 0 },
  { id: '2', lessonId: 'lesson-1', type: 'journaling', title: 'Gratitude Journal', description: 'Write what you\'re grateful for', estimatedTime: 5, content: {}, sortOrder: 1 },
  { id: '3', lessonId: 'lesson-2', type: 'breathing', title: '4-7-8 Breathing', description: 'A calming breathing exercise', estimatedTime: 5, content: {}, sortOrder: 0 },
];

const mockPreferences: UserPreferences = {
  theme: 'auto',
  notifications: true,
  language: 'en',
  tone: 'auto',
};

const mockStreak: Streak = {
  currentStreak: 5,
  longestStreak: 12,
  lastActivityDate: new Date(),
  streakHistory: [],
};

function makeInputs(overrides?: Partial<PersonalizationInputs>): PersonalizationInputs {
  const moodHistory: Mood[] = [
    { id: 'm1', rating: 4, note: 'good', timestamp: new Date(Date.now() - 86400000) },
    { id: 'm2', rating: 4, note: 'great', timestamp: new Date(Date.now() - 172800000) },
    { id: 'm3', rating: 3, note: 'ok', timestamp: new Date(Date.now() - 259200000) },
    { id: 'm4', rating: 2, note: 'meh', timestamp: new Date(Date.now() - 345600000) },
    { id: 'm5', rating: 2, note: 'bleh', timestamp: new Date(Date.now() - 432000000) },
    { id: 'm6', rating: 3, note: 'fine', timestamp: new Date(Date.now() - 518400000) },
  ];

  const programProgress: Record<string, ProgramProgress> = {
    'wellness-basics': {
      programId: 'wellness-basics',
      completedLessonIds: ['lesson-1', 'lesson-2'],
      completionPercent: 50,
      lastOpenedAt: new Date(),
      status: 'active',
      resumeTarget: null,
    },
  };

  const userProgress: UserProgress = {
    userId: 'test-user',
    totalExercisesCompleted: 4,
    streakDays: 5,
    lastActivityAt: new Date(),
    programProgress,
  };

  return {
    userId: 'test-user',
    userName: 'Alice',
    moodHistory,
    userProgress,
    programProgress,
    streak: mockStreak,
    preferences: mockPreferences,
    recentExercises: [],
    allExercises: mockExercises,
    timeOfDay: 'morning',
    ...overrides,
  };
}

const mockRuleRecommendation = {
  id: 'rec-1-123',
  exerciseId: '1',
  title: 'Mindful Breathing',
  description: 'A guided meditation',
  categoryId: 'meditation' as const,
  exerciseType: 'meditation' as const,
  durationMinutes: 10,
  reason: 'Based on how you\'re feeling right now',
};

describe('PersonalizationEngine', () => {
  let engine: PersonalizationEngine;

  beforeEach(() => {
    engine = new PersonalizationEngine();
    engine.clearCache();
    vi.clearAllMocks();
  });

  describe('rule engine fallback', () => {
    it('falls back to rule recommendations when AI fails', async () => {
      const { generateResponse } = await import('@/services/ai');
      const { getTodaysRecommendations } = await import('@/features/journey/services/RecommendationEngine');

      vi.mocked(generateResponse).mockRejectedValue(new Error('AI unavailable'));
      vi.mocked(getTodaysRecommendations).mockReturnValue([mockRuleRecommendation as any]);

      const result = await engine.generate(makeInputs());

      expect(result.todaysRecommendation).not.toBeNull();
      expect(result.todaysRecommendation!.source).toBe('rule');
      expect(result.todaysRecommendation!.exerciseId).toBe('1');
      expect(result.todaysRecommendation!.confidence).toBe(0.7);
    });

    it('returns null recommendation when both AI and rules fail', async () => {
      const { generateResponse } = await import('@/services/ai');
      const { getTodaysRecommendations } = await import('@/features/journey/services/RecommendationEngine');

      vi.mocked(generateResponse).mockRejectedValue(new Error('AI unavailable'));
      vi.mocked(getTodaysRecommendations).mockImplementation(() => {
        throw new Error('Rule engine failed');
      });

      const result = await engine.generate(makeInputs());

      expect(result.todaysRecommendation).toBeNull();
      expect(result.continueJourney).not.toBeNull();
      expect(result.personalReflection).toBeNull();
    });
  });

  describe('AI response parsing', () => {
    it('parses plain JSON responses', async () => {
      const { generateResponse } = await import('@/services/ai');
      const { getTodaysRecommendations } = await import('@/features/journey/services/RecommendationEngine');

      const aiContent = JSON.stringify({
        todaysRecommendation: {
          exerciseId: '3',
          title: '4-7-8 Breathing',
          reason: 'Your mood has been declining — this calming exercise can help reset your nervous system.',
          confidence: 0.85,
        },
        personalReflection: {
          prompt: 'What moments this week made you feel most at peace?',
          context: 'Based on your recent mood improvements',
        },
      });

      vi.mocked(generateResponse).mockResolvedValue({ content: aiContent });
      vi.mocked(getTodaysRecommendations).mockReturnValue([mockRuleRecommendation as any]);

      const result = await engine.generate(makeInputs());

      expect(result.todaysRecommendation).not.toBeNull();
      expect(result.todaysRecommendation!.source).toBe('ai');
      expect(result.todaysRecommendation!.exerciseId).toBe('3');
      expect(result.todaysRecommendation!.confidence).toBe(0.85);
      expect(result.personalReflection).not.toBeNull();
      expect(result.personalReflection!.prompt).toContain('What moments');
    });

    it('parses markdown-wrapped JSON responses', async () => {
      const { generateResponse } = await import('@/services/ai');
      const { getTodaysRecommendations } = await import('@/features/journey/services/RecommendationEngine');

      const aiContent = '```json\n{\n  "todaysRecommendation": {\n    "exerciseId": "2",\n    "title": "Gratitude Journal",\n    "reason": "Great for maintaining your positive streak!",\n    "confidence": 0.9\n  },\n  "personalReflection": null\n}\n```';

      vi.mocked(generateResponse).mockResolvedValue({ content: aiContent });
      vi.mocked(getTodaysRecommendations).mockReturnValue([mockRuleRecommendation as any]);

      const result = await engine.generate(makeInputs());

      expect(result.todaysRecommendation).not.toBeNull();
      expect(result.todaysRecommendation!.source).toBe('ai');
      expect(result.todaysRecommendation!.exerciseId).toBe('2');
      expect(result.todaysRecommendation!.confidence).toBe(0.9);
    });

    it('returns null when AI response is not valid JSON', async () => {
      const { generateResponse } = await import('@/services/ai');
      const { getTodaysRecommendations } = await import('@/features/journey/services/RecommendationEngine');

      vi.mocked(generateResponse).mockResolvedValue({ content: 'I think you should try mindful breathing.' });
      vi.mocked(getTodaysRecommendations).mockReturnValue([mockRuleRecommendation as any]);

      const result = await engine.generate(makeInputs());

      expect(result.todaysRecommendation).not.toBeNull();
      expect(result.todaysRecommendation!.source).toBe('rule');
    });
  });

  describe('merge prioritizes AI over rules', () => {
    it('uses AI recommendation when available', async () => {
      const { generateResponse } = await import('@/services/ai');
      const { getTodaysRecommendations } = await import('@/features/journey/services/RecommendationEngine');

      const aiContent = JSON.stringify({
        todaysRecommendation: {
          exerciseId: '3',
          title: '4-7-8 Breathing',
          reason: 'AI reason',
          confidence: 0.9,
        },
        personalReflection: null,
      });

      vi.mocked(generateResponse).mockResolvedValue({ content: aiContent });
      vi.mocked(getTodaysRecommendations).mockReturnValue([mockRuleRecommendation as any]);

      const result = await engine.generate(makeInputs());

      expect(result.todaysRecommendation!.exerciseId).toBe('3');
      expect(result.todaysRecommendation!.source).toBe('ai');
      expect(result.todaysRecommendation!.reason).toBe('AI reason');
    });

    it('falls back to rules when AI recommendation is missing required fields', async () => {
      const { generateResponse } = await import('@/services/ai');
      const { getTodaysRecommendations } = await import('@/features/journey/services/RecommendationEngine');

      const aiContent = JSON.stringify({
        todaysRecommendation: {
          reason: 'some reason',
          confidence: 0.5,
        },
        personalReflection: null,
      });

      vi.mocked(generateResponse).mockResolvedValue({ content: aiContent });
      vi.mocked(getTodaysRecommendations).mockReturnValue([mockRuleRecommendation as any]);

      const result = await engine.generate(makeInputs());

      expect(result.todaysRecommendation).not.toBeNull();
      expect(result.todaysRecommendation!.source).toBe('rule');
    });
  });

  describe('cache behavior', () => {
    it('returns cached result within TTL', async () => {
      const { generateResponse } = await import('@/services/ai');
      const { getTodaysRecommendations } = await import('@/features/journey/services/RecommendationEngine');

      vi.mocked(generateResponse).mockResolvedValue({ content: JSON.stringify({ todaysRecommendation: null, personalReflection: null }) });
      vi.mocked(getTodaysRecommendations).mockReturnValue([mockRuleRecommendation as any]);

      await engine.generate(makeInputs());
      const callCount = vi.mocked(generateResponse).mock.calls.length;

      const result2 = await engine.generate(makeInputs());

      expect(vi.mocked(generateResponse).mock.calls.length).toBe(callCount);
      expect(result2.todaysRecommendation).not.toBeNull();
    });

    it('regenerates after clearCache', async () => {
      const { generateResponse } = await import('@/services/ai');
      const { getTodaysRecommendations } = await import('@/features/journey/services/RecommendationEngine');

      vi.mocked(generateResponse).mockResolvedValue({ content: JSON.stringify({ todaysRecommendation: null, personalReflection: null }) });
      vi.mocked(getTodaysRecommendations).mockReturnValue([mockRuleRecommendation as any]);

      await engine.generate(makeInputs());
      engine.clearCache();

      vi.mocked(generateResponse).mockClear();
      vi.mocked(getTodaysRecommendations).mockClear();

      vi.mocked(generateResponse).mockResolvedValue({ content: JSON.stringify({ todaysRecommendation: null, personalReflection: null }) });
      vi.mocked(getTodaysRecommendations).mockReturnValue([mockRuleRecommendation as any]);

      await engine.generate(makeInputs());

      expect(vi.mocked(generateResponse).mock.calls.length).toBe(1);
    });
  });

  describe('continueJourney computation', () => {
    it('computes continueJourney from active programs when AI provides none', async () => {
      const { generateResponse } = await import('@/services/ai');
      const { getTodaysRecommendations } = await import('@/features/journey/services/RecommendationEngine');

      vi.mocked(generateResponse).mockRejectedValue(new Error('AI unavailable'));
      vi.mocked(getTodaysRecommendations).mockReturnValue([mockRuleRecommendation as any]);

      const result = await engine.generate(makeInputs());

      expect(result.continueJourney).not.toBeNull();
      expect(result.continueJourney!.programId).toBe('wellness-basics');
      expect(result.continueJourney!.progress).toBe(50);
    });

    it('returns null continueJourney when no active programs', async () => {
      const { generateResponse } = await import('@/services/ai');
      const { getTodaysRecommendations } = await import('@/features/journey/services/RecommendationEngine');

      vi.mocked(generateResponse).mockRejectedValue(new Error('AI unavailable'));
      vi.mocked(getTodaysRecommendations).mockReturnValue([mockRuleRecommendation as any]);

      const noProgInputs = makeInputs({
        programProgress: {},
        userProgress: {
          userId: 'test-user',
          totalExercisesCompleted: 0,
          streakDays: 0,
          lastActivityAt: null,
          programProgress: {},
        },
      });

      const result = await engine.generate(noProgInputs);

      expect(result.continueJourney).toBeNull();
    });
  });
});
