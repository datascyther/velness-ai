import { createServiceRoleClient } from 'backend/client';
import { DEFAULT_PROGRAMS, DEFAULT_LESSONS } from '@/features/journey/data/programs';
import { DEFAULT_EXERCISES } from '@/features/journey/data/exercises';
import { logger } from '@/services/logging';
import { slugToUUID } from '../utils/uuidMapping';

const SEEDED_FLAG_KEY = 'velness_journey_seeded_sprint4_v2';

let seedingInProgress = false;

async function hasBeenSeeded(): Promise<boolean> {
  const storage = await import('@/services/storage').then((m) => m.storageService);
  const flag = await storage.get(SEEDED_FLAG_KEY);
  if (flag === 'true') return true;
  return false;
}

async function markSeeded(): Promise<void> {
  const storage = await import('@/services/storage').then((m) => m.storageService);
  await storage.set(SEEDED_FLAG_KEY, 'true');
}

export async function ensureSeeded(): Promise<boolean> {
  if (seedingInProgress) return false;
  if (typeof createServiceRoleClient !== 'function') return false;

  try {
    const seeded = await hasBeenSeeded();
    if (seeded) return true;

    seedingInProgress = true;

    const admin = createServiceRoleClient();

    // Ensure default profile and journey exist so that program seeding succeeds.
    const defaultUserId = '00000000-0000-0000-0000-000000000000';
    const defaultJourneyId = slugToUUID('default')!;

    const { data: profile } = await admin
      .from('profiles')
      .select('id')
      .eq('id', defaultUserId)
      .maybeSingle();

    if (!profile) {
      const { error: profileErr } = await admin.from('profiles').insert({
        id: defaultUserId,
        email: 'system@velness.app',
        full_name: 'System User',
      } as any);
      if (profileErr) throw profileErr;
    }

    const { data: journey } = await admin
      .from('journeys')
      .select('id')
      .eq('id', defaultJourneyId)
      .maybeSingle();

    if (!journey) {
      const { error: journeyErr } = await admin.from('journeys').insert({
        id: defaultJourneyId,
        user_id: defaultUserId,
        title: 'Default Journey',
        status: 'active',
      } as any);
      if (journeyErr) throw journeyErr;
    }

    for (const program of DEFAULT_PROGRAMS) {
      const { error: progErr } = await admin
        .from('programs')
        .upsert({
          id: slugToUUID(program.id),
          title: program.title,
          description: program.description,
          position: program.sortOrder,
          journey_id: defaultJourneyId,
          status: 'active',
        } as any, { onConflict: 'id' });
      if (progErr) throw progErr;

      const programLessons = DEFAULT_LESSONS.filter((l) => l.programId === program.id);
      for (const lesson of programLessons) {
        const { error: lessonErr } = await admin
          .from('lessons')
          .upsert({
            id: slugToUUID(lesson.id),
            program_id: slugToUUID(lesson.programId),
            title: lesson.title,
            description: lesson.description,
            position: lesson.order,
            duration: lesson.duration,
          } as any, { onConflict: 'id' });
        if (lessonErr) throw lessonErr;
      }
    }

    for (const exercise of DEFAULT_EXERCISES) {
      const { error: exErr } = await admin
        .from('exercises')
        .upsert({
          id: slugToUUID(exercise.id),
          lesson_id: slugToUUID(exercise.lessonId),
          title: exercise.title,
          description: exercise.description,
          duration: exercise.estimatedTime,
          type: exercise.type as any,
          position: exercise.sortOrder,
          content: (exercise.content ?? {}) as any,
        } as any, { onConflict: 'id' });
      if (exErr) throw exErr;
    }

    await markSeeded();

    logger.info('journey', 'Seed data written to Supabase', {
      programs: DEFAULT_PROGRAMS.length,
      lessons: DEFAULT_LESSONS.length,
      exercises: DEFAULT_EXERCISES.length,
    });

    return true;
  } catch (error) {
    logger.error('journey', 'Failed to seed Supabase', { error: String(error) });
    return false;
  } finally {
    seedingInProgress = false;
  }
}

export async function resetSeededFlag(): Promise<void> {
  const storage = await import('@/services/storage').then((m) => m.storageService);
  await storage.delete(SEEDED_FLAG_KEY);
}
