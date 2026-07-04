export interface Lesson {
  id: string;
  programId: string;
  title: string;
  description: string;
  order: number;
  duration: number;
  exerciseIds: string[];
}
