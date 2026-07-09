import { moodRepository as backendMoodRepo } from '../../backend/repositories/MoodRepository';
import { NotAuthenticatedError } from '../../backend/repositories/baseRepository';
import { storageService } from '@/services/storage';
import type { Mood } from '@/shared/types';

const COLLECTION = 'users';

function getLocalKey(uid: string): string {
  return `moods_${uid}`;
}

export class MoodRepository {
  async loadMoods(uid: string): Promise<Mood[]> {
    if (!uid) return [];

    const local = await this.loadFromLocal(uid);
    if (local.length > 0) return local;

    const fromCloud = await this.loadFromCloud();
    if (fromCloud.length > 0) {
      await this.persistMoods(uid, fromCloud);
    }
    return fromCloud;
  }

  async saveMood(uid: string, entry: Mood): Promise<void> {
    if (!uid) return;

    await this.persistMoods(uid, [entry]);
    await this.syncToCloud(uid, entry);
  }

  async syncToCloud(uid: string, entry: Mood): Promise<void> {
    if (!uid) return;
    try {
      await backendMoodRepo.create({
        rating: entry.rating,
        note: entry.note,
        recorded_at: entry.timestamp.toISOString(),
        ...(entry.label !== undefined ? { label: entry.label } : {}),
      });
    } catch (error) {
      if (error instanceof NotAuthenticatedError) return;
      console.error('Error syncing mood to cloud:', error);
      throw error;
    }
  }

  async syncFromCloud(uid: string): Promise<Mood[]> {
    if (!uid) return [];
    const cloudData = await this.loadFromCloud();
    if (cloudData.length > 0) {
      await this.persistMoods(uid, cloudData);
    }
    return this.loadFromLocal(uid);
  }

  async persistMoods(uid: string, entries: Mood[]): Promise<void> {
    if (!uid || entries.length === 0) return;
    try {
      const key = getLocalKey(uid);
      const existing = await storageService.getJSON<Mood[]>(key) || [];
      const merged = [...existing];
      for (const entry of entries) {
        const idx = merged.findIndex((m) => m.id === entry.id);
        if (idx >= 0) {
          merged[idx] = entry;
        } else {
          merged.push(entry);
        }
      }
      await storageService.setJSON(key, merged);
    } catch (error) {
      console.error('Error persisting moods locally:', error);
    }
  }

  private async loadFromLocal(uid: string): Promise<Mood[]> {
    try {
      const local = await storageService.getJSON<Mood[]>(getLocalKey(uid));
      return local || [];
    } catch {
      return [];
    }
  }

  private async loadFromCloud(): Promise<Mood[]> {
    try {
      const rows = await backendMoodRepo.list();
      return rows.map((row) => ({
        id: row.id,
        rating: row.rating as Mood['rating'],
        note: row.note || '',
        timestamp: new Date(row.recorded_at),
        ...(row.label ? { label: row.label } : {}),
      }));
    } catch (error) {
      console.error('Error loading moods from cloud:', error);
      return [];
    }
  }
}

export const moodRepository = new MoodRepository();
export default moodRepository;
