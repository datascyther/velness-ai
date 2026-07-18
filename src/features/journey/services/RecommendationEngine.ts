import type { UserProgress } from '../models/Progress';
import type { Category } from '../models/Category';
import type { Exercise } from '../models/Exercise';
import type { Recommendation } from '../models/Recommendation';
import type { Mood } from '@/shared/types';
import { CATEGORY_ID, type CategoryId, type ExerciseType } from '../constants';
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
  const { moodHistory, completedLessons } = inputs;
  const now = new Date();
  const currentHour = now.getHours();

  // Sort mood history to get latest first
  const latestMood = moodHistory.length > 0 
    ? [...moodHistory].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0] 
    : null;

  // Extract labels and notes
  const moodLabel = latestMood?.label?.toLowerCase() || '';
  const moodNote = latestMood?.note?.toLowerCase() || '';
  const moodRating = latestMood?.rating ?? 3;

  const isAnxious = moodLabel.includes('anxi') || moodNote.includes('anxi') || moodNote.includes('presentation') || moodNote.includes('worried');
  const isLowMotivation = moodLabel.includes('motivation') || moodNote.includes('motivation') || moodNote.includes('start');
  const isCalm = moodLabel.includes('calm') || moodNote.includes('calm') || moodNote.includes('peaceful');

  let exerciseId = 'box-breathing-l1-ex1';
  let title = '3-Minute Breathing';
  let description = 'Start your morning with a quick, grounding breathing space.';
  let categoryId: CategoryId = CATEGORY_ID.BREATHING;
  let exerciseType: ExerciseType = 'breathing';
  let durationMinutes = 3;
  let reason = 'Morning routine recommendation';

  // 1. Mood Check-In overrides
  if (isAnxious) {
    exerciseId = 'box-breathing-l1-ex1';
    title = 'Box Breathing';
    description = 'Breathe to ease your anxious mind and restore calm.';
    categoryId = CATEGORY_ID.BREATHING;
    exerciseType = 'breathing';
    durationMinutes = 5;
    reason = 'Breathe to ease your anxious mind';
  } else if (isLowMotivation) {
    exerciseId = 'cbt-foundations-l1-ex1';
    title = 'Boost Motivation';
    description = 'Understand your thought loops and take control of your day.';
    categoryId = CATEGORY_ID.CBT;
    exerciseType = 'journaling';
    durationMinutes = 8;
    reason = 'A short lesson to boost your motivation';
  } else if (isCalm) {
    exerciseId = 'better-sleep-l1-ex1';
    title = 'Deep Calm Meditation';
    description = 'Deepen your calm with a meditation session.';
    categoryId = CATEGORY_ID.MEDITATION;
    exerciseType = 'meditation';
    durationMinutes = 15;
    reason = 'Deepen your calm with a meditation session';
  } else if (moodRating <= 2) {
    exerciseId = 'box-breathing-l1-ex1';
    title = 'Grounding Space';
    description = 'A quick way to center yourself and ease distress.';
    categoryId = CATEGORY_ID.BREATHING;
    exerciseType = 'breathing';
    durationMinutes = 5;
    reason = "Based on how you're feeling right now";
  }
  // 2. Time of Day default decider
  else {
    // Morning (5:00 AM - 11:59 AM)
    if (currentHour >= 5 && currentHour < 12) {
      exerciseId = 'box-breathing-l1-ex1';
      title = '3-Minute Breathing';
      description = 'Start your morning with a quick, grounding breathing space.';
      categoryId = CATEGORY_ID.BREATHING;
      exerciseType = 'breathing';
      durationMinutes = 3;
      reason = 'Morning routine recommendation';
    }
    // Night (8:00 PM - 4:59 AM)
    else if (currentHour >= 20 || currentHour < 5) {
      exerciseId = 'better-sleep-l1-ex1';
      title = 'Sleep Meditation';
      description = 'Release physical tension and prepare your mind for deep rest.';
      categoryId = CATEGORY_ID.MEDITATION;
      exerciseType = 'meditation';
      durationMinutes = 15;
      reason = 'Wind down for the night';
    }
    // Afternoon (12:00 PM - 7:59 PM)
    else {
      exerciseId = 'cbt-foundations-l4-ex1';
      title = 'CBT Reframing';
      description = 'Take a moment to step out of active stress and reframe your thoughts.';
      categoryId = CATEGORY_ID.CBT;
      exerciseType = 'journaling';
      durationMinutes = 8;
      reason = 'Afternoon stress reduction';
    }
  }

  // Ensure we don't recommend a completed lesson/exercise
  const lessonId = exerciseId.substring(0, exerciseId.lastIndexOf('-ex1') === -1 ? exerciseId.length : exerciseId.lastIndexOf('-ex1'));
  if (completedLessons && (completedLessons.includes(lessonId) || completedLessons.includes(exerciseId))) {
    if (categoryId === CATEGORY_ID.BREATHING) {
      exerciseId = 'box-breathing-l2-ex1';
      title = 'Deepening the Box';
      durationMinutes = 5;
    } else if (categoryId === CATEGORY_ID.MEDITATION) {
      exerciseId = 'better-sleep-l2-ex1';
      title = 'Deep Rest Meditation';
      durationMinutes = 15;
    } else {
      exerciseId = 'cbt-foundations-l2-ex1';
      title = 'Spotting Thinking Traps';
      durationMinutes = 8;
    }
  }

  return [{
    id: `rec-today-${exerciseId}-${Date.now()}`,
    exerciseId,
    title,
    description,
    categoryId,
    exerciseType,
    durationMinutes,
    reason,
  }];
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
