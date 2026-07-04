import type { Mood } from '@/shared/types';
import type { UserProgress, ProgramProgress } from '@/features/journey/models/Progress';
import type { Exercise, ExerciseWithProgress } from '@/features/journey/models/Exercise';
import type { Streak } from '@/features/journey/models/Streak';
import type { UserPreferences } from '@/shared/types';

export interface PersonalizationInputs {
  userId: string;
  userName: string;
  moodHistory: Mood[];
  userProgress: UserProgress;
  programProgress: Record<string, ProgramProgress>;
  streak: Streak;
  preferences: UserPreferences;
  recentExercises: ExerciseWithProgress[];
  allExercises: Exercise[];
  chatSummary?: string;
  recentTopics?: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface AIRecommendation {
  id: string;
  exerciseId: string;
  title: string;
  description: string;
  reason: string;
  durationMinutes: number;
  confidence: number;
  source: 'ai' | 'rule';
}

export interface PersonalizationOutput {
  todaysRecommendation: AIRecommendation | null;
  continueJourney: {
    programId: string;
    lessonId: string | null;
    exerciseId: string | null;
    progress: number;
  } | null;
  suggestedExercise: AIRecommendation | null;
  personalReflection: {
    prompt: string;
    context: string;
  } | null;
}
