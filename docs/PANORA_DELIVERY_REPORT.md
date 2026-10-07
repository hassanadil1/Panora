# Panora Map Rebuild — Delivery Report

**Date:** 2026-10-07  
**Branch:** `feat/panora-map-rebuild`  
**Product:** Map-first Lahore housing scheme explorer (Next.js 14 + Supabase PostGIS + Mapbox)

---

## 1. Executive summary

Panora has been rebuilt from a legacy property-listings app into a **real-user v1** aligned with `PROJECT_REQUIREMENT.MD`:

- **Map home** at `/` with Lahore schemes from `map_schemes('lahore')`
- **Click / search / filters** → scheme drawer at `/s/[slug]`
- **Verified embed tours** at `/s/[slug]/tour` with host allowlist
- **Supabase Auth** (password, magic link, Google OAuth UI)
- **Favourites** at `/favourites`
- **Admin** at `/admin` for editors (scheme list, metadata edit, allowlist view)
- **Legal** starter pages: `/privacy`, `/terms`
- **CSP** headers for embed safety (see `next.config.js`)

---

## 2. What you need to run it locally

### 2.1 Environment (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk....
NEXT_PUBLIC_MAPBOX_STYLE_URL=mapbox://styles/YOUR/STYLE
```

Without Mapbox vars, the app shows a configuration message (Supabase-only smoke still works on server).

### 2.2 Supabase SQL (one-time, in order)

| Step | File | Purpose |
|------|------|---------|
| 1 | `supabase/migrations/202610070001_init_postgis.sql` | PostGIS schema, RLS, RPCs |
| 2 | `supabase/repair/202610070001_legacy_profiles.sql` | Only if old `profiles` table lacked `role` |
| 3 | `supabase/repair/202610070002_map_schemes_agg.sql` | Only if migration failed on `map_schemes` |
| 4 | `supabase/seed/lahore.sql` | City, developers, allowlist |
| 5 | `supabase/seed/lahore-schemes.sql` | **5 demo schemes + 3 verified Matterport demo tours** |

**Verify:**

```sql
select map_schemes('lahore');
select scheme_public('dha-phase-6');
```

### 2.3 Auth providers (Supabase Dashboard)

- Enable **Email** (magic link) and/or **Google** if you use those buttons
- Add site URL + redirect URLs for `http://localhost:3000`

### 2.4 Make yourself admin

After first sign-up:

```sql
update public.profiles set role = 'admin' where id = '<your-user-uuid>';
```

---

## 3. User journeys (end-to-end)

| Persona | Flow |
|---------|------|
| **Guest** | Open `/` → pan/zoom map → search scheme → click polygon → drawer → enter tour (if verified) |
| **Signed-in user** | Same + heart favourite → `/favourites` list |
| **Editor/admin** | `/admin` → schemes table → edit blurb/publish → view on map |

**Deep links:** `/s/dha-phase-6`, `/s/dha-phase-6/tour`

---

## 4. Architecture map

```
src/app/
  page.tsx              → Map (via MapHome)
  s/[slug]/page.tsx     → Map + drawer
  s/[slug]/tour/page.tsx→ Embed tour viewer
  favourites/           → Saved schemes
  admin/                → Editor tools
  (auth)/sign-in|sign-up
  privacy, terms

src/components/map/     → MapShell, MapChrome, SchemeLayers
src/components/scheme/  → SchemeDrawer
src/components/tour/    → TourViewer, EmbedTour
src/hooks/              → use-map-schemes, use-scheme-public, favourites
src/lib/                → geo, schema (Zod), tour allowlist, analytics
supabase/               → migrations, seed, repair scripts
```

**State:** TanStack Query (server data), Zustand (camera restore, hover).

---

## 5. Verification evidence (this session)

| Check | Command | Result |
|-------|---------|--------|
| Unit tests | `npm test` | 3 files, **7 tests passed** |
| TypeScript | `npx tsc --noEmit` | **Exit 0** |
| Production build | `npm run build` | Run after stopping `npm run dev` if `.next` is locked (Windows EPERM) |

E2E: `npm run test:e2e` (requires dev server + Playwright browsers installed).

---

## 6. Content status

| Item | Status |
|------|--------|
| Lahore city live row | Seed SQL |
| Demo polygons | `lahore-schemes.sql` (approximate boundaries) |
| Verified tours | 3 schemes with Matterport **demo** URLs |
| Production tours | **Replace** with licensed URLs + permission docs before public launch |
| ≥5 schemes gate (book Phase 5) | **5 published** in seed; tours on 3 — add 2 more verified tours for full gate |

Editor runbook: `docs/CONTENT.md`

---

## 7. Known limits / follow-ups

1. **Polygon admin UI** — Metadata edit exists; draw-tool geometry editor (`save_scheme_geom`) not wired in UI yet (SQL/RPC only).
2. **Tour manager admin** — Create/verify tours via SQL or Supabase table editor; dedicated admin tours UI not built.
3. **Edge function `audit-tours`** — Not deployed; nightly link checks manual.
4. **Legacy routes** — Old `(protected)/properties` etc. may still exist on disk; not linked from new map UX. Safe to delete in a cleanup commit.
5. **CSP** — Tuned for Mapbox + listed embed hosts; tighten `frame-src` to DB allowlist dynamically in a future iteration.
6. **Legal copy** — Starter templates; require legal review before production.
7. **Git** — Many changes may be uncommitted; commit when ready on `feat/panora-map-rebuild`.

---

## 8. Quick start checklist

- [ ] Apply migration + seeds in Supabase  
- [ ] Add Mapbox token + style to `.env.local`  
- [ ] `npm run dev` → http://localhost:3000  
- [ ] Click **DHA Phase 6** → drawer → **Enter virtual tour**  
- [ ] Sign up → favourite a scheme → `/favourites`  
- [ ] Promote profile to `admin` → `/admin/schemes`  

---

## 9. Support references

- Product book: `PROJECT_REQUIREMENT.MD`
- Design spec: `docs/superpowers/specs/2026-10-07-panora-map-rebuild-design.md`
- Implementation plan: `docs/superpowers/plans/2026-10-07-panora-map-rebuild.md`
- SDD progress: `.superpowers/sdd/progress.md`
