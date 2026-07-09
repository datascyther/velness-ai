export interface BreathingContent {
  type: 'breathing';
  pattern: {
    inhale: number;
    hold: number;
    exhale: number;
    pause?: number;
  };
  instructions: string[];
}

export interface MeditationContent {
  type: 'meditation';
  audioGuided: boolean;
  instructions: string[];
}

export interface CBTContent {
  type: 'cbt';
  framework: string;
  prompts: string[];
}

export interface JournalContent {
  type: 'journal';
  prompts: string[];
}

export interface GroundingContent {
  type: 'grounding';
  sensoryPrompts: string[];
  instructions: string[];
}

export interface ReflectionContent {
  type: 'reflection';
  guidingQuestions: string[];
}

export interface QuizContent {
  type: 'quiz';
  questions: {
    id: string;
    prompt: string;
    options: string[];
    correctIndex: number;
  }[];
}

export interface ChecklistContent {
  type: 'checklist';
  items: {
    id: string;
    label: string;
  }[];
}

export interface AudioContent {
  type: 'audio';
  trackId: string;
  duration: number;
}

export interface VideoContent {
  type: 'video';
  videoId: string;
  duration: number;
  captions: boolean;
}

export type ExerciseContent =
  | BreathingContent
  | MeditationContent
  | CBTContent
  | JournalContent
  | GroundingContent
  | ReflectionContent
  | QuizContent
  | ChecklistContent
  | AudioContent
  | VideoContent;
