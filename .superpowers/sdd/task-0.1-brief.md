### Task 0.1: Dependencies and scripts

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `.env.example`

**Interfaces:**
- Produces: npm scripts `test`, `test:e2e` (Playwright added in Phase 2)

- [ ] **Step 1:** Add dependencies:

```bash
npm install @tanstack/react-query zod fuse.js @supabase/ssr@0.5.2 @supabase/supabase-js@2.49.8 zustand
npm install -D vitest @vitejs/plugin-react jsdom @playwright/test
```

Note: `@tanstack/react-query`, `zod`, `zustand`, `@supabase/ssr`, `@supabase/supabase-js` may already be present — align versions to plan (supabase 2.49.8 / ssr 0.5.2 for Node 20).

- [ ] **Step 2:** Add scripts to `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test"
```

- [ ] **Step 3:** Create `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=
NEXT_PUBLIC_MAPBOX_STYLE_URL=
```

- [ ] **Step 4:** Create minimal `vitest.config.ts` for Next.js/TS path alias `@/*` pointing to `./src/*`.

- [ ] **Step 5:** Run `npm run lint` — expect pass.

Do NOT delete legacy app code in this task (Task 0.2).
