import { DEFAULT_PROGRAMS, DEFAULT_LESSONS } from '../data/programs';
import { DEFAULT_EXERCISES } from '../data/exercises';

// A helper to generate a deterministic UUID from any string.
export function deterministicUUID(str: string): string {
  if (!str) return '00000000-0000-0000-0000-000000000000';
  // If it's already a valid UUID, return it
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str.toLowerCase();

  let h1 = 0x811c9dc5;
  let h2 = 0xcbf29ce4;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ char, 0x01000193);
    h2 = Math.imul(h2 ^ char, 0x01000193);
  }
  let h3 = h1 ^ 0x5a5a5a5a;
  let h4 = h2 ^ 0xa5a5a5a5;
  for (let i = str.length - 1; i >= 0; i--) {
    const char = str.charCodeAt(i);
    h3 = Math.imul(h3 ^ char, 0x01000193);
    h4 = Math.imul(h4 ^ char, 0x01000193);
  }
  const hex = (val: number) => (val >>> 0).toString(16).padStart(8, '0');
  const hex32 = hex(h1) + hex(h2) + hex(h3) + hex(h4);
  return [
    hex32.substring(0, 8),
    hex32.substring(8, 12),
    '4' + hex32.substring(13, 16),
    '8' + hex32.substring(17, 20),
    hex32.substring(20, 32)
  ].join('-');
}

const slugToUUIDMap = new Map<string, string>();
const uuidToSlugMap = new Map<string, string>();

export function slugToUUID(slug: string | null | undefined): string | null {
  if (!slug) return null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(slug)) return slug.toLowerCase();
  
  if (slugToUUIDMap.has(slug)) {
    return slugToUUIDMap.get(slug)!;
  }
  const uuid = deterministicUUID(slug);
  slugToUUIDMap.set(slug, uuid);
  uuidToSlugMap.set(uuid, slug);
  return uuid;
}

export function uuidToSlug(uuid: string | null | undefined): string | null {
  if (!uuid) return null;
  const lower = uuid.toLowerCase();
  if (uuidToSlugMap.has(lower)) {
    return uuidToSlugMap.get(lower)!;
  }
  return uuid;
}

export function initializeMapping() {
  for (const prog of DEFAULT_PROGRAMS || []) {
    slugToUUID(prog.id);
  }
  for (const les of DEFAULT_LESSONS || []) {
    slugToUUID(les.id);
  }
  for (const ex of DEFAULT_EXERCISES || []) {
    slugToUUID(ex.id);
  }
  slugToUUID('default');
}

// Automatically initialize maps
initializeMapping();
