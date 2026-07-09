export interface Achievement {
  id: string;
  title: string;
  description: string;
  requiredCount: number;
  achievedAt: Date | null;
}
