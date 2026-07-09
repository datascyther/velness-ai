// src/features/home/utils/adaptiveContext.ts
//
// Pure helper — takes HomeScreenData and returns UI-ready context.
// No React imports. Fully testable.

import type { NarrativeMoment } from '@/features/home/services/HomeViewModel';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

export function getTimeEmoji(timeOfDay: TimeOfDay): string {
  const map: Record<TimeOfDay, string> = {
    morning: 'sunny',
    afternoon: 'sun',
    evening: 'moon',
    night: 'stars',
  };
  return map[timeOfDay];
}

/** Maps a NarrativeMoment to a background gradient pair for HeroCard */
export function getHeroGradient(moment: NarrativeMoment): [string, string, string] {
  const map: Record<NarrativeMoment, [string, string, string]> = {
    morning_fresh:     ['#1a1035', '#2d1f5e', '#3d2a6e'],
    afternoon_active:  ['#0d1a2e', '#1a2f50', '#1e3a5f'],
    evening_wind_down: ['#0f0f1e', '#1a1035', '#2a1545'],
    post_lesson:       ['#0d2010', '#0f2d1a', '#1a3d25'],
    missed_days:       ['#1a0f0f', '#2d1515', '#3d1f1f'],
    streak_active:     ['#1a0d00', '#2d1f00', '#3d2a00'],
    default:           ['#0B0B12', '#13111f', '#1a1535'],
  };
  return map[moment];
}

/** Derives a short progress label for the hero card */
export function buildStreakLabel(streak: number): string | null {
  if (streak === 0) return null;
  if (streak === 1) return 'Day 1 · Just getting started';
  if (streak < 7) return `Day ${streak} · Building the habit`;
  if (streak < 30) return `Day ${streak} · Strong momentum`;
  return `Day ${streak} · Remarkable dedication`;
}
