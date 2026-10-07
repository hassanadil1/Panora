# Task 0.1 Report: Dependencies and scripts

**Branch:** `feat/panora-map-rebuild`  
**Commit:** `61504b4` — chore: add test tooling and map rebuild dependencies  
**Date:** 2026-10-07

## Scope

Phase 0 Task 0.1 only: npm dependencies, test scripts, `.env.example`, and `vitest.config.ts`. Legacy routes and app code were not removed (Task 0.2).

## Implemented

### Step 1 — Dependencies

**Production (added or aligned):**

| Package | Version in `package.json` |
|---------|---------------------------|
| `@tanstack/react-query` | ^5.104.1 |
| `zod` | ^3.25.76 (already present; refreshed via install) |
| `fuse.js` | ^7.5.0 |
| `@supabase/ssr` | **0.5.2** (pinned, no caret) |
| `@supabase/supabase-js` | **2.49.8** (pinned, no caret) |
| `zustand` | ^5.0.15 |

**Dev:**

| Package | Version |
|---------|---------|
| `vitest` | ^4.1.11 |
| `@vitejs/plugin-react` | ^6.1.2 |
| `jsdom` | ^29.1.1 |
| `@playwright/test` | ^1.63.0 |

Commands run:

```bash
npm install @tanstack/react-query zod fuse.js @supabase/ssr@0.5.2 @supabase/supabase-js@2.49.8 zustand
npm install -D vitest @vitejs/plugin-react jsdom @playwright/test
```

### Step 2 — npm scripts

Added to `package.json`:

- `"test": "vitest run"`
- `"test:watch": "vitest"`
- `"test:e2e": "playwright test"`

### Step 3 — `.env.example`

Created with plan env var names:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- `NEXT_PUBLIC_MAPBOX_STYLE_URL`

**Note:** `.gitignore` had `.env*` which ignored `.env.example`. Added `!.env.example` so the template is versioned (included in commit).

### Step 4 — `vitest.config.ts`

Minimal Vitest config:

- `@vitejs/plugin-react`
- `test.environment`: `jsdom`
- `resolve.alias`: `@` → `./src`

Matches `tsconfig.json` path `@/*` → `./src/*`.

## Verification

### `npm run lint`

- **Exit code:** 0
- **Behavior:** `next lint` does **not** run ESLint rules today. It opens the interactive “How would you like to configure ESLint?” prompt because Next.js 14.1 does not pick up the repo’s flat `eslint.config.mjs` the same way `next lint` expects a classic config (no `.eslintrc.*` in tree).
- **If ESLint is wired (e.g. `.eslintrc.json` with `next/core-web-vitals`):** lint **fails** with multiple pre-existing errors/warnings in legacy pages (`react/no-unescaped-entities`, `no-img-element`, etc.). Fixing those is out of scope for Task 0.1.
- **`eslint.config.mjs`** (pre-existing) references `next/typescript`, which is **not** available in `eslint-config-next@14.1.0`; direct `npx eslint` fails on config resolution.

**Assessment:** Step 5 “expect pass” is satisfied only in the weak sense (exit 0 + no interactive completion in CI). Real lint enforcement is blocked until a follow-up task adds a Next-compatible ESLint entry config and/or cleans legacy violations.

### `npm run test`

- **Exit code:** 1
- **Reason:** No `*.test.*` / `*.spec.*` files yet (`No test files found`). Expected until Phase 0+ adds tests.
- Vitest emits a **warning** about ESM/CJS in `vitest.config.ts` with `configLoader: 'native'` (informational; config loads and runs).

### `npm run test:e2e`

- Not run (Playwright config and tests are Phase 2 per plan). Script is present as specified.

## Files changed (commit)

| File | Action |
|------|--------|
| `package.json` | Modified — deps + scripts |
| `package-lock.json` | Modified — lockfile |
| `vitest.config.ts` | Created |
| `.env.example` | Created |
| `.gitignore` | Modified — allow `.env.example` |

## Self-review

| Check | Result |
|-------|--------|
| Supabase versions pinned to 2.49.8 / 0.5.2 | Yes |
| Env var names match global constraints | Yes |
| No legacy route deletion | Yes — unrelated WIP left unstaged |
| Commit scoped to Task 0.1 | Yes — 5 files only |
| `@/*` alias in Vitest | Yes |

## Concerns / follow-ups

1. **Lint:** Add `.eslintrc.json` (or migrate Next to flat config) and fix or defer legacy ESLint errors before treating `npm run lint` as a real gate.
2. **`npm test`:** Consider `test.passWithNoTests: true` in Vitest when the first unit tests land, or add a smoke test in a later task.
3. **Playwright:** `test:e2e` will need `playwright.config` and browsers in Phase 2.
4. **Pre-existing repo noise:** Large unstaged changes (Supabase migration, deleted Clerk webhook, etc.) are **not** part of this commit; keep Task 0.2+ separate.

## Status

**DONE_WITH_CONCERNS** — Task deliverables committed; lint exit 0 is misleading; unit test script fails until tests exist.
