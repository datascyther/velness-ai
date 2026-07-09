import type { RecommendationState } from '../enums';

export interface Recommendation {
  id: string;
  exerciseId: string;
  title: string;
  description: string;
  reason: string;
  status: RecommendationState;
}
