import { describe, it, expect } from 'vitest';
import { getTodaysRecommendations } from '../RecommendationEngine';
import type { RecommendationInputs } from '../RecommendationEngine';
import type { Mood } from '@/shared/types';
import type { UserProgress } from '../../models/Progress';
import { CATEGORY_ID } from '../../constants';
import { DEFAULT_CATEGORIES } from '../../data/categories';
import { DEFAULT_EXERCISES } from '../../data/exercises';

function makeTestInputs(moodHistory: Mood[], overrides?: Partial<RecommendationInputs>): RecommendationInputs {
  const userProgress: UserProgress = {
    userId: 'test-user',
    totalExercisesCompleted: 5,
    streakDays: 4,
    lastActivityAt: new Date(),
    programProgress: {
      'understanding-thoughts': {
        programId: 'understanding-thoughts',
        completedLessonIds: [],
        completionPercent: 0,
        lastOpenedAt: null,
        status: 'active',
        resumeTarget: null,
      },
    },
  };

  return {
    userProgress,
    categories: DEFAULT_CATEGORIES as any,
    allExercises: DEFAULT_EXERCISES,
    moodHistory,
    recentExercises: [],
    completedLessons: [],
    ...overrides,
  };
}

describe('RecommendationEngine - Sprint 4.7 Integration', () => {
  it('recommends breathing when mood note indicates anxiety', () => {
    const moodHistory: Mood[] = [
      {
        id: 'm1',
        rating: 3,
        note: 'I am feeling super anxious about the presentation today.',
        timestamp: new Date(),
      },
    ];

    const inputs = makeTestInputs(moodHistory);
    const result = getTodaysRecommendations(inputs);

    expect(result.length).toBeGreaterThan(0);
    // The top recommendation should be breathing
    const topRec = result[0];
    expect(topRec.categoryId).toBe(CATEGORY_ID.BREATHING);
    expect(topRec.reason).toBe('Breathe to ease your anxious mind');
  });

  it('recommends a CBT lesson when mood note indicates low motivation', () => {
    const moodHistory: Mood[] = [
      {
        id: 'm2',
        rating: 2,
        note: 'low motivation today, hard to start doing anything',
        timestamp: new Date(),
      },
    ];

    const inputs = makeTestInputs(moodHistory);
    const result = getTodaysRecommendations(inputs);

    expect(result.length).toBeGreaterThan(0);
    const topRec = result[0];
    expect(topRec.categoryId).toBe(CATEGORY_ID.CBT);
    expect(topRec.reason).toBe('A short lesson to boost your motivation');
  });

  it('recommends meditation when mood note indicates calm', () => {
    const moodHistory: Mood[] = [
      {
        id: 'm3',
        rating: 4,
        note: 'feeling very calm and peaceful after reading a book',
        timestamp: new Date(),
      },
    ];

    const inputs = makeTestInputs(moodHistory);
    const result = getTodaysRecommendations(inputs);

    expect(result.length).toBeGreaterThan(0);
    const topRec = result[0];
    expect(topRec.categoryId).toBe(CATEGORY_ID.MEDITATION);
    expect(topRec.reason).toBe('Deepen your calm with a meditation session');
  });

  it('correctly uses structured label if present', () => {
    const moodHistory: Mood[] = [
      {
        id: 'm4',
        rating: 3,
        note: 'Nothing special',
        timestamp: new Date(),
        label: 'anxious',
      },
    ];

    const inputs = makeTestInputs(moodHistory);
    const result = getTodaysRecommendations(inputs);

    expect(result.length).toBeGreaterThan(0);
    const topRec = result[0];
    expect(topRec.categoryId).toBe(CATEGORY_ID.BREATHING);
    expect(topRec.reason).toBe('Breathe to ease your anxious mind');
  });

  it('falls back to rating-based recommendation when no keywords match', () => {
    const moodHistory: Mood[] = [
      {
        id: 'm5',
        rating: 1, // Distressed rating
        note: 'feeling bad',
        timestamp: new Date(),
      },
    ];

    const inputs = makeTestInputs(moodHistory);
    const result = getTodaysRecommendations(inputs);

    expect(result.length).toBeGreaterThan(0);
    const topRec = result[0];
    expect(topRec.categoryId).toBe(CATEGORY_ID.BREATHING);
    expect(topRec.reason).toBe("Based on how you're feeling right now");
  });
});

describe('RecommendationEngine - Sprint 4.8 Personalization', () => {
  it('skips completed lessons to prioritize unfinished lessons in active program', () => {
    const moodHistory: Mood[] = [];
    const firstLessonId = DEFAULT_EXERCISES[0].lessonId;
    const inputs = makeTestInputs(moodHistory, {
      completedLessons: [firstLessonId],
      recentExercises: [],
      userProgress: {
        userId: 'test-user',
        totalExercisesCompleted: 1,
        streakDays: 4,
        lastActivityAt: new Date(),
        programProgress: {
          'wellness-basics': {
            programId: 'wellness-basics',
            completedLessonIds: [firstLessonId],
            completionPercent: 20,
            lastOpenedAt: new Date(),
            status: 'active',
            resumeTarget: null,
          },
        },
      },
    });

    const result = getTodaysRecommendations(inputs);
    // Should prioritize active program but omit the completed lesson
    for (const rec of result) {
      const exercise = DEFAULT_EXERCISES.find(ex => ex.id === rec.exerciseId);
      expect(exercise?.lessonId).not.toBe(firstLessonId);
    }
  });
});

