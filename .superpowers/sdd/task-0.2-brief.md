### Task 0.2: Remove legacy product surface

**Files:**
- Delete: `src/app/(protected)/`, `src/app/api/chat/`, `src/components/chatbot/`, `convex/`, `scripts/setup-supabase.mjs`, `scripts/demo-listings.mjs`
- Modify: `package.json` — remove `@clerk/*`, `convex`
- Modify: `tsconfig.json` — remove `@/convex/*` path if present

- [ ] **Step 1:** Delete listed directories/files.
- [ ] **Step 2:** `npm uninstall @clerk/nextjs @clerk/backend @clerk/clerk-sdk-node convex`
- [ ] **Step 3:** Remove dead imports: fix `src/app/layout.tsx`, navbar, middleware, auth pages, hooks that reference deleted code.
- [ ] **Step 4:** Add minimal placeholder `src/app/page.tsx` (e.g. "Panora map — coming soon") so `npm run build` succeeds.
- [ ] **Step 5:** Run `npm run build` — must pass.

**Gate 0.2:** No imports from `convex/` or `@clerk/` under `src/`.

Do NOT apply PostGIS migrations yet (Task 0.3).
