import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Shared Supabase client for the Velness backend layer.
 *
 * RULE (Sprint S0.5): the Supabase client and all raw queries live ONLY in the
 * repository layer (backend/repositories). UI/features must never call Supabase
 * directly — they go through repositories.
 *
 * The anon key is safe client-side (RLS enforces per-user access). The
 * service-role client is SERVER-ONLY and must never be bundled into the app.
 */

function readEnv(...keys: string[]): string {
  for (const k of keys) {
    const v = process.env[k];
    if (typeof v === 'string' && v.length > 0) return v;
  }
  return '';
}

/**
 * React Native session persistence. In an RN/Expo bundle, Supabase Auth needs
 * an AsyncStorage-backed store; in the browser it uses `localStorage`, and in
 * Node (tests) an in-memory store is used by default. We only load
 * AsyncStorage when actually running in React Native, so web/Node builds are
 * untouched.
 */
function resolveRNStorage(): { getItem: (k: string) => Promise<string | null>; setItem: (k: string, v: string) => Promise<void>; removeItem: (k: string) => Promise<void> } | undefined {
  if (typeof navigator === 'undefined' || navigator.product !== 'ReactNative') {
    return undefined;
  }
  try {
    const req = (globalThis as { require?: (id: string) => unknown }).require;
    const mod = (req?.('@react-native-async-storage/async-storage') ?? {}) as {
      default?: unknown;
      AsyncStorage?: unknown;
    };
    return (mod.default ?? mod.AsyncStorage) as never;
  } catch {
    return undefined;
  }
}

const rnStorage = resolveRNStorage();

const url = readEnv('EXPO_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL');
const anonKey = readEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

if (!url || !anonKey) {
  // Don't hard-crash on import (e.g. during type-check without env) — the
  // client will simply be inert until env is provided.
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL / anon key not set; client is inert.',
  );
}

/** Anon (RLS-scoped) client — safe to use anywhere in the app. */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  url || 'http://localhost:54321',
  anonKey || 'public-anon-key-placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      ...(rnStorage ? { _reactNativeAsyncStorage: rnStorage } : {}),
    },
  },
);

/**
 * SERVER-ONLY client using the service_role key (bypasses RLS).
 * Never import this from UI code. Only export in non-browser environments
 * so RN/web bundlers tree-shake it out of the client bundle.
 */
export const createServiceRoleClient =
  typeof window === 'undefined'
    ? (roleKey?: string): SupabaseClient<Database> => {
        const key =
          roleKey ||
          readEnv(
            'SUPABASE_PROD_SERVICE_ROLE_KEY',
            'SUPABASE_DEV_SERVICE_ROLE_KEY',
          );
        if (!key) {
          throw new Error(
            'createServiceRoleClient: no service role key provided (server only).',
          );
        }
        return createClient<Database>(url || 'http://localhost:54321', key, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
      }
    : undefined;
