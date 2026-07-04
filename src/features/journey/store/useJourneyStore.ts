import { create } from 'zustand';
import type { Category } from '../models/Category';
import type { Recommendation } from '../models/Recommendation';
import type { ProgramProgress, UserProgress } from '../models/Progress';

interface JourneyStoreState {
  currentProgramId: string | null;
  currentLessonId: string | null;
  todaysRecommendation: Recommendation | null;
  categories: Category[];
  journeyProgress: ProgramProgress | null;
  userProgress: UserProgress | null;

  setCurrentProgram: (id: string | null) => void;
  setCurrentLesson: (id: string | null) => void;
  setTodaysRecommendation: (rec: Recommendation | null) => void;
  setCategories: (cats: Category[]) => void;
  setJourneyProgress: (progress: ProgramProgress | null) => void;
  setUserProgress: (progress: UserProgress | null) => void;
  reset: () => void;
}

const initialState = {
  currentProgramId: null,
  currentLessonId: null,
  todaysRecommendation: null,
  categories: [],
  journeyProgress: null,
  userProgress: null,
};

export const useJourneyStore = create<JourneyStoreState>((set) => ({
  ...initialState,

  setCurrentProgram: (currentProgramId) => set({ currentProgramId }),
  setCurrentLesson: (currentLessonId) => set({ currentLessonId }),
  setTodaysRecommendation: (todaysRecommendation) => set({ todaysRecommendation }),
  setCategories: (categories) => set({ categories }),
  setJourneyProgress: (journeyProgress) => set({ journeyProgress }),
  setUserProgress: (userProgress) => set({ userProgress }),
  reset: () => set(initialState),
}));

export default useJourneyStore;
