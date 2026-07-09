export type CompletionEntityType = 'exercise' | 'lesson' | 'program' | 'journey';

export interface Completion {
  id: string;
  entityType: CompletionEntityType;
  entityId: string;
  userId: string;
  completedAt: Date;
  metadata: Record<string, unknown>;
}
