import type { PersonalizationInputs, AIRecommendation } from './types';

export function buildPersonalizationSystemPrompt(): string {
  return `You are a wellness recommendation engine. Your job is to analyze user data and recommend the single best exercise for them right now.

CRITICAL: Return ONLY valid JSON. No markdown, no explanation, no code fences.

{
  "todaysRecommendation": {
    "exerciseId": "string",
    "title": "string",
    "reason": "string",
    "confidence": 0.0-1.0
  },
  "personalReflection": {
    "prompt": "string — a thoughtful reflection question",
    "context": "string — brief context explaining why this question"
  }
}

Rules:
1. Consider: mood state, program progress, streak, variety, time of day, preferences
2. todaysRecommendation.exerciseId MUST be one of the IDs from the AVAILABLE EXERCISES list
3. todaysRecommendation.reason should be 1-2 sentences explaining the recommendation
4. todaysRecommendation.confidence should reflect how confident you are (0.0-1.0)
5. personalReflection.prompt should be a single thoughtful question based on user context
6. personalReflection.context should briefly explain why this question fits
7. If you cannot make a recommendation, set todaysRecommendation to null
8. If you cannot generate a reflection, set personalReflection to null`;
}

function formatMoodTrend(moodHistory: PersonalizationInputs['moodHistory']): string {
  if (moodHistory.length === 0) return 'No mood data available';

  const sorted = [...moodHistory].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  );

  const recent = sorted.slice(0, 3).map((m) => m.rating);
  const previous = sorted.slice(3, 6).map((m) => m.rating);

  const avgRecent = recent.reduce((s, r) => s + r, 0) / recent.length;
  const avgPrevious =
    previous.length > 0
      ? previous.reduce((s, r) => s + r, 0) / previous.length
      : avgRecent;

  let trend = 'stable';
  if (avgRecent > avgPrevious + 0.5) trend = 'improving';
  else if (avgRecent < avgPrevious - 0.5) trend = 'declining';

  return `${trend} (last ${recent.length}: ${recent.join(',')} — previous ${previous.length || '0'}: ${previous.join(',') || 'N/A'})`;
}

export function buildPersonalizationContext(inputs: PersonalizationInputs): string {
  const lines: string[] = [];

  lines.push('USER CONTEXT:');
  lines.push(`Name: ${inputs.userName}`);
  lines.push(`Current mood trend: ${formatMoodTrend(inputs.moodHistory)}`);
  lines.push(`Streak: ${inputs.streak.currentStreak} days (longest: ${inputs.streak.longestStreak})`);

  const activePrograms = Object.values(inputs.programProgress).filter(
    (p) => p.status === 'active' || p.status === 'not_started',
  );
  if (activePrograms.length > 0) {
    for (const prog of activePrograms) {
      const lessonCount = prog.completedLessonIds.length;
      const programName = prog.programId.replace(/-/g, ' ');
      lines.push(
        `Active program: "${programName}" — ${prog.completionPercent}% complete (${lessonCount} lessons done)`,
      );
    }
  }

  const recentExNames = inputs.recentExercises
    .filter((ex) => ex.lastCompletedAt)
    .sort((a, b) => {
      if (!a.lastCompletedAt || !b.lastCompletedAt) return 0;
      return b.lastCompletedAt.getTime() - a.lastCompletedAt.getTime();
    })
    .slice(0, 5)
    .map((ex) => ex.title);

  if (recentExNames.length > 0) {
    lines.push(`Recent exercises: ${recentExNames.join(', ')}`);
  }

  lines.push(
    `Preferences: ${inputs.preferences.tone || 'auto'} tone, goals: ${inputs.preferences.language || 'en'}`,
  );
  lines.push(`Time: ${inputs.timeOfDay}`);

  if (inputs.chatSummary) {
    lines.push(`Chat summary: ${inputs.chatSummary}`);
  }
  if (inputs.recentTopics && inputs.recentTopics.length > 0) {
    lines.push(`Recent topics: ${inputs.recentTopics.join(', ')}`);
  }

  lines.push('');
  lines.push('AVAILABLE EXERCISES:');

  for (let i = 0; i < inputs.allExercises.length; i++) {
    const ex = inputs.allExercises[i];
    lines.push(
      `${i + 1}. "${ex.title}" — ${ex.type}, ${ex.estimatedTime}min — ${ex.description}`,
    );
  }

  return lines.join('\n');
}
