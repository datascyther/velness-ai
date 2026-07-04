import { getDocs, setDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { programsRef, programLessonsRef, exercisesRef } from '@/lib/firestore';
import { DEFAULT_PROGRAMS, DEFAULT_LESSONS } from '@/features/journey/data/programs';
import { DEFAULT_EXERCISES } from '@/features/journey/data/exercises';
import { programToDoc, lessonToDoc, exerciseToDoc } from '@/features/journey/models/dto';
import { logger } from '@/services/logging';

const SEEDED_FLAG_KEY = 'neeva_journey_seeded_v1';

let seedingInProgress = false;

async function hasBeenSeeded(): Promise<boolean> {
  const storage = await import('@/services/storage').then((m) => m.storageService);
  const flag = await storage.get(SEEDED_FLAG_KEY);
  return flag === 'true';
}

async function markSeeded(): Promise<void> {
  const storage = await import('@/services/storage').then((m) => m.storageService);
  await storage.set(SEEDED_FLAG_KEY, 'true');
}

async function isCollectionEmpty(ref: ReturnType<typeof programsRef>): Promise<boolean> {
  if (!ref) return true;
  const snapshot = await getDocs(ref);
  return snapshot.empty;
}

export async function ensureSeeded(): Promise<boolean> {
  if (seedingInProgress) return false;
  if (!db) return false;

  try {
    const seeded = await hasBeenSeeded();
    if (seeded) return true;

    seedingInProgress = true;

    const programsEmpty = await isCollectionEmpty(programsRef());
    if (!programsEmpty) {
      await markSeeded();
      logger.info('journey', 'Seed skipped — programs already exist in Firestore');
      return true;
    }

    const batch = writeBatch(db);

    for (const program of DEFAULT_PROGRAMS) {
      const programRef = doc(db, 'programs', program.id);
      batch.set(programRef, programToDoc(program));

      const programLessons = DEFAULT_LESSONS.filter((l) => l.programId === program.id);
      for (const lesson of programLessons) {
        const lessonRef = doc(db, 'programs', program.id, 'lessons', lesson.id);
        batch.set(lessonRef, lessonToDoc(lesson));
      }
    }

    const existingExerciseIds = new Set<string>();
    if (!(await isCollectionEmpty(exercisesRef()))) {
      const snap = await getDocs(exercisesRef()!);
      snap.forEach((d) => existingExerciseIds.add(d.id));
    }

    for (const exercise of DEFAULT_EXERCISES) {
      if (existingExerciseIds.has(exercise.id)) continue;
      const exerciseRef = doc(db, 'exercises', exercise.id);
      batch.set(exerciseRef, exerciseToDoc(exercise));
    }

    await batch.commit();
    await markSeeded();

    logger.info('journey', 'Seed data written to Firestore', {
      programs: DEFAULT_PROGRAMS.length,
      lessons: DEFAULT_LESSONS.length,
      exercises: DEFAULT_EXERCISES.length,
    });

    return true;
  } catch (error) {
    logger.error('journey', 'Failed to seed Firestore', { error: String(error) });
    return false;
  } finally {
    seedingInProgress = false;
  }
}

export async function resetSeededFlag(): Promise<void> {
  const storage = await import('@/services/storage').then((m) => m.storageService);
  await storage.delete(SEEDED_FLAG_KEY);
}
