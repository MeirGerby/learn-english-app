# Learn English App

A Hebrew-language English-vocabulary learning web app for a teacher, Hodaya Jerby. React 19 + TypeScript + Vite + Tailwind v4 + shadcn/ui, deployed to GitHub Pages (`https://meirgerby.github.io/learn-english-app/`) via `.github/workflows/deploy.yml` on every push to `main`. Firebase Auth (email/password) + Firestore (word bank, per-user stats/achievements, course content) - no backend service; everything talks to Firebase directly from the browser.

Read this file before starting work. It's kept intentionally short - detailed process philosophy and specs for not-yet-built features live in skills (linked below) so they don't bloat every session's context; load them only when actually relevant.

## Skills

- **`project-operating-system`** - multi-agent orchestration philosophy, task/verification lifecycle, autonomy levels. Load before large-scale architecture planning or coordinating multi-step/multi-agent work.
- **`vocabulary-game-and-research-agent`** - spec for two features that don't exist yet: a generic reusable vocabulary-game engine, and an autonomous research agent that proposes (never silently implements) new game ideas. Load only when actually building one of those.

## Structure

- `src/pages/HomePage.tsx` - Hodaya's bio + two buttons (games, course)
- `src/pages/games/GamesListPage.tsx` - the 5-game menu + achievements display
- `src/pages/games/{flashcards,scramble,fill-blank,listening,speed-round}/` - one folder per game, each self-contained. Each has a dedicated subagent in `.claude/agents/game-*.md` - use it for changes scoped to that game.
- `src/pages/course/CoursePage.tsx` - login-gated; admin-only add/remove content (Firestore `courseContent`, video/image via URL - YouTube auto-embeds)
- `src/pages/auth/{LoginPage,RegisterPage}.tsx`, `src/pages/admin/AdminPage.tsx` (feedback log + one-time word-import tool)
- `src/pages/placement/PlacementTestPage.tsx` - 24-question mixed-band multiple-choice placement test; assigns a Band 1-3 and saves it to `userStats`
- `src/lib/{firebase,wordsDb,userStats,courseContent,placementTest}.ts`, `src/hooks/{useAuth,useGameScore,useAchievements,usePlacement}.ts` - shared logic
- `src/data/wordData.ts` - offline/fallback word bank (Firestore `words` collection is the source of truth once seeded)
- `scripts/generate-vocab.mjs` / `scripts/integrate-vocab.mjs` - Phase 2 vocabulary-expansion tools (Gemini API generation + splicing into `wordData.ts`); see rule 19
- `.claude/agents/` - `game-flashcards`, `game-scramble`, `game-fill-blank`, `game-listening`, `game-speed-round` (each scoped to its own game folder, reads shared code freely, doesn't edit other games or shared infra without flagging it), `product-advisor` (review-only, no write access - consult before non-trivial changes; direct first-principles feedback, not rubber-stamp praise)

## Learned Rules

Newer rules override older ones when they conflict. Categories: `[CODE]` `[STYLE]` `[ARCH]` `[TOOL]` `[PROCESS]` `[DATA]` `[UX]` `[DEPLOYMENT]` `[TESTING]` `[AGENTS]`.

<!-- New rules are appended below this line. -->

1. `[PROCESS]` Always initialize a git repo and push new projects to GitHub by default, without waiting to be asked.

2. `[PROCESS]` Always branch for new work/features, test, then merge to `main` - never commit feature work directly to `main`.

3. `[TOOL]` Always run/test via a real HTTP server (local dev server or the deployed site), never by opening files with `file://` URLs.

4. `[DEPLOYMENT]` Always open and verify the *deployed* site after finishing work - never rely on localhost or a successful `git push` as proof of deployment. Check the GitHub Actions "Build and deploy to GitHub Pages" run actually succeeded, and validate a distinctive string from the change against the live URL. If the workflow fails or gets stuck, diagnose and retrigger.

5. `[DATA]` Hodaya Jerby's bio facts (5 years teaching children, degree in English teaching) came directly from the user - don't invent or embellish credentials.

6. `[UX]` UI language is Hebrew, `dir="rtl"` throughout. English vocabulary words/example sentences stay in English (the content being taught).

7. `[DATA]` Each word entry uses a `translation` field: a direct Hebrew word/phrase translation (e.g. "Hello" → "שלום"), not a descriptive sentence. Used for flashcard backs, quiz/fill-blank answers, and scramble/listening hints.

8. `[ARCH]` Stack is React + Vite + TypeScript + Tailwind v4 + shadcn/ui (full migration completed 2026-08-18, replacing an earlier vanilla-JS version - see git history). TypeScript is mandatory project-wide, including where it adds ceremony a smaller project might skip - an explicit, confirmed user preference, not an oversight. **Not adopted**: Turborepo/monorepo structure (single Vite app - there's only one frontend and no backend, so `apps/`/`packages/` would add structure without a second consumer) and a NestJS/tRPC/PostgreSQL backend (explicitly deferred 2026-08-18 - Firebase already handles auth/data/hosting entirely client-side; do not build a backend speculatively, ask what it would actually own first).

9. `[PROCESS]` Verify each feature (typecheck + build, and actually exercising the change - dev server + a real interaction or headless-browser check, not just reading the code) before moving to the next.

10. `[AGENTS]` Prefer specialized, narrowly-scoped agents over one agent doing everything: the five `game-*` subagents own their own game folder and nothing else; `product-advisor` reviews and gives direct feedback but never implements. Delegate to them rather than editing another agent's scope directly.

11. `[TOOL]` "Use Google AI" / "Antigravity" for frontend design work means calling the Gemini API directly (`https://generativelanguage.googleapis.com/...`) with the user's AI Studio key - Google Antigravity itself is a separate IDE with no invocable API, it cannot actually be operated as a tool. Check `GET /v1beta/models` for what's currently available before picking a model (free-tier quota varies by model and has been zero for some preview models on this key).

12. `[DATA]` Word bank: Firestore `words` collection (public read, admin write) is the source of truth; `src/data/wordData.ts` is the offline fallback. `loadWords()` in `src/lib/wordsDb.ts` races Firestore against a 5s timeout rather than relying on try/catch alone - `getDocs`/`getDoc` can hang indefinitely rather than reject (seen with broken IndexedDB in this dev environment; plausible for some real users too). Seeded via the admin-only, idempotent "Import words" button in `src/pages/admin/AdminPage.tsx`.

13. `[DATA]` Per-user cumulative stats/achievements: Firestore `userStats/{uid}` (owner-only read/write), managed by `src/lib/userStats.ts`. Additive to, not a replacement for, the per-session localStorage score/streak shown in each game's header (works for anonymous users too). `recordAnswer`/`recordGameCompleted` are fire-and-forget (never `await`ed) so a stalled Firestore write never blocks gameplay.

14. `[UX]` Advanced-level content (`idioms`/`phrasalVerbs`/`advancedVocab` categories, and the Fill-in-Blank/Listening/Speed-Round games) carries the `LevelBadge` "רמה מתקדמת" tag. Speed Round is the one exception that draws from *every* category, not just advanced ones (explicit user request) - don't "fix" that to advanced-only.

15. `[UX]` `/course` requires login to view (redirects to `/login` otherwise) but is not admin-restricted to view - any signed-in user can see it. Only admins can add/remove content.

16. `[PROCESS]` A scheduled autonomous "product manager" cloud routine runs hourly (platform enforces a 1-hour minimum interval - true 15-minute cadence isn't possible) against this repo, fully unattended per explicit user confirmation. It's required to consult `product-advisor` and to actually test + verify deployment before shipping anything; shipping nothing in a given cycle is an acceptable outcome. See <https://claude.ai/code/routines> for the routine itself.

17. `[ARCH]` **Supersedes rule 14.** Replaced the old binary beginner/advanced split with a 3-tier Band system (`src/types.ts` `Band = 1 | 2 | 3`, Cambridge/Israeli-school convention explicitly requested by the user): Band 1 = basics/food/travel/foundation, Band 2 = business, Band 3 = idioms/phrasalVerbs/advancedVocab (`CATEGORY_BANDS` in `src/data/wordData.ts`). New users (signed in, non-admin) are redirected to `/placement-test` on first visit to any game route (`RequirePlacement` wrapping the game routes in `App.tsx`); a 24-question mixed-difficulty multiple-choice test assigns a band via `scoreToBand()`, saved to `userStats.placementBand`. `usePlacement()` derives `unlockedBand` (admins always see Band 3; anonymous visitors default to Band 1, untested and ungated - the mandatory test only applies once someone has an account, so open browsing isn't broken). Every game's `CategorySelect` shows locked bands as disabled with a 🔒 + band label; Fill-in-Blank and Listening are wholesale Band-3-only games and show a full-page locked state below that band. Speed Round still spans every band's categories (rule 14's original intent) but each category now individually respects the same lock. `LevelBadge` was renamed `BandBadge` and takes a `band` prop instead of always saying "advanced".

18. `[DATA]` Band 2 currently has only the `business` category (10 words) - it's the thinnest tier, an approximation using existing content rather than a real re-leveling of every word. The user has asked for a much larger vocabulary (~10,000 words/game) generated via the Gemini API and re-tagged by band; that content-expansion phase (Phase 2) hasn't started yet - Phase 1 (this entry) is the placement-test/gating architecture only, built to work against the current word bank so it doesn't block on content first. **Superseded by rule 19 - Phase 2 has since started.**

19. `[DATA]` `[TOOL]` Phase 2 (content expansion) is underway: added ~1,200 Gemini-generated words via `scripts/generate-vocab.mjs` (generation, writes to gitignored `scripts/generated/`) + `scripts/integrate-vocab.mjs` (splices into `wordData.ts`, run with the target category names as args). New categories `technology` and `society` (Band 2) were added; `business`, `idioms`, `phrasalVerbs`, `advancedVocab` were expanded in place. Current per-band totals: Band 1 ≈625 (unchanged - `basics`/`food`/`travel` deliberately skipped this round, see below), Band 2 ≈684, Band 3 ≈605 - roughly balanced now, still well short of the ~10,000/band target, so this is an ongoing multi-session effort, not a one-shot. Notes for continuing it:
    - **Model quota**: the free-tier Gemini API key has *per-model* daily quotas (seen: `gemini-3.6-flash` capped at 20 req/day; `gemini-2.5-flash` is fully deprecated for this key - 404; `gemini-3.5-flash` worked as a fallback with its own separate quota). When one model's quota is exhausted mid-run, switch `GEMINI_MODEL` to another rather than waiting - check `GET /v1beta/models?key=...` for what's currently listed.
    - **`basics`/`food`/`travel` (Band 1) skipped this round**: generation requests for these collided heavily with the existing 595-word `foundation` list (both draw from the same common-word space), yielding as few as ~11 accepted words per 70-word batch. Either accept a higher batch-count/lower-yield cost when tackling Band 1, or scope the prompt more narrowly (e.g. explicitly excluding words a Cambridge Foundation Band I list would already cover) before retrying.
    - **Casing**: generated `advancedVocab` entries came back Capitalized (`"Epistemological"`); the existing convention there is lowercase, so `integrate-vocab.mjs`'s caller lowercased the first letter before integrating - check this per-category before integrating new batches, conventions aren't identical across categories (`basics`/`food`/`travel`/`business` are Capitalized, `foundation`/`idioms`/`phrasalVerbs`/`advancedVocab` are lowercase).
    - Content only lives in `wordData.ts` (the offline fallback) until someone re-runs the admin "Import words" button to reseed Firestore - the two can drift out of sync, same as rule 12 already notes.
