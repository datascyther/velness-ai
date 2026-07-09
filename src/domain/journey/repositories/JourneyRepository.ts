import type { Journey } from '../entities/Journey';

export interface JourneyRepository {
  get(userId: string): Promise<Journey | null>;
  update(journey: Journey): Promise<void>;
}
