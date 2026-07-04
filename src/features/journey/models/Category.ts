import type { CategoryId } from '../constants';

export interface Category {
  id: CategoryId;
  title: string;
  description: string;
  iconType: 'brain' | 'wind' | 'sparkles' | 'leaf';
  accentColor: string;
  exerciseCount: number;
  sortOrder: number;
}
