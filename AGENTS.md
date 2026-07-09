# AGENTS.md

Compact guidance for working in the Velness repo. Trust the build config and
scripts over `README.md` — the README is stale (it still claims React 18,
Firebase-first, Netlify deploy, and `npm run deploy:netlify`, none of which
match the current setup).

## Stack (verified from package.json / configs)
- Expo 54 + React Native 0.81 + React 19. Web build via **Vite 6** (React Native
  Web + NativeWind/Tailwind). Mobile via `expo run:android` / `expo run:ios`.
- **Supabase** is the real backend (auth, Postgres, storage, realtime). Firebase
  config still exists in `app.config.js` (`EXPO_PUBLIC_FIREBASE_*`) but falls back
  to `VITE_*`; do not treat Firebase as the primary store.
- AI chat served by a **Vercel edge function** at `api/ai/chat.ts` (`runtime: 'edge'`,
  Web `Request`/`Response` API).

## Commands
- Install: `npm install`
- Web dev: `npm run dev` (Vite, port 5173)
- Expo dev: `npm run dev:expo` (or `npm run web:expo`)
- Web build / preview: `npm run build`, `npm run preview`
- Mobile: `npm run android`, `npm run ios`
- **Unit tests:** `npm run test` → `vitest run` (config `vitest.config.ts`,
  includes `src/**/*.test.ts`, node env, `@` → `src`).
- **Integration tests:** `npm run test:integration` → runs `backend/integration-tests/`
  against the **LIVE production Supabase project**. Do not run casually; it creates
  and deletes throwaway anonymous users. Requires `.env.development`.
- Supabase auth setup: `npm run setup:auth` (requires `SUPABASE_ACCESS_TOKEN`).
- Android toolchain: `npm run setup:android`.

## Architecture boundaries
- `src/` is the shared RN-Web app; import it via the `@/*` alias (also `backend/*`).
- `backend/` is a TypeScript module consumed by the UI. Import via `backend/services`.
  Only `backend/repositories/*` (and `baseRepository`) may import `@supabase/supabase-js`
  or the supabase client. UI/features must **never** import supabase directly.
  Auth goes through `AuthService` → `AuthRepository` (see `backend/services/README.md`).
- `api/ai/chat.ts` is the only edge function; in dev, `vite.config.ts` mounts it at
  `/api/ai/chat` via a middleware plugin, and proxies `/api/nvidia` to NVIDIA.
- `supabase/migrations/` are symlinks to `backend/{schema,rls,storage,realtime}/*.sql`.
  The DB schema is the single source of truth; apply via `supabase db push`.

## Backend is FROZEN
Per `backend/FREEZE.md`: do **not** alter the schema or RLS without a new migration
plus a freeze re-review. Supabase project `whjdjxtbyoojrwvbearg` (Tokyo). The
service-role key (`SUPABASE_PROD_SERVICE_ROLE_KEY`) lives only in the gitignored
`.env` and is never bundled.

## Environment / config quirks
- Env is loaded by `APP_ENV` (`development`|`staging`|`production`) in `app.config.js`:
  it merges `.env`, then `.env.<app_env>`, then `.env.local`. Client-exposed vars use
  `EXPO_PUBLIC_*`/`VITE_*` (anon key only); the service-role key is server-only.
- `api/ai/chat.ts` and the Vite dev plugin read env through Vite's `loadEnv`; the
  edge function has no `import.meta`/Node `process.env` assumptions.
- Node >= 20 required (`package.json` `engines`), despite the README saying 18+.
- `tsconfig.json`: `strict: false`, `noUnusedLocals/Parameters: false`. Don't
  "fix" these expecting strictness.
- `vite.config.ts` aliases `react-native`, `expo-router`, `expo-clipboard` to
  web mocks so the RN app builds in the browser. Don't remove these.
- Root `.repro.*` files are a one-off debugging harness for an
  `isAnimated` recursion bug, not part of the normal test suite. Ignore them.
