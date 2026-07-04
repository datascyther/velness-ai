import type { UserProgress } from '../models/Progress';
import type { Category } from '../models/Category';
import type { Exercise } from '../models/Exercise';
import type { Recommendation } from '../models/Recommendation';
import type { Mood } from '@/shared/types';
import { CATEGORY_ID } from '../constants';

export interface RecommendationInputs {
  userProgress: UserProgress;
  categories: Category[];
  allExercises: Exercise[];
  moodHistory: Mood[];
  recentExercises?: string[];
  completedLessons?: string[];
  preferences?: string[];
}

interface ScoredCandidate {
  exercise: Exercise;
  category: Category;
  score: number;
  reason: string;
}

const MOOD_CATEGORY_MAP: Record<string, string> = {
  distressed: CATEGORY_ID.BREATHING,
  anxious: CATEGORY_ID.BREATHING,
  sad: CATEGORY_ID.CBT,
  angry: CATEGORY_ID.MEDITATION,
  positive: CATEGORY_ID.WELLNESS,
};

const REASONS: Record<string, string> = {
  mood_match: 'Based on how you\'re feeling right now',
  continue_program: 'Continue your current program',
  variety: 'Try something different today',
  least_practiced: 'Give some attention to this area',
  streak_maintenance: 'Keep your streak going',
  default: 'Recommended for your well-being',
};

function getLatestMoodCategory(moodHistory: Mood[]): string | null {
  if (moodHistory.length === 0) return null;
  const sorted = [...moodHistory].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const latest = sorted[0];
  if (latest.rating <= 2) return 'distressed';
  if (latest.rating === 3) return 'neutral';
  if (latest.rating >= 4) return 'positive';
  return null;
}

export function getTodaysRecommendations(inputs: RecommendationInputs): Recommendation[] {
  const { userProgress, categories, allExercises, moodHistory, recentExercises, completedLessons } = inputs;
  const hasProgress = userProgress.totalExercisesCompleted > 0;

  const candidates: ScoredCandidate[] = [];
  const recentIds = new Set(recentExercises ?? []);
  const completedIds = new Set(completedLessons ?? []);

  // ─── Rule 1: Mood-based match ──────────────────────────────────────

  const moodCategory = getLatestMoodCategory(moodHistory);
  if (moodCategory && MOOD_CATEGORY_MAP[moodCategory]) {
    const targetCategory = MOOD_CATEGORY_MAP[moodCategory];
    const matching = findCategoryExercises(targetCategory, categories, allExercises);
    for (const { exercise, category } of matching) {
      candidates.push({ exercise, category, score: 100, reason: REASONS.mood_match });
    }
  }

  // ─── Rule 2: Continue active program ───────────────────────────────

  if (hasProgress) {
    const activePrograms = Object.values(userProgress.programProgress)
      .filter((p) => p.status === 'active')
      .sort((a, b) => b.completionPercent - a.completionPercent);

    for (const prog of activePrograms) {
      const programCategories = categories.filter((c) => c.id === prog.programId);
      for (const category of programCategories) {
        const catExercises = findCategoryExercises(category.id, categories, allExercises);
        for (const { exercise, category: cat } of catExercises) {
          if (recentIds.has(exercise.id)) continue;
          candidates.push({ exercise, category: cat, score: 80, reason: REASONS.continue_program });
        }
      }
    }
  }

  // ─── Rule 3: Least practiced category ──────────────────────────────

  if (hasProgress) {
    const categoryCount: Record<string, number> = {};
    for (const cat of categories) {
      categoryCount[cat.id] = 0;
    }
    for (const pp of Object.values(userProgress.programProgress)) {
      const count = pp.completedLessonIds.length;
      if (pp.programId === 'wellness-basics') {
        categoryCount[CATEGORY_ID.CBT] = (categoryCount[CATEGORY_ID.CBT] ?? 0) + count * 2;
      } else if (pp.programId === 'mindful-breathing') {
        categoryCount[CATEGORY_ID.BREATHING] = (categoryCount[CATEGORY_ID.BREATHING] ?? 0) + count;
      }
    }

    const sortedCats = [...categories]
      .filter((c) => c.id !== CATEGORY_ID.WELLNESS)
      .sort((a, b) => (categoryCount[a.id] ?? 0) - (categoryCount[b.id] ?? 0));

    const leastPracticed = sortedCats[0];
    if (leastPracticed) {
      const catExercises = findCategoryExercises(leastPracticed.id, categories, allExercises);
      for (const { exercise, category } of catExercises) {
        if (recentIds.has(exercise.id)) continue;
        if (candidates.some((c) => c.exercise.id === exercise.id)) continue;
        candidates.push({ exercise, category, score: 60, reason: REASONS.least_practiced });
      }
    }
  }

  // ─── Rule 4: Variety (when streak > 3) ────────────────────────────

  if (userProgress.streakDays > 3) {
    const usedCategories = new Set(candidates.map((c) => c.category.id));
    const variedCategories = categories.filter((c) => !usedCategories.has(c.id));

    for (const category of variedCategories) {
      const catExercises = findCategoryExercises(category.id, categories, allExercises);
      for (const { exercise, category: cat } of catExercises) {
        if (recentIds.has(exercise.id)) continue;
        candidates.push({ exercise, category: cat, score: 40, reason: REASONS.variety });
        break;
      }
    }
  }

  // ─── Sort by score descending, deduplicate ─────────────────────────

  const seen = new Set<string>();
  const deduped: ScoredCandidate[] = [];

  for (const c of candidates.sort((a, b) => b.score - a.score)) {
    if (seen.has(c.exercise.id)) continue;
    seen.add(c.exercise.id);
    deduped.push(c);
  }

  // ─── Convert to Recommendation model ───────────────────────────────

  return deduped.slice(0, 3).map((c, i) => ({
    id: `rec-${c.exercise.id}-${Date.now()}`,
    exerciseId: c.exercise.id,
    title: c.exercise.title,
    description: c.exercise.description,
    categoryId: c.category.id,
    exerciseType: c.exercise.type,
    durationMinutes: c.exercise.estimatedTime,
    reason: c.reason,
  }));
}

function findCategoryExercises(
  categoryId: string,
  categories: Category[],
  allExercises: Exercise[],
): { exercise: Exercise; category: Category }[] {
  const category = categories.find((c) => c.id === categoryId);
  if (!category) return [];

  const result: { exercise: Exercise; category: Category }[] = [];
  for (const ex of allExercises) {
    result.push({ exercise: ex, category });
  }

  return result;
}
