# Panora Map Rebuild — Design Spec

**Date:** 2026-10-07  
**Status:** Approved in brainstorming (user confirmed all sections)  
**Source of truth:** `PROJECT_REQUIREMENT.MD` (development book)  
**Decisions locked in this session:**

| Decision | Choice |
|----------|--------|
| Codebase strategy | **B** — Stay on Next.js 14 App Router; rebuild product in place (no Vite monorepo for v1) |
| Delivery scope | **C** — Full v1 through Phase 4 (admin + content pipeline) plus book content/launch gates |
| Tour content strategy | **A** — **Embed-first** (Matterport/developer iframes); native 360 and external link supported in product but not the default launch workflow |
| Execution approach | **Rip-and-replace** + light modular `src/lib/*` (schema, geo, map helpers) |

---

## 1. Purpose

Replace the current generic property-listings app with **Panora Properties v1**: a **map-first Lahore explorer** where users browse **high-end housing schemes** as **colored polygons** on a **custom Mapbox basemap**, open a **scheme drawer**, and enter **verified virtual tours** (primarily embedded). Authenticated users save **scheme favourites**. Editors/admins manage schemes, polygons, tours, and publish workflow without engineering.

**Explicit v1 non-goals:** property marketplace, prices/plots, chat, payments, agent marketplace (per book A.6).

---

## 2. Architecture & stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 App Router (existing repo) |
| Language | TypeScript, `strict: true` |
| Map | Mapbox GL JS via `react-map-gl`; custom style URL in env |
| Client server state | TanStack Query |
| Client UI state | Zustand (camera restore, map interaction state, drawer) |
| Backend | Supabase: Postgres + PostGIS, Auth, Storage, Edge Functions |
| Styling | Tailwind CSS + existing shadcn/ui primitives where useful |
| Validation | Zod at boundaries (admin forms, API responses) |
| Tests | Vitest (units), Playwright (e2e), pgTAP for RLS (CI when wired) |

### Environment variables (Next naming)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- `NEXT_PUBLIC_MAPBOX_STYLE_URL` (Mapbox Studio style; no hard-coded style in code)

Server-only: Supabase service role for Edge Functions and CI only (never client).

### Repository layout (inside existing project)

```
src/
  app/
    page.tsx                    # Map home (Lahore)
    s/[slug]/page.tsx           # Deep link + scheme drawer
    s/[slug]/tour/page.tsx      # Full-screen tour viewer
    admin/...                   # Role-gated admin
    (auth)/sign-in, sign-up     # Supabase auth
    privacy, terms              # Phase 6 legal pages
  components/map/
  components/scheme/
  components/tour/              # Lazy-loaded viewer
  lib/supabase/
  lib/schema/                   # Zod + generated DB types
  lib/geo/
  stores/
supabase/
  migrations/                   # Ordered SQL (replaces ad-hoc schema.sql as source of truth)
  functions/
  seed/
docs/
  CONTENT.md                    # Editor runbook (Phase 4 deliverable)
```

### Remove / do not carry forward

- Convex (all usage and folder as dead code after migration)
- Clerk
- Property listing UX: `(protected)/properties`, list-property, property favourites-as-listings, chatbot, `/api/chat`
- Legacy marketing routes not in book (Buy/Rent/Sell flows, etc.)
- Current Supabase tables: `properties`, old `favorites` (listing-based)

### Keep / reuse

- Supabase project and publishable key (`.env.local`)
- Mapbox dependency and patterns
- Tailwind, shadcn components, auth-provider pattern (rewired to Supabase roles)

---

## 3. Data model & Supabase

Implement Part B.4 from `PROJECT_REQUIREMENT.MD` via **numbered migrations** in `supabase/migrations/`.

### Extensions & enums

- PostGIS
- `tour_kind`: `embed`, `native_360`, `external_link`
- `tour_state`: `unchecked`, `verified`, `broken`, `pending_permission`, `rejected`
- `tier`: `ultra`, `premium`, `upper`

### Tables

`cities`, `developers`, `schemes`, `tours`, `scenes`, `media`, `favs`, `events`, `audit_log`, `profiles` — as defined in the book.

Additional for embed-first security:

- **`embed_allowlist`**: `host text primary key`, `label text`, `created_at` — hosts permitted in iframes.

### Key RPC / views

- **`map_schemes(p_city text) → jsonb`**: GeoJSON FeatureCollection for published schemes only; properties include `slug`, `name`, `short`, `tier`, `color`, `has_tour` (exists verified tour).
- **`scheme_public(p_slug text)`** (recommended): single scheme payload for drawer — scheme, developer, media, verified tours (primary flagged).
- **`save_scheme_geom(...)`**: editor RPC — validate geometry, precision, audit fields.

### Row Level Security (summary)

- **Anon/authenticated read:** published schemes; tours with `state = 'verified'` on published schemes; cities/developers.
- **`favs`:** user CRUD own rows only (`auth.uid()`).
- **`events`:** insert for analytics (proxy rate limit via Edge Function when added); select admin only.
- **Writes** on schemes/tours/scenes/media: `profiles.role in ('editor','admin')` via `is_editor()` helper.
- **`profiles.role`:** admin only.
- **`permissions` bucket metadata:** admin only.

### Storage buckets

| Bucket | Access |
|--------|--------|
| `media` | public read, editor write |
| `panos` | public read, editor write (native 360, secondary) |
| `tour-bundles` | public read, editor write (future static exports) |
| `permissions` | private, admin |

### Auth

- Supabase **magic link** + **Google OAuth**
- Trigger: create `profiles` with `role = 'user'`
- Browse map and schemes without login; favourites require auth

### Embed-first content rules

- Primary launch tours: `kind = embed`, `state = verified`, `owner` and `licence` required before publish
- URL host must be on `embed_allowlist`
- Manual verification gate before `verified` (no auto-live unchecked tours)

### Data verification gates

- `select map_schemes('lahore')` returns valid GeoJSON under ~1 MB
- Anon cannot SELECT unpublished scheme
- User A cannot read user B favourites
- pgTAP tests per policy when CI enabled

---

## 4. Map UX & routing

### Routes

| Route | Purpose |
|-------|---------|
| `/` | Full-screen Lahore map, search, filters, legend |
| `/s/[slug]` | Map + scheme drawer (sheet mobile / panel desktop) |
| `/s/[slug]/tour` | Full-screen TourViewer |
| `/admin/*` | Editor/admin tools |
| `/favourites` | Optional list of saved schemes (auth) |
| `(auth)/*` | Sign in / sign up |

### Map behavior

- Center/zoom from `cities` row for `lahore`; zoom 9–18; max bounds around Greater Lahore
- GeoJSON source from `map_schemes('lahore')`
- Layers: `schemes-fill`, `schemes-line`, `schemes-label` (labels from zoom 12)
- Hover: `feature-state`, pointer cursor, name chip
- Click: navigate to `/s/[slug]`, `fitBounds` (pitch ~55, bearing ~−17, ~1600ms), persist prior camera in Zustand
- Back: restore camera from store

### Filters & search

- Client-side **fuse.js** on names + aliases
- Tier chips; “Has tour” toggle — adjust opacity/visibility via expressions or feature-state, not refetch

### Drawer

- Name, developer, blurb, media carousel, approval + source
- Disclaimer: boundaries indicative, not for legal use
- **Enter tour** enabled only when verified primary tour exists
- Favourite toggle (auth), share URL

### Legacy URLs

- Redirect or 404 old property routes to `/`

---

## 5. Tour viewer (embed-first)

Single **`TourViewer`** with strategy by `tours.kind`:

### Shared chrome

Close (→ `/s/[slug]`, restore map), Share, Fullscreen, Report broken tour → `events.kind = tour_report`

### `embed` (primary)

- Sandboxed iframe; allowlist check on URL host
- Credit from `owner`
- Analytics: `tour_open`, load success via iframe onLoad + timeout fallback

### `external_link` (secondary)

- Interstitial then new tab (`noopener noreferrer`)

### `native_360` (secondary, built not launch-focused)

- Dynamic import Pannellum (or Marzipano)
- Scenes, hotspots, strip; panos from Storage
- Minimap inset when scene positions exist

### Failure UX

Retry, link to developer, report button; never blank silent iframe

### Audit pipeline (Phase 4)

- Scheduled Edge Function `audit-tours`: HEAD/GET URLs, `audit_log`, mark `broken` after 3 failures
- Broken tours hidden from Enter tour

---

## 6. Admin & content pipeline

### Admin modules

- Dashboard (status counts, clicks from `events`)
- Scheme CRUD + publish toggle
- Polygon editor (Mapbox Draw, satellite toggle, RPC save with validation)
- Tour manager (embed-first UI defaults), audit queue, allowlist CRUD
- Media upload
- GeoJSON import preview
- Native scene tools after embed path stable

### Edge Functions

- `audit-tours` (scheduled)
- `resize-pano` (on upload)
- `import-geojson`
- Optional `track-event` rate limiter

### Content sprint (Phase 5, book A.2)

1. Candidate Lahore schemes (P0/P1)
2. Track tour URLs, permissions, owners
3. Trace polygons in admin
4. Publish only when: reviewed polygon + verified tour + owner + licence
5. **Launch gate:** ≥5 live Lahore schemes with verified tours

### Documentation

- `docs/CONTENT.md` — editor runbook
- This spec — engineering design reference

---

## 7. Implementation phases (book alignment)

| Phase | Focus | Gate |
|-------|--------|------|
| 0 | Rip legacy code, migrations, env, types, CI stub | Blank app reads `cities` |
| 1 | Custom style, map shell, layers, interaction, seed polygons | Mobile perf; hit-test; parser tests |
| 2 | Drawer, TourViewer embed + allowlist, deep links | Playwright map → tour → back |
| 3 | Auth, favs, events | RLS tests pass |
| 4 | Admin, edge functions, CONTENT.md | Editor publishes scheme in &lt;20 min |
| 5 | Content sprint | ≥5 verified Lahore schemes |
| 6 | CSP, a11y, Sentry, legal, soft launch | Lighthouse a11y ≥90 |

---

## 8. Assumptions & open items

| Item | Assumption |
|------|------------|
| UI language | English only at launch |
| Map palette | Book B.2 teal/sand until brand confirmed |
| Prices / plots | Excluded v1 |
| User story file | Not provided; reconcile when uploaded (book C.10) |
| Mapbox Studio style | Created in Phase 1; URL in env |

---

## 9. Success criteria (v1 done)

From book C.9, adapted to this stack:

- Custom-styled Lahore map on production domain
- ≥5 verified schemes with clickable polygons
- Click → fly-in → tour → back restores map
- RLS verified; no secrets in client; CSP in Phase 6
- Admin onboards scheme without engineering
- Analytics: scheme clicks and tour opens recorded
- CONTENT runbook + this spec in `docs/`

---

## 10. Next step

After approval of this file: invoke **writing-plans** to produce `docs/superpowers/plans/2026-10-07-panora-map-rebuild.md` with bite-sized implementation tasks. **No application code** until the implementation plan is reviewed.
