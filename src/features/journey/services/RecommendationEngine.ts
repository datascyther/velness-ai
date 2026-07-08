import type { UserProgress } from '../models/Progress';
import type { Category } from '../models/Category';
import type { Exercise } from '../models/Exercise';
import type { Recommendation } from '../models/Recommendation';
import type { Mood } from '@/shared/types';
import { CATEGORY_ID } from '../constants';
import { DEFAULT_LESSONS, DEFAULT_PROGRAMS } from '../data/programs';

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
  'low motivation': CATEGORY_ID.CBT,
  calm: CATEGORY_ID.MEDITATION,
};

const REASONS: Record<string, string> = {
  mood_match: 'Based on how you\'re feeling right now',
  mood_anxious: 'Breathe to ease your anxious mind',
  mood_low_motivation: 'A short lesson to boost your motivation',
  mood_calm: 'Deepen your calm with a meditation session',
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

  // 1. Check structured label first
  if (latest.label) {
    const normalizedLabel = latest.label.toLowerCase().trim();
    if (normalizedLabel === 'anxious' || normalizedLabel === 'anxiety') {
      return 'anxious';
    }
    if (normalizedLabel === 'low motivation' || normalizedLabel === 'unmotivated' || normalizedLabel === 'motivation') {
      return 'low motivation';
    }
    if (normalizedLabel === 'calm' || normalizedLabel === 'calmness') {
      return 'calm';
    }
    if (MOOD_CATEGORY_MAP[normalizedLabel]) {
      return normalizedLabel;
    }
  }

  // 2. Check note keywords
  if (latest.note) {
    const noteLower = latest.note.toLowerCase();
    
    if (
      noteLower.includes('anxious') ||
      noteLower.includes('anxiety') ||
      noteLower.includes('panic') ||
      noteLower.includes('nervous') ||
      noteLower.includes('worried') ||
      noteLower.includes('scared') ||
      noteLower.includes('fear')
    ) {
      return 'anxious';
    }

    if (
      noteLower.includes('low motivation') ||
      noteLower.includes('unmotivated') ||
      noteLower.includes('no motivation') ||
      noteLower.includes('lazy') ||
      noteLower.includes('procrastinating') ||
      noteLower.includes('hard to start') ||
      noteLower.includes('cannot focus')
    ) {
      return 'low motivation';
    }

    if (
      noteLower.includes('calm') ||
      noteLower.includes('peaceful') ||
      noteLower.includes('relaxed') ||
      noteLower.includes('serene') ||
      noteLower.includes('mindful') ||
      noteLower.includes('tranquil')
    ) {
      return 'calm';
    }
  }

  // 3. Fallback to rating
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

  // ─── Phase 6.4 Rule 1: High anxiety moods ───────────────────────────
  const latestMood = moodHistory.length > 0 ? [...moodHistory].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0] : null;
  const isAnxious = latestMood && (
    (latestMood.label && (latestMood.label.toLowerCase().includes('anxious') || latestMood.label.toLowerCase().includes('anxiety'))) ||
    (latestMood.note && (latestMood.note.toLowerCase().includes('anxious') || latestMood.note.toLowerCase().includes('anxiety'))) ||
    latestMood.rating <= 2
  );

  if (isAnxious) {
    const boxBreathing = allExercises.find((ex) => ex.id === 'box-breathing-l1');
    if (boxBreathing) {
      const cat = categories.find((c) => c.id === CATEGORY_ID.BREATHING) || categories[0];
      return [{
        id: `rec-anxiety-${boxBreathing.id}-${Date.now()}`,
        exerciseId: boxBreathing.id,
        title: 'Box Breathing',
        description: 'Breathe to ease your anxious mind and restore calm.',
        categoryId: cat.id,
        exerciseType: boxBreathing.type,
        durationMinutes: boxBreathing.estimatedTime,
        reason: 'Recommended for anxiety relief',
      }];
    }
  }

  // ─── Phase 6.4 Rule 2: Completed "Building Confidence" program ────────
  const confidenceProg = userProgress.programProgress['building-confidence'];
  if (confidenceProg && confidenceProg.status === 'completed') {
    // Recommend "Understanding Thoughts"
    const nextProgramEx = allExercises.find((ex) => {
      const l = DEFAULT_LESSONS.find((les) => les.id === ex.lessonId);
      return l && l.programId === 'understanding-thoughts';
    });
    if (nextProgramEx) {
      const cat = categories.find((c) => c.id === CATEGORY_ID.CBT) || categories[0];
      return [{
        id: `rec-confidence-comp-${nextProgramEx.id}-${Date.now()}`,
        exerciseId: nextProgramEx.id,
        title: nextProgramEx.title,
        description: 'Build on your confidence with Understanding Thoughts.',
        categoryId: cat.id,
        exerciseType: nextProgramEx.type,
        durationMinutes: nextProgramEx.estimatedTime,
        reason: 'Recommended after completing Building Confidence',
      }];
    }
  }

  // ─── Phase 6.4 Rule 3: Multiple unfinished CBT lessons ─────────────
  const activeCbtPrograms = Object.values(userProgress.programProgress).filter((prog) => {
    const defaultP = DEFAULT_PROGRAMS.find((p) => p.id === prog.programId);
    return defaultP && defaultP.categoryId === CATEGORY_ID.CBT && prog.status === 'active';
  });

  if (activeCbtPrograms.length > 1) {
    // Recommend Continuing Current Program
    const sorted = [...activeCbtPrograms].sort((a, b) => {
      const timeA = a.lastOpenedAt ? new Date(a.lastOpenedAt).getTime() : 0;
      const timeB = b.lastOpenedAt ? new Date(b.lastOpenedAt).getTime() : 0;
      return timeB - timeA;
    });
    const latestActive = sorted[0];
    const resumeEx = allExercises.find((ex) => {
      const l = DEFAULT_LESSONS.find((les) => les.id === ex.lessonId);
      return l && l.programId === latestActive.programId && !completedIds.has(l.id);
    });
    if (resumeEx) {
      const cat = categories.find((c) => c.id === CATEGORY_ID.CBT) || categories[0];
      return [{
        id: `rec-continue-cbt-${resumeEx.id}-${Date.now()}`,
        exerciseId: resumeEx.id,
        title: resumeEx.title,
        description: 'Pick up exactly where you left off in your CBT program.',
        categoryId: cat.id,
        exerciseType: resumeEx.type,
        durationMinutes: resumeEx.estimatedTime,
        reason: 'Continue Current Program',
      }];
    }
  }

  // ─── Default scoring/variety matching ──────────────────────────────
  const moodCategory = getLatestMoodCategory(moodHistory);
  if (moodCategory && MOOD_CATEGORY_MAP[moodCategory]) {
    const targetCategory = MOOD_CATEGORY_MAP[moodCategory];
    const matching = findCategoryExercises(targetCategory, categories, allExercises);
    
    let reason = REASONS.mood_match;
    if (moodCategory === 'anxious') {
      reason = REASONS.mood_anxious;
    } else if (moodCategory === 'low motivation') {
      reason = REASONS.mood_low_motivation;
    } else if (moodCategory === 'calm') {
      reason = REASONS.mood_calm;
    }

    for (const { exercise, category } of matching) {
      const isCompleted = completedIds.has(exercise.lessonId);
      const score = isCompleted ? 90 : 100;
      candidates.push({ exercise, category, score, reason });
    }
  }

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
          if (completedIds.has(exercise.lessonId)) continue;
          candidates.push({ exercise, category: cat, score: 80, reason: REASONS.continue_program });
        }
      }
    }
  }

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
        if (completedIds.has(exercise.lessonId)) continue;
        if (candidates.some((c) => c.exercise.id === exercise.id)) continue;
        candidates.push({ exercise, category, score: 60, reason: REASONS.least_practiced });
      }
    }
  }

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

  const seen = new Set<string>();
  const deduped: ScoredCandidate[] = [];

  for (const c of candidates.sort((a, b) => b.score - a.score)) {
    if (seen.has(c.exercise.id)) continue;
    seen.add(c.exercise.id);
    deduped.push(c);
  }

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
    const lesson = DEFAULT_LESSONS.find((l) => l.id === ex.lessonId);
    if (!lesson) continue;
    const program = DEFAULT_PROGRAMS.find((p) => p.id === lesson.programId);
    if (!program) continue;
    if (program.categoryId === categoryId) {
      result.push({ exercise: ex, category });
    }
  }

  return result;
}
