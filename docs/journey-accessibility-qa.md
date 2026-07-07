# Journey Accessibility & QA — Sprint 4.13

Sprint 4.13 is a **verification** sprint. It produces no code. It audits the Journey feature (screens under `src/features/journey/screens/`, shared components, and `useJourney`) against seven required QA areas — Dynamic type, Screen readers, Offline behavior, Error recovery, Performance, Consistent spacing, Touch targets — and captures a consolidated accessibility/QA backlog.

This document is experience/QA-facing only. It introduces **no backend architecture, repositories, services, database tables, or business logic**, changes no screen/component code, and follows the global rules (consume ViewModels only, reuse shared components, support every UI state, follow the design system, maintain accessibility, smooth predictable interactions, no decorative UI).

It builds on:
- Sprint 4.1 `journey-experience-foundation.md` — accessibility + state requirements (Loading/Empty/Error/Offline/Locked/Completed/Disabled/Saving).
- Sprint 4.3 `journey-screen-composition.md` — composition + Risks R3/R4/R5 (inconsistent states, unwired retries, color/opacity-only status).
- Sprint 4.4 `journey-continue-experience.md` — Continue states, Offline Resume wrapper, R6/R7/R8/R9.
- Sprint 4.5 `journey-category-experience.md` — RC3/RC8 (offline, a11y of new sections).
- Sprint 4.6 `journey-program-experience.md` — R5/R6 (locked opacity, offline on Program).
- Sprint 4.7 `journey-lesson-experience.md` — status treatments (Locked/Available/Active/Completed), R4/R5.
- Sprint 4.8 `journey-exercise-experience.md` — highest-priority save/reflection gaps, R1/R2/R3/R5/R6.
- Sprint 4.9 `journey-state-transition-engineering.md` — reduced-motion, console-only save, offline transitions, T1–T11.
- Sprint 4.12 `journey-premium-interactions.md` — touch targets / reduced-motion (referenced; file not present in repo at audit time — see §Backlog B12).

---

## Audit scope (read directly from code)

| Area | Primary files inspected |
| --- | --- |
| All | `src/features/journey/screens/{JourneyScreen,CategoryScreen,ProgramScreen,LessonScreen,ExerciseScreen,SessionScreen,SessionSummaryScreen,CompletionScreen,ProgressScreen}.tsx`, `src/features/journey/components/*`, `src/shared/hooks/useJourney.ts`, `src/core/theme/tokens.ts` |
| ViewModel | `useJourney` exposes `isLoading`, `isRefetching`, `error`, `isEmpty`, `isOffline`/`isOnline`, `pendingProgress`, `refresh`, `resumeJourney`, `refreshRecommendation`, `startExercise`, `completeLesson` (lines 304–327). **No `isSaving`/`saveError` surface** (cf. 4.9 T6). |

---

## 1. Dynamic Type

### What "good" looks like (design system)
- All text honors the system font-size setting (RN `allowFontScaling` defaults to `true`, and is not disabled anywhere — good baseline).
- No fixed-height container clips scaled text; titles that use `numberOfLines={1}` still truncate gracefully and remain meaningful.
- Very large display text (timers, hero titles) scales but does not overflow its circular/sized frame.
- An upper bound (`maxFontSizeMultiplier`) is applied to prevent grotesque overflow on the largest accessibility setting where layout is fixed.

### Current gaps found in code
- **No `maxFontSizeMultiplier` is set on any screen** — when the system font is set to the largest accessibility size, fixed-size display text can clip. Notable fixed/large sizes:
  - `ExerciseScreen` `timerText` `fontSize: 56` inside a fixed `260×260` circle (lines 369, 361–368) — at max scaling the `00:00` digits will overflow the circle.
  - `ProgramScreen` `programTitle` `fontSize: 24` and `JourneyScreen`/`ProgressScreen` header `fontSize: 18–20` (ProgramScreen 186; ProgressScreen 172) — acceptable but unguarded.
  - `CompletionScreen` `title` 24, `JourneyHero`/`JourneyHeader` titles — unguarded.
- **Fixed frames don't grow with text:** `timerCircleBg` is a hard `260×260` (ExerciseScreen 361), `heatmapDot` `28×28` (ProgressScreen 195), `categoryBadge`/`difficultyBadge` use fixed `paddingVertical: 3` (CurrentProgramCard 168; ProgramScreen 189) — long localized strings (e.g. a long program title at large type) will clip or wrap awkwardly.
- **`numberOfLines={1}` truncation** on `headerTitle` (every screen) and `CurrentProgramCard.title` (line 93) means at large type the most important identifier (screen/program title) can be cut with no accessible full-text fallback.

### Verification method
1. iOS: Settings → Accessibility → Display & Text Size → Larger Text → drag to max (and enable "Larger Accessibility Sizes"). Android: Settings → Accessibility → Font size → largest; also enable "Display size" largest.
2. Walk every Journey screen. Check: (a) the timer `00:00` stays inside its circle; (b) no text is clipped by fixed-height cards; (c) titles truncated at `numberOfLines={1}` still convey identity (or expose full text via `accessibilityLabel`); (d) the heatmap/program cards still read.
3. Optional: Xcode Accessibility Inspector → "Dynamic Type" preview, and a snapshot-diff at AX5 vs AX1.

### Ties to prior sprints
- Design-system baseline: 4.1 (no rule violated yet, but unguarded). 4.9 (reduced-motion + layout stability). 4.12 (typography scaling for premium feel — file not present).

---

## 2. Screen Readers (VoiceOver / TalkBack)

### What "good" looks like (design system, 4.1 / 4.7)
- Every interactive control has `accessibilityRole` + a meaningful `accessibilityLabel`; icon-only controls also get `accessibilityHint` where the action is non-obvious.
- Status (locked / available / completed / in-progress / disabled / offline) is conveyed by **text or label**, never by color/icon alone.
- Live, time-varying state (timers, breathing phases, mood) is announced via `accessibilityLiveRegion`/`announceForAccessibility`.
- Disabled/locked controls expose `accessibilityState={{ disabled: true }}` so they are skipped or explained, not silently focusable.

### Current gaps found in code
- **`ProgramScreen` lesson rows have no `accessibilityLabel` and no status in the label** (lines 142–148): each `Pressable` sets `accessibilityRole="button"` but no `accessibilityLabel`; the SR reads only the child title/meta. The status icon (CheckCircle / Circle / Lock) carries no text, so a screen-reader user cannot tell a *completed* from an *available* from a *locked* lesson. Locked rows set `disabled` + `opacity: 0.5` (144–147) but **not** `accessibilityState={{ disabled: true }}` and give no "locked" hint — the 4.7 status table is not met.
- **`LessonScreen` exercise rows only label the *available* ("Start {title}") state** (lines 144–145); completed rows show a `CheckCircle` (line 139) but no "Completed" text in any label, and locked/active rows have no status text. 4.7's "Completed"/"Locked" text-label rule is unmet.
- **`ProgressScreen` has three unlabeled regions:**
  - `programCard` Pressables (lines 112–117) have no `accessibilityLabel`; the action "open program" is unstated (status text exists as a child, which helps, but the tappable target's purpose is implicit).
  - Heatmap `heatmapDot` views (lines 90–95) carry completion via `backgroundColor` only — **color-only status**, no label/role; an SR user gets nothing.
  - `achievementRow` unachieved state is a faint low-opacity star (lines 14–17, 136–145) with no text status — color/opacity-only.
- **`BreathingGuide` phase changes are visual-only** (phase text "Inhale/Hold/Exhale" updates via `setState`, lines 165, 131–136) with no `accessibilityLiveRegion` announcement — a blind user hears nothing as the exercise progresses (4.8 R5).
- **`SessionSummaryScreen` mood buttons** are labeled `"Mood {value}"` (line 24) with no "of 5" range and no selected-state announcement in the label (selected is shown only by border color — color-only).
- **Good (keep):** back buttons are consistently labeled "Go back" across all screens; `CurrentProgramCard` label is descriptive (`"Continue {title}, Lesson {n} of {m}"`, line 65); `RecommendationCard`/`AIRecommendationCard`/`PracticeCategoryCard` have full labels; the timer Start/Pause toggle label is correct (ExerciseScreen 83).

### Verification method
1. Enable VoiceOver (iOS, triple-click side/Home) or TalkBack (Android, volume-key shortcut).
2. On each screen, swipe-through the full element order. Record: (a) is every control named? (b) for lesson/exercise/program/achievement/heatmap, does the announcement include status (completed/locked/available/unachieved)? (c) do timer/breathing phase changes get announced? (d) are locked controls skipped or explained rather than silently present?
3. Use Accessibility Inspector → Audit on iOS simulator for missing labels / static-text-as-button warnings.

### Ties to prior sprints
- 4.1 "status changes should be understandable without relying on color alone"; 4.3 R5; 4.7 status-treatment table; 4.8 R5 (breathing/mood a11y).

---

## 3. Offline Behavior

### What "good" looks like (design system, 4.1 / 4.4 §7 / 4.9 B4)
- When `isOffline` is true, a clear banner wraps the Header (cached content stays usable).
- Sync-dependent actions (refresh recommendation, View all that needs network) are disabled or relabeled, not silently broken.
- Offline-safe practice (meditation/breathing/local journaling) is allowed and marked "will sync when online" via `pendingProgress`.
- No completion/unlock asserts counted progress the ViewModel hasn't confirmed saved or pending.

### Current gaps found in code
- **No screen renders offline state.** `useJourney` exposes `isOffline`/`isOnline`/`pendingProgress` (lines 271–272, 198–203), but `JourneyScreen`, `ProgramScreen`, `LessonScreen`, `ExerciseScreen`, `CategoryScreen`, `SessionScreen`, `CompletionScreen`, `ProgressScreen` **none** render an offline banner or copy. Offline is invisible (4.3 R3; 4.4 R6; 4.7 R4; 4.8 R3; 4.9 T8).
- **`pendingProgress` is unused in the UI.** It is computed (lines 199–203) but never surfaced — so offline save/completion can't show "will sync" copy.
- **`ExerciseScreen.handleSave` routes to `/journey/summary` regardless of network** (lines 274–287). If the save fails (e.g. offline), the `catch` only `console.error`s (284–286) and the user is **not** navigated — leaving them on a dead-end exercise with no "saved pending" or retry. Even on success while offline, no "will sync" label is shown.
- **Cache-first paint is not labeled** as "saved progress" when offline (4.4 Offline Resume copy is unimplemented).
- `SessionScreen` shares the same gap (save → console-only, no offline/pending label — 4.8 R3).

### Verification method
1. Toggle device to Airplane Mode (or use the dev "offline" toggle / Charles/Network Link Conditioner).
2. Open each Journey screen: confirm an offline banner appears and cached content is still usable.
3. Attempt a meditation/breathing complete and a journal save while offline: confirm the save is marked pending (not a fake-success summary) and that a "will sync when online" label is shown.
4. Re-enable network: confirm `pendingProgress` drains and progress updates.

### Ties to prior sprints
- 4.1 Offline states; 4.3 R3 + "offline wraps, never replaces"; 4.4 §7 Offline Resume; 4.7 R4; 4.8 R3; 4.9 B4/T8.

---

## 4. Error Recovery

### What "good" looks like (design system, 4.1 / 4.2 / 4.8)
- Every failure (load, save, navigation) shows a blame-free message **and a wired retry** (or a safe back/home) in the Action Area.
- Save failures must never drop the user onto a success-looking screen; the user stays in place with a Retry control.
- No recovery path is console-only.

### Current gaps found in code
- **`JourneyScreen` error state has no wired retry** (lines 146–157): it shows "Something went wrong loading your journey." but the only recovery is `onRefresh`, which on failure only `console.error`s (line 100). There is no on-screen Retry button calling `refresh()`.
- **Save failures are console-only on `ExerciseScreen` and `SessionScreen`** (ExerciseScreen 284–286 `console.error`; `SessionScreen` 86–88 `console.error` per 4.8 R2). On failure: no error message, no Retry control, no keep-user-in-place recovery — directly contradicts the Sprint 4.8 highest-priority note.
- **No `isSaving`/`saveError` ViewModel surface** (4.9 T6): screens call `journeyRepository` directly (ExerciseScreen 10/274; SessionScreen 10/76), so a Saving indicator and retry UI can't be driven from state.
- **`LessonScreen` auto-navigates to `CompletionScreen` on `allCompleted`** (4.9 T4 — lines 70–74 in 4.7 grounding) without confirmation and fires on optimistic state, so an errored/partial save can strand the user on a celebration screen.
- Good: not-found/empty messages exist on most screens (Program "Program not found.", Exercise "Exercise not found.", etc.) and back headers are preserved — orientation is kept.

### Verification method
1. Force a load error (offline + pull-to-refresh, or mock the `journey` query to reject). Confirm a Retry control is present and actually re-attempts.
2. Force a save error (offline save, or intercept `saveProgress` to reject). Confirm the user stays on the exercise with a blame-free message + Retry, and is **not** routed to a summary/completion.
3. Verify complete-and-error does not auto-route to `CompletionScreen`.

### Ties to prior sprints
- 4.1 Error states; 4.2 recovery/predictability; 4.3 R4; 4.4 R7; 4.8 R2 (highest priority); 4.9 T3/T5.

---

## 5. Performance

### What "good" looks like (design system)
- Screens mount only the subscriptions they need; no refetch storms on every entry.
- Per-tick UI updates (timers) are isolated so they don't re-render the whole screen tree.
- Lists are virtualized when long; derived data is memoized.
- Background sync is debounced and doesn't invalidate queries that are already fresh.

### Current gaps found in code
- **`useJourney` subscribes to three realtime hooks on every consumer** (`useRealtimeExercises`, `useRealtimeUserProgress`, `useRealtimePrograms`, lines 65–67) — every Journey screen that calls `useJourney()` opens three realtime channels even when the screen doesn't need them, causing broad re-renders.
- **A 100 ms `setTimeout` background sync fires on every `useJourney` mount and invalidates three query keys** (lines 180–196): `legacy`, `exercises`, `user-progress`, `recommendations`. Entering and leaving Journey (tab switch, navigation) re-triggers this, producing redundant refetches and re-renders across all subscribers — a refetch storm.
- **`ExerciseScreen` `MeditationTimer` uses a 1-second `setInterval` calling `setRemaining`** (lines 38–54) on the timer component, which re-renders the timer each second — acceptable, but the state lives in the timer component (good isolation) while `handleSave`/`exercise` lookups in the parent re-run `useMemo` on `exercises` changes.
- **`JourneyScreen` hardcoded fallbacks** (`'Managing Overthinking'`, `currentLesson 3`, `completionPercent 37`, `minutesRemaining 8`, lines 198–202; `'morning-breathing'` fallback line 124; fabricated recommendation lines 263–270) mean the screen renders plausible-but-fake content even when data is missing, which both misleads QA and can mask real empty/error conditions during testing (cf. 4.3 R1).
- Lists are short (programs/lessons/categories) so no virtualization is needed today — acceptable.

### Verification method
1. Xcode Instruments → React Profiler / Flipper "React Native Performance": mount each screen, tab-switch away and back 5×, watch render counts and query invalidations.
2. Confirm the background-sync timer does not refetch on every mount; add a dev log to `syncFromCloud` to count calls.
3. Run the meditation timer and observe commit count per second (should be isolated to the timer).

### Ties to prior sprints
- Implicit in 4.9 (smooth transitions require stable render cadence). No dedicated prior sprint; this is net-new QA coverage for 4.13.

---

## 6. Consistent Spacing

### What "good" looks like (design system, `src/core/theme/tokens.ts` `spacing`)
- All spacing uses the `spacing` token scale (`xs:4, sm:8, md:12, lg:16, xl:20, 2xl:24, 3xl:32, 4xl:48, section:40, …`) and the `borderRadius` tokens.
- Vertical rhythm (section gaps, card padding, header padding) is uniform across screens.
- No magic numbers where a token exists (e.g. `paddingVertical: 3` should be a token or a documented exception).

### Current gaps found in code
- **Magic numbers mixed with tokens:**
  - `CurrentProgramCard` `categoryBadge` uses `paddingHorizontal: 8, paddingVertical: 3` (lines 167–168) instead of `spacing.sm`/`spacing.xs`.
  - `ProgramScreen` `difficultyBadge` uses `paddingVertical: 3` (line 189) similarly.
  - `JourneyScreen` `contentContainer` uses `paddingBottom: 110` (line 316) — a raw number vs the token `spacing['5xl']` (64) used by `ProgramScreen`/`ProgressScreen`. Inconsistent bottom safe area.
  - `ExerciseScreen` fixed circles/font sizes (260, 56) are raw.
  - `ProgressScreen` `heatmapDot` `28×28` (line 195), `statCard` raw gaps — acceptable but inconsistent with card padding norms.
- **Section rhythm inconsistency:** `JourneyScreen` uses `sectionSpacing: { marginTop: spacing['2xl'] }` (24, line 320) between every section; `ProgramScreen`/`ProgressScreen` use `sectionTitle: { marginTop: spacing['2xl'] }` (24) — same value, good — but `JourneyScreen` additionally has `paddingBottom: 110` vs others `spacing['5xl']`, so the bottom gap differs by ~46px across screens.
- **`spacing.section: 40` token is defined but never used**; screens hand-roll `2xl` (24) for section gaps, so the intended "section" rhythm token is dead.

### Verification method
1. Visually diff the bottom safe-area and inter-section gaps across Journey/Program/Lesson/Progress/Category — confirm uniform `spacing` usage.
2. Grep for raw numeric `padding`/`margin`/`gap`/`width`/`height` in Journey screens/components and confirm each has a token equivalent; flag the exceptions.
3. Confirm `spacing.section` (40) is either adopted for section gaps or removed from tokens.

### Ties to prior sprints
- Design-system consistency (4.1 "Follow the design system"); 4.5/4.6 composition uniformity; 4.9 B1 (no pop-in relies on consistent layout tokens).

---

## 7. Touch Targets

### What "good" looks like (design system / 4.12)
- Every tappable control meets the minimum ~44×44 pt hit area (Apple HIG / Android Material). Icon-only buttons get `hitSlop` or an explicit min size.
- Primary actions (Continue, Save, Resume) are comfortably larger than the minimum.
- Back/close affordances, though small icons, still reach the 44 pt equivalent via padding or `hitSlop`.

### Current gaps found in code
- **All back buttons use `padding: spacing.xs` (4) around a 24 px icon** (`backButton: { padding: spacing.xs }` in `JourneyScreen` 351, `ProgramScreen` 181, `LessonScreen` (style), `CategoryScreen` 48 area, `SessionScreen` 95/111, `ProgressScreen` 171, `LibraryScreen` 53, `CompletionScreen`/`SessionSummaryScreen` use header-less design). That yields a ~32×32 pt hit area — **below the 44 pt minimum** and with **no `hitSlop`**. This is the single most consistent touch-target violation across the app.
- **`CurrentProgramCard` Play button is 44×44 with `hitSlop={12}`** (lines 189–195) — good; this pattern should be applied to back buttons.
- **Good targets elsewhere:** `ExerciseScreen` `timerButton` 64×64, `timerButtonSmall` 44×44; `SessionSummaryScreen` `moodButton` 44×44; `ProgramScreen` `continueButton` (tall via `paddingVertical: spacing.md`); `lessonCard`/`programCard` padding `lg` (16) → comfortably >44.
- **Inline "Refresh ↻" / "View all" header actions** (`JourneySectionHeader`, lines 49–50) are text buttons with default padding — likely OK but should be verified ≥44 pt tall.

### Verification method
1. Enable "Show Layout Bounds" (Android Developer Options) or use the Accessibility Inspector → "Minimum interactive size" overlay (iOS, Xcode 15+).
2. Tap every back button with a fingertip (not a mouse) to confirm comfortable activation; measure the hit rectangle.
3. Confirm the 44 pt rule on the Play, mood, timer, continue, save, and category-card controls.

### Ties to prior sprints
- 4.12 `journey-premium-interactions.md` (touch targets / reduced-motion) — referenced as the source of the 44 pt rule; **the file is not present in the repo at audit time**, so the touch-target spec could not be cross-checked against 4.12's exact thresholds (see Backlog B12).

---

## Consolidated Accessibility / QA Backlog

No code is changed in this sprint. The following items are carried forward as the a11y/QA backlog (cross-referenced to prior sprint risks where they originate).

| # | Area | Backlog item | Evidence | Origin |
| --- | --- | --- | --- | --- |
| B1 | Screen readers | Add `accessibilityLabel` + status text to `ProgramScreen` lesson rows; set `accessibilityState={{ disabled: true }}` + "locked" hint on locked rows. | ProgramScreen 142–148, 144–147 | 4.7 R5; 4.3 R5 |
| B2 | Screen readers | Add status ("Completed"/"Locked"/"Available") to `LessonScreen` exercise row labels. | LessonScreen 139, 144–145 | 4.7 status table |
| B3 | Screen readers | Label `ProgressScreen` program cards ("Open {title}"), heatmap dots, and achievement unachieved state (text, not color). | ProgressScreen 90–95, 112–117, 136–145 | 4.1 color-only; 4.3 R5 |
| B4 | Screen readers | Announce `BreathingGuide` phase changes via `accessibilityLiveRegion`; add "of 5" + selected state to mood buttons. | ExerciseScreen 131–136; SessionSummary 24 | 4.8 R5 |
| B5 | Offline | Render an offline banner (wrap Header) on every Journey screen using `isOffline`; surface `pendingProgress` as "will sync" copy. | useJourney 271–272, 198–203; no screen renders it | 4.1/4.3/4.4/4.7/4.8/4.9 |
| B6 | Offline / Error | Stop routing to summary on offline save; mark pending; keep user in place. | ExerciseScreen 274–287, 284–286 | 4.8 R3 |
| B7 | Error recovery | Wire a Retry control into `JourneyScreen` error state (call `refresh()`); stop console-only refresh. | JourneyScreen 146–157, 100 | 4.3 R4; 4.4 R7 |
| B8 | Error recovery | Surface `isSaving`/`saveError` from ViewModel; replace console-only save failures with blame-free Retry UI on Exercise/Session. | useJourney (no save state); ExerciseScreen 284–286; SessionScreen 86–88 | 4.8 R2 (highest); 4.9 T5/T6 |
| B9 | Error recovery | Gate `LessonScreen` auto-navigation on ViewModel-confirmed save; prefer in-place completion. | LessonScreen 70–74 (per 4.7) | 4.9 T3/T4; 4.2 |
| B10 | Dynamic type | Add `maxFontSizeMultiplier` guards; let fixed frames (timer circle, badges, heatmap) grow or scale with text. | ExerciseScreen 361/369; CurrentProgramCard 168; ProgressScreen 195 | 4.1; 4.12 |
| B11 | Performance | Debounce/guard the 100 ms background-sync `setTimeout` so it doesn't invalidate queries on every `useJourney` mount; scope realtime subscriptions to need. | useJourney 180–196, 65–67 | 4.13 new |
| B12 | Touch targets / Doc gap | Apply `hitSlop` (~12) or min 44 pt to all back buttons; cross-check against 4.12 spec. **`docs/journey-premium-interactions.md` (4.12) is not present in the repo** — create/restore it so the 44 pt threshold is authoritative. | all `backButton: { padding: spacing.xs }`; missing 4.12 file | 4.12 (referenced, absent) |
| B13 | Consistent spacing | Replace magic numbers with `spacing`/`borderRadius` tokens (`paddingVertical: 3`, `paddingBottom: 110`, `28×28` dots, `260/56` timer); adopt or remove `spacing.section`. | CurrentProgramCard 167–168; JourneyScreen 316; ProgressScreen 195; tokens 92–106 | 4.1 design system |
| B14 | Screen readers / Trust | Remove hardcoded fallbacks (`'Managing Overthinking'`, `currentLesson 3`, `completionPercent 37`, `'morning-breathing'`, fabricated recommendation) so QA sees real empty/error states. | JourneyScreen 124, 198–203, 263–270 | 4.3 R1; 4.4 R1 |

---

## Acceptance Check

| Criterion | Status |
| --- | --- |
| Seven required QA areas covered (Dynamic type, Screen readers, Offline, Error recovery, Performance, Consistent spacing, Touch targets). | Covered in §1–§7. |
| Each area defines "good" per design system, current gaps (with file:line evidence), and a verification method. | Covered per section. |
| Each area tied to prior sprints (offline→4.1/4.4/4.9; error→4.1/4.9; touch targets→4.12; etc.). | Cross-references in each section + Backlog. |
| Consolidated a11y/QA backlog captured without code changes. | Covered in Backlog B1–B14. |
| No app/screen code modified; no backend/repository/service/table/business-logic change. | This document is QA-only. |
