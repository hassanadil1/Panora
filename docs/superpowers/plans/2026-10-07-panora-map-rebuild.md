# Panora Map Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Panora as a Lahore scheme map with PostGIS polygons, scheme drawer, embed-first virtual tours, auth/favourites, and admin—on Next.js 14 + Supabase, replacing the property-listings app.

**Architecture:** Rip-and-replace legacy routes and listing schema; numbered Supabase migrations (PostGIS + RLS + RPCs); map home at `/` with GeoJSON from `map_schemes('lahore')`; scheme routes under `/s/[slug]`; lazy TourViewer; TanStack Query for server data, Zustand for map camera and UI state.

**Tech Stack:** Next.js 14, TypeScript strict, react-map-gl, Mapbox GL, Supabase (Auth, PostGIS, Storage, Edge Functions), TanStack Query, Zustand, Zod, Tailwind/shadcn, Vitest, Playwright.

## Global Constraints

- Stay on **Next.js 14 App Router** (no Vite monorepo for v1).
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`, `NEXT_PUBLIC_MAPBOX_STYLE_URL` — never commit secrets; service role server/Edge only.
- **Embed-first** launch content; `native_360` and `external_link` implemented but secondary.
- **No** property marketplace, chat, prices, payments in v1.
- English UI only at launch.
- Supabase client: use `@supabase/supabase-js@2.49.8` + `@supabase/ssr@0.5.2` (Node 20 compatible) unless project upgrades Node to 22+.

**Design spec:** `docs/superpowers/specs/2026-10-07-panora-map-rebuild-design.md`  
**Product book:** `PROJECT_REQUIREMENT.MD`

---

## File structure (target)

| Path | Responsibility |
|------|----------------|
| `src/app/page.tsx` | Map home |
| `src/app/s/[slug]/page.tsx` | Map + drawer (parallel route or shared map layout) |
| `src/app/s/[slug]/tour/page.tsx` | Tour viewer route |
| `src/app/admin/layout.tsx` | Role gate |
| `src/app/admin/page.tsx` | Dashboard |
| `src/app/admin/schemes/...` | CRUD + polygon editor |
| `src/app/admin/tours/...` | Tour + allowlist |
| `src/app/favourites/page.tsx` | Saved schemes list |
| `src/components/map/MapShell.tsx` | Map instance, layers, interactions |
| `src/components/map/SchemeLayers.tsx` | fill/line/label layers |
| `src/components/map/MapChrome.tsx` | search, filters, legend |
| `src/components/scheme/SchemeDrawer.tsx` | Detail UI |
| `src/components/tour/TourViewer.tsx` | Strategy switch |
| `src/components/tour/EmbedTour.tsx` | iframe + allowlist |
| `src/lib/supabase/client.ts` | Browser client |
| `src/lib/supabase/server.ts` | Server client (cookies) |
| `src/lib/schema/scheme.ts` | Zod types for RPC payloads |
| `src/lib/geo/bounds.ts` | fitBounds helpers |
| `src/lib/geo/parse-geojson.ts` | Validate FeatureCollection |
| `src/stores/map-store.ts` | Camera + selected slug |
| `src/hooks/use-map-schemes.ts` | TanStack Query wrapper |
| `supabase/migrations/202610070001_init_postgis.sql` | Full book schema + RLS |
| `supabase/seed/lahore.sql` | City, devs, 3 rough polygons |
| `supabase/functions/audit-tours/index.ts` | Nightly link check |

**Delete (Phase 0):** `convex/`, `src/app/(protected)/**`, `src/app/api/chat/`, `src/components/chatbot/`, Clerk deps, `supabase/schema.sql` (superseded by migrations), listing hooks `use-panora-data.ts`, old property `lib/properties.ts`.

---

## Phase 0 — Foundations

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

- [ ] **Step 4:** Run `npm run lint` — expect pass after no code changes yet.

---

### Task 0.2: Remove legacy product surface

**Files:**
- Delete: `src/app/(protected)/`, `src/app/api/chat/`, `src/components/chatbot/`, `convex/`, `scripts/setup-supabase.mjs`, `scripts/demo-listings.mjs`
- Modify: `package.json` — remove `@clerk/*`, `convex`
- Modify: `tsconfig.json` — remove `@/convex/*` path if present

- [ ] **Step 1:** Delete listed directories/files.
- [ ] **Step 2:** `npm uninstall @clerk/nextjs @clerk/backend @clerk/clerk-sdk-node convex`
- [ ] **Step 3:** Run `npm run build` — fix any broken imports until build succeeds or only expected failures remain (map not built yet).

**Gate 0.2:** No imports from `convex/` or `@clerk/` under `src/`.

---

### Task 0.3: PostGIS migration (schema v1)

**Files:**
- Create: `supabase/migrations/202610070001_init_postgis.sql`
- Delete or archive: `supabase/schema.sql` (add README pointer to migrations)

**Interfaces:**
- Produces: SQL function `map_schemes(p_city text) returns jsonb`
- Produces: SQL function `scheme_public(p_slug text) returns jsonb`
- Produces: table `embed_allowlist(host text primary key, label text, created_at timestamptz default now())`

- [ ] **Step 1:** Copy enums/tables/RLS/`map_schemes` from `PROJECT_REQUIREMENT.MD` Part B.4–B.5 into migration file; add `embed_allowlist`; add `save_scheme_geom` RPC stub.
- [ ] **Step 2:** Apply via Supabase Dashboard SQL or `supabase db push` when CLI linked.
- [ ] **Step 3:** Verify in SQL editor:

```sql
select map_schemes('lahore');
-- Expected: {"type":"FeatureCollection","features":[]}
```

- [ ] **Step 4:** Seed Lahore city row in `supabase/seed/lahore.sql`:

```sql
insert into cities (slug, name, center, zoom, live)
values (
  'lahore',
  'Lahore',
  ST_SetSRID(ST_MakePoint(74.3587, 31.5204), 4326)::geography,
  11,
  true
) on conflict (slug) do nothing;
```

**Gate 0.3:** PostGIS enabled; `cities` has `lahore`; empty FeatureCollection valid.

---

### Task 0.4: Generated types and Zod schemas

**Files:**
- Create: `src/lib/schema/database.types.ts` (from `supabase gen types typescript`)
- Create: `src/lib/schema/scheme.ts`
- Create: `src/lib/schema/map-geojson.ts`
- Test: `src/lib/geo/parse-geojson.test.ts`

**Interfaces:**
- Produces: `MapFeatureCollectionSchema` (Zod), type `MapFeatureCollection`
- Produces: `parseMapGeoJson(input: unknown): MapFeatureCollection`

- [ ] **Step 1:** Write failing test:

```typescript
// src/lib/geo/parse-geojson.test.ts
import { describe, it, expect } from "vitest";
import { parseMapGeoJson } from "./parse-geojson";

describe("parseMapGeoJson", () => {
  it("accepts empty FeatureCollection", () => {
    const result = parseMapGeoJson({ type: "FeatureCollection", features: [] });
    expect(result.features).toEqual([]);
  });

  it("rejects missing type", () => {
    expect(() => parseMapGeoJson({ features: [] })).toThrow();
  });
});
```

- [ ] **Step 2:** Run `npm test` — FAIL.

- [ ] **Step 3:** Implement `src/lib/geo/parse-geojson.ts` with Zod schema matching `map_schemes` properties (`slug`, `name`, `short`, `tier`, `color`, `has_tour`).

- [ ] **Step 4:** Run `npm test` — PASS.

---

### Task 0.5: App shell and providers

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/providers.tsx` (QueryClientProvider + AuthProvider)
- Modify: `src/components/auth-provider.tsx` — add `role` from `profiles`
- Modify: `src/middleware.ts` — protect `/admin`, `/favourites` only

- [ ] **Step 1:** Wrap children in `Providers` with TanStack Query.
- [ ] **Step 2:** Simplify root layout: remove legacy nav assumptions; global font/CSS only.
- [ ] **Step 3:** Run `npm run dev` — home loads (placeholder OK).

**Gate 0:** App boots; reads `cities` via Supabase from a test page or server component smoke query.

---

## Phase 1 — Map

### Task 1.1: Map store and geo helpers

**Files:**
- Create: `src/stores/map-store.ts`
- Create: `src/lib/geo/bounds.ts`
- Test: `src/lib/geo/bounds.test.ts`

**Interfaces:**
- Produces: `useMapStore` with `saveCamera(view)`, `restoreCamera()`, `setHoveredSlug(slug | null)`, `setSelectedSlug(slug | null)`
- Produces: `getBoundsFromFeature(feature: GeoJSON.Feature): [[number, number], [number, number]]`

- [ ] **Step 1:** Test bounds helper with a square polygon.
- [ ] **Step 2:** Implement store + bounds.
- [ ] **Step 3:** `npm test` — PASS.

---

### Task 1.2: MapShell and layers

**Files:**
- Create: `src/components/map/MapShell.tsx`
- Create: `src/components/map/SchemeLayers.tsx`
- Create: `src/hooks/use-map-schemes.ts`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `parseMapGeoJson`, `useMapSchemes()` → `MapFeatureCollection`
- Produces: `MapShell` exported; layers ids `schemes-fill`, `schemes-line`, `schemes-label`

- [ ] **Step 1:** `useMapSchemes` calls `supabase.rpc('map_schemes', { p_city: 'lahore' })` and parses with Zod.
- [ ] **Step 2:** MapShell: `react-map-gl` Map, `mapStyle={process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL}`, initial view from Lahore constants until cities query wired.
- [ ] **Step 3:** Add GeoJSON source + three layers per design §3.
- [ ] **Step 4:** Manual test: open `/` — map renders, no console errors.

---

### Task 1.3: Hover, click, fly-in

**Files:**
- Modify: `src/components/map/MapShell.tsx`
- Create: `src/app/s/[slug]/page.tsx` (initial: redirect or drawer stub)

- [ ] **Step 1:** On mousemove, `setFeatureState` hover; cursor pointer on schemes.
- [ ] **Step 2:** On click, `saveCamera()`, `router.push('/s/' + slug)`, `fitBounds` with pitch 55, bearing -17, duration 1600.
- [ ] **Step 3:** Browser back restores camera via `restoreCamera()` on popstate or drawer close.

---

### Task 1.4: Search, filters, legend

**Files:**
- Create: `src/components/map/MapChrome.tsx`
- Modify: `src/components/map/MapShell.tsx`

- [ ] **Step 1:** fuse.js index from feature properties + aliases (aliases may require extending RPC later; v1 can use name/short only).
- [ ] **Step 2:** Tier filter + has_tour toggle adjusts layer opacity/filter expression client-side.
- [ ] **Step 3:** Legend component with tier colors.

---

### Task 1.5: Dev seed polygons

**Files:**
- Modify: `supabase/seed/lahore.sql` — 3 rough multipolygons (DHA Phase 6, Bahria Town, Lake City), `published=false`, `geom_src='rough-seed'`

- [ ] **Step 1:** Insert developers + schemes with valid `ST_GeomFromGeoJSON` multipolygons.
- [ ] **Step 2:** Set `published=true` for one scheme in dev only to test click path.
- [ ] **Step 3:** Confirm polygons visible on map.

**Gate 1:** Click polygon updates URL; fly-in works; unit tests for geo parser pass.

---

## Phase 2 — Drawer and tour viewer

### Task 2.1: scheme_public RPC + drawer

**Files:**
- Migration or patch: `scheme_public(p_slug text)`
- Create: `src/components/scheme/SchemeDrawer.tsx`
- Create: `src/hooks/use-scheme-public.ts`
- Modify: `src/app/s/[slug]/page.tsx`

**Interfaces:**
- Produces: `useSchemePublic(slug: string)` → `{ scheme, developer, media, primaryTour }`

- [ ] **Step 1:** SQL RPC returns JSON for drawer; Zod schema in `src/lib/schema/scheme.ts`.
- [ ] **Step 2:** Drawer UI: blurb, disclaimer, Enter tour button disabled when no verified primary tour.
- [ ] **Step 3:** Deep link `/s/dha-phase-6` opens drawer on load.

---

### Task 2.2: Embed tour viewer + allowlist

**Files:**
- Create: `src/components/tour/TourViewer.tsx`
- Create: `src/components/tour/EmbedTour.tsx`
- Create: `src/lib/tour/allowlist.ts`
- Modify: `src/app/s/[slug]/tour/page.tsx`

**Interfaces:**
- Produces: `getEmbedHost(url: string): string | null`
- Produces: `EmbedTour({ url, owner, onReport })`

- [ ] **Step 1:** Test allowlist:

```typescript
// src/lib/tour/allowlist.test.ts
import { isAllowedEmbedHost } from "./allowlist";
import { describe, it, expect } from "vitest";

describe("isAllowedEmbedHost", () => {
  it("allows my.matterport.com", () => {
    expect(isAllowedEmbedHost("my.matterport.com", ["my.matterport.com"])).toBe(true);
  });
  it("blocks evil.com", () => {
    expect(isAllowedEmbedHost("evil.com", ["my.matterport.com"])).toBe(false);
  });
});
```

- [ ] **Step 2:** Implement host check; load allowlist from Supabase table on server, pass to client.
- [ ] **Step 3:** iframe sandbox + owner credit + load timeout error UI.
- [ ] **Step 4:** Seed allowlist: `insert into embed_allowlist (host, label) values ('my.matterport.com', 'Matterport');`

---

### Task 2.3: External link + native stub

**Files:**
- Create: `src/components/tour/ExternalLinkTour.tsx`
- Create: `src/components/tour/Native360Tour.tsx` (placeholder: "Coming soon" unless scenes exist)

- [ ] **Step 1:** External interstitial + window.open.
- [ ] **Step 2:** Native route dynamic-imports pannellum only when kind is native_360.

---

### Task 2.4: Playwright smoke

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/map-tour.spec.ts`

- [ ] **Step 1:** Test: visit `/`, click seeded polygon, drawer visible, click Enter tour (if seeded tour), close returns to map.

**Gate 2:** Playwright passes against dev seed with one verified embed tour.

---

## Phase 3 — Auth, favourites, events

### Task 3.1: Magic link + Google auth UI

**Files:**
- Modify: `src/app/(auth)/sign-in/page.tsx`, `sign-up/page.tsx`
- Modify: `src/components/auth-provider.tsx` — profile role

- [ ] **Step 1:** Supabase `signInWithOtp` + `signInWithOAuth({ provider: 'google' })`.
- [ ] **Step 2:** Enable providers in Supabase dashboard (manual step documented in plan).

---

### Task 3.2: Favourites

**Files:**
- Create: `src/hooks/use-scheme-favourite.ts`
- Modify: `SchemeDrawer.tsx` — heart toggle
- Create: `src/app/favourites/page.tsx`

- [ ] **Step 1:** Insert/delete `favs` with optimistic TanStack Query mutation.
- [ ] **Step 2:** Favourites page lists schemes via join query.

---

### Task 3.3: Analytics events

**Files:**
- Create: `src/lib/analytics/track-event.ts`
- Modify: map click, tour open, tour_report call sites

- [ ] **Step 1:** `trackEvent({ kind, scheme_id?, meta? })` inserts into `events` with anon_id from localStorage when logged out.
- [ ] **Step 2:** Optional Edge Function `track-event` rate limit (Phase 4 if time).

**Gate 3:** Manual RLS check: two test users cannot read each other's favs.

---

## Phase 4 — Admin

### Task 4.1: Admin layout and role gate

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/lib/auth/require-editor.ts`

- [ ] **Step 1:** Server component loads session + `profiles.role`; redirect if not editor/admin.

---

### Task 4.2: Scheme list and CRUD

**Files:**
- Create: `src/app/admin/schemes/page.tsx`
- Create: `src/app/admin/schemes/[id]/page.tsx`

- [ ] **Step 1:** List schemes with badges (published, tour state).
- [ ] **Step 2:** Form for metadata; Zod validation.

---

### Task 4.3: Polygon editor

**Files:**
- Create: `src/app/admin/schemes/[id]/geometry/page.tsx`
- Install: `@mapbox/mapbox-gl-draw` (or `@teritorio/maplibre-gl-draw` if Mapbox v3 compatible)

- [ ] **Step 1:** Draw control on map; save calls `save_scheme_geom` RPC.
- [ ] **Step 2:** Show validation errors from RPC (invalid geometry).

---

### Task 4.4: Tour manager (embed-first)

**Files:**
- Create: `src/app/admin/schemes/[id]/tours/page.tsx`
- Create: `src/app/admin/allowlist/page.tsx`

- [ ] **Step 1:** Create tour default kind `embed`; require owner + licence before state can be set verified.
- [ ] **Step 2:** Audit queue page: filter `state in ('unchecked','broken')`.

---

### Task 4.5: Edge function audit-tours

**Files:**
- Create: `supabase/functions/audit-tours/index.ts`

- [ ] **Step 1:** Fetch tours with url; HEAD request; log audit_log; update state after 3 failures.
- [ ] **Step 2:** Schedule in Supabase dashboard (cron).

---

### Task 4.6: CONTENT runbook

**Files:**
- Create: `docs/CONTENT.md`

- [ ] **Step 1:** Document: trace polygon, add embed tour, allowlist host, verify, publish.

**Gate 4:** Editor can publish one test scheme end-to-end in under 20 minutes.

---

## Phase 5 — Content sprint (human + agent-assisted)

- [ ] **Step 1:** Spreadsheet for A.2 Lahore P0 schemes (tour URL, owner, permission).
- [ ] **Step 2:** Add Matterport/embed tours + allowlist entries for ≥5 schemes.
- [ ] **Step 3:** Trace/review polygons; set `published=true` only when gate met.

**Gate 5:** ≥5 live Lahore schemes with verified tours on production/preview.

---

## Phase 6 — Hardening

- [ ] **Step 1:** `next.config.js` CSP headers (frame-src allowlist domains).
- [ ] **Step 2:** `privacy`, `terms` pages; boundary disclaimer in footer.
- [ ] **Step 3:** Playwright + Lighthouse a11y pass; `prefers-reduced-motion` skips fly-in.
- [ ] **Step 4:** Sentry DSN optional env; document Mapbox usage alerts.

**Gate 6:** Launch checklist from spec §9 complete.

---

## Plan self-review (author)

| Spec section | Task(s) |
|--------------|---------|
| Architecture §2 | 0.1–0.5, file table |
| Data model §3 | 0.3, 2.1, 3.x, 4.x |
| Map UX §4 | 1.x |
| Tour embed-first §5 | 2.2–2.3 |
| Admin §6 | 4.x |
| Phases 5–6 | 5, 6 |
| Legacy removal | 0.2 |

No TBD placeholders in task deliverables. Type names consistent: `map_schemes`, `scheme_public`, `MapFeatureCollection`, `useMapStore`.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-07-panora-map-rebuild.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
2. **Inline Execution** — implement task-by-task in this session with checkpoints  

Which approach do you want?
