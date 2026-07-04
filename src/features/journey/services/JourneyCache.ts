import { storageService } from '@/services/storage';
import type { JourneyProgress } from '../types/JourneyProgress';

const CACHE_KEY = 'journey:active';
const CACHE_TTL = 24 * 60 * 60 * 1000;

export { CACHE_KEY, CACHE_TTL };

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

export class JourneyCache {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = CACHE_TTL;

  async get<T = JourneyProgress>(key?: string): Promise<T | null> {
    const cacheKey = key ?? CACHE_KEY;

    const mem = this.memoryCache.get(cacheKey);
    if (mem && Date.now() < mem.expiry) return mem.data as T;

    try {
      const entry = await storageService.getJSON<CacheEntry<T>>(cacheKey);
      if (!entry) return null;
      if (Date.now() > entry.expiry) {
        await this.clear(cacheKey);
        return null;
      }
      this.memoryCache.set(cacheKey, entry);
      return entry.data;
    } catch {
      return null;
    }
  }

  async set<T = JourneyProgress>(keyOrData: string | T, data?: T, ttl?: number): Promise<void> {
    let key: string;
    let dataValue: T;
    let expiryTtl: number;

    if (typeof keyOrData === 'string') {
      key = keyOrData;
      dataValue = data as T;
      expiryTtl = ttl ?? this.DEFAULT_TTL;
    } else {
      key = CACHE_KEY;
      dataValue = keyOrData;
      expiryTtl = this.DEFAULT_TTL;
    }

    const expiry = Date.now() + expiryTtl;
    const entry: CacheEntry<T> = { data: dataValue, expiry };
    this.memoryCache.set(key, entry);
    try {
      await storageService.setJSON(key, entry);
    } catch (error) {
      console.error(`Error caching ${key}:`, error);
    }
  }

  async clear(key?: string): Promise<void> {
    if (key) {
      this.memoryCache.delete(key);
      try {
        await storageService.delete(key);
      } catch {}
    } else {
      this.memoryCache.clear();
    }
  }
}

export const journeyCache = new JourneyCache();
export default journeyCache;
