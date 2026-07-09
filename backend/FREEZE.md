# Velness — Backend Freeze (Sprint S0.10)

**Status: ✅ Backend is FROZEN — do not alter schema without a new migration + freeze re-review.**

Project: `whjdjxtbyoojrwvbearg` · Region: `ap-northeast-1` (Tokyo) · Linked via `supabase` CLI.
This document records the evidence that every backend freeze criterion is satisfied as of
the date below. The Supabase project is the single, authoritative backend for Velness.

---

## 1. Authentication works
- `AuthService` (`backend/services/AuthService.ts`) is the only auth entry point the UI may
  use; it delegates to `AuthRepository` (`backend/repositories/AuthRepository.ts`), which is
  the only place that touches the Supabase Auth client.
- Verified end-to-end by the Sprint S0.9 integration tests (live prod project):
  - anonymous sign-in (throwaway identity) → `getSession()` → `authService.init()` session
    restore → `refreshSession()` → `signOut()` all pass.
- Note: this project's email validator rejects `.test`/plus-address domains and confirmation
  emails are rate-limited, so integration tests create throwaway identities via
  `signInAnonymously()`. Each anonymous identity is a distinct, authenticated auth user with
  its own `profiles` row (via the `handle_new_user()` trigger), giving equivalent isolation.
- During integration testing an unhandled-rejection bug was found in `AuthService.init()`
  (it called `getCurrentUser()` on a `SIGNED_OUT` event with no session). This was fixed in
  `backend/services/AuthService.ts` (the background user-fetch now swallows auth errors).

## 2. Database schema is frozen
Migrations are the **single source of truth** in `backend/schema` / `backend/{rls,storage,realtime}`,
symlinked into `supabase/migrations/`. Applied through `supabase db push`.

**14 tables** (all in `public`):
`profiles`, `journeys`, `programs`, `lessons`, `exercises`, `sessions`, `progress`,
`recommendations`, `achievements`, `moods`, `journal_entries`, `notifications`,
`user_preferences`, `analytics_events`.

**11 enums:**
`journey_status`, `program_status`, `lesson_status`, `exercise_type`, `session_status`,
`progress_status`, `recommendation_status`, `achievement_type`, `mood_level`,
`notification_type`, `notification_channel`.

A post-freeze optimization migration `backend/schema/0005_optimizations.sql` (symlinked as
`0005_optimizations.sql`) adds **only** non-breaking indexes and pins a trigger `search_path`;
it does not alter any table shape or enum.

## 3. RLS is active
- Every user-owned table is protected by strict own-data RLS in `backend/rls/0002_rls.sql`.
- Evidence (live query): `pg_class.relrowsecurity = true` for **14 / 14** public tables.
- Own-data isolation is proven by the S0.9 RLS test: a user B authenticated client returns
  **zero** rows belonging to user A (both at the repository layer and at the raw DB level
  via a JWT-scoped client).

## 4. Repository layer is complete
Repositories under `backend/repositories/` (the **only** modules that import
`@supabase/supabase-js` / the `supabase` client):
`AuthRepository`, `ProfileRepository`, `JourneyRepository`, `MoodRepository`,
`SessionRepository`, `RecommendationRepository`, `ExerciseRepository`, `ProgramRepository`,
`LessonRepository`, `ProgressRepository`, `AchievementRepository`, `JournalRepository`,
`NotificationRepository`, `UserPreferencesRepository`, `AnalyticsRepository`, plus the shared
`baseRepository` (`BaseRepository`, `RepositoryError`). All are re-exported from
`backend/repositories/index.ts`. UI/features consume repositories, never Supabase directly.

## 5. Environment configuration is complete
- Reference: `backend/env/README.md`.
- Files: `.env.development` (prod anon URL + anon key), `.env.staging`, `.env.production`,
  `.env.example`, and the gitignored `.env` (holds `SUPABASE_PROD_SERVICE_ROLE_KEY`).
- Client-exposed vars use `EXPO_PUBLIC_*` / `VITE_*` prefixes (anon key only); the
  service-role key is server-only and never bundled. The integration tests load these at
  runtime via `backend/integration-tests/setup.ts` (no `dotenv` dependency, no hardcoded secrets).

## 6. Storage is configured
- 4 buckets (all **private**), created by `backend/storage/0003_storage.sql`:
  `avatars`, `journal`, `media`, `exports`.
- Confirmed present and private on the live project via `supabase_list_storage_buckets`.
- Storage RLS restricts every object to its owning `user_id` namespace.

## 7. Realtime is configured
- `backend/realtime/0004_realtime.sql` adds the curated tables to the `supabase_realtime`
  publication. Live query confirms **10 tables** published:
  `achievements`, `journeys`, `lessons`, `notifications`, `profiles`, `programs`, `progress`,
  `recommendations`, `sessions`, `user_preferences`.

## 8. Integration tests pass (Sprint S0.9)
- Location: `backend/integration-tests/` (vitest, run with
  `npm run test:integration` → `vitest run --config backend/integration-tests/vitest.config.ts`).
- Suites & result (live prod run):
  - `auth.test.ts` — 2 passed (sign-in, session restore, refresh, signOut)
  - `crud.test.ts` — 2 passed (journey + mood create/read/update/delete round-trip)
  - `rls.test.ts` — 1 passed (user B cannot read user A data — repository + raw JWT RLS check)
  - `errors.test.ts` — 2 passed (unauthenticated op throws `RepositoryError`)
  - `offline.test.ts` — 1 passed + 1 skipped (true offline simulation documented as skipped;
    fail-fast `RepositoryError` on no-session asserted)
  - **Totals: 5 files, 8 passed, 1 skipped, 0 errors.**
- Cleanup: every throwaway identity (and its cascade of owned rows) is deleted after the run
  via the service-role client (`auth.admin.deleteUser`). Verified 0 leftover anonymous users.
- Public anon key used (RLS-scoped, safe client-side — the value lives in `.env.*` and is intentionally not committed here).
- Project URL: `https://whjdjxtbyoojrwvbearg.supabase.co`

---

### Advisor review (Sprint S0.7 verify & optimize)
- `supabase_get_advisors` (security + performance) returned only INFO/WARN lints that are
  either **by-design** (own-data RLS allows `anon` to SELECT its own rows; `pg_trgm` extension
  in `public`; `handle_new_user`/`rls_auto_enable` SECURITY DEFINER trigger functions callable
  by anon) or addressed by `0005_optimizations.sql` (unindexed FK covering indexes, status/flag
  lookup indexes, `set_updated_at()` `search_path` pin).
- The `auth_rls_initplan` WARN (wrap `auth.<fn>()` as `(select auth.<fn>())`) and
  `multiple_permissive_policies` WARN on `notifications` were **intentionally left unchanged**
  because fixing them requires rewriting RLS policy bodies — out of scope for the additive,
  non-breaking optimization migration and would alter RLS policy definitions.

---

**Backend is FROZEN — do not alter schema without a new migration + freeze re-review.**
