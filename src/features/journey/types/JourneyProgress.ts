/**
 * JourneyProgress — Legacy type for backward compatibility.
 *
 * This type is used by JourneyRepository, JourneyCache, useActiveJourney,
 * JourneyNavigationService, and JourneyScreen. Keep unchanged during Phase 2.
 *
 * New domain models live in src/features/journey/models/.
 * Migrate to ProgramProgress in Phase 3 when UI is refactored.
 */

export type JourneyStatus = 'not_started' | 'active' | 'completed';

export interface ResumeTarget {
  exerciseId: string;
  route: string;
}

export interface JourneyProgress {
  programId: string;
  title: string;
  currentLesson: number;
  totalLessons: number;
  completionPercent: number;
  lastActivity: Date | null;
  resumeTarget: ResumeTarget | null;
  status: JourneyStatus;
}
