export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  streakHistory: { date: Date; active: boolean }[];
}
