# Task 0.3 Report – PostGIS Schema Migration

**Date:** 2026-10-07  
**Branch:** `feat/panora-map-rebuild`  
**Status:** ✅ Complete

---

## Deliverables

| File | Description |
|------|-------------|
| `supabase/migrations/202610070001_init_postgis.sql` | Full PostGIS schema v1 |
| `supabase/seed/lahore.sql` | Lahore city + sample developers + embed allowlist |
| `supabase/schema.sql` | Replaced with deprecation notice pointing to migrations |

---

## Migration: `202610070001_init_postgis`

### Extensions enabled
- `postgis` – spatial geometry/geography types and functions
- `pgcrypto` – `gen_random_uuid()` polyfill for PG < 13

### Legacy tables dropped
- `public.properties` (cascade)
- `public.favorites` (cascade)

### Enums created
| Enum | Values |
|------|--------|
| `tour_kind` | `embed`, `native_360`, `external_link` |
| `tour_state` | `unchecked`, `verified`, `broken`, `pending_permission`, `rejected` |
| `tier` | `ultra`, `premium`, `upper` |

### Tables created
| Table | Key columns | Notes |
|-------|-------------|-------|
| `cities` | `slug`, `center geography(point,4326)`, `zoom`, `live` | |
| `developers` | `name unique`, `site` | |
| `schemes` | `geom geometry(multipolygon,4326)`, `center` (generated), `tier`, `published` | GiST + city index |
| `tours` | `scheme_id`, `kind`, `state`, `is_primary` | Unique index on `(scheme_id) where is_primary` |
| `scenes` | `tour_id`, `ord`, `pano_path`, `pos geometry(point,4326)`, `hotspots jsonb` | |
| `media` | `scheme_id`, `path`, `alt`, `credit`, `ord` | |
| `favs` | `(user_id, scheme_id)` composite PK | |
| `events` | `user_id`, `anon_id`, `scheme_id`, `kind`, `meta jsonb` | Insert-only for analytics |
| `audit_log` | `tour_id`, `http_status`, `ok`, `note` | Tour link-rot audit trail |
| `embed_allowlist` | `host` PK, `label` | Iframe CSP host control |
| `profiles` | `id → auth.users`, `role check('user','editor','admin')` | |

### Functions

#### `map_schemes(p_city text) → jsonb`
Returns a GeoJSON `FeatureCollection` of all **published** schemes for the given city slug.  
Each feature has: `slug`, `name`, `short`, `tier`, `color`, `has_tour`.  
Geometry is snapped to 6 decimal places via `ST_ReducePrecision`.

#### `scheme_public(p_slug text) → jsonb`
Full drawer payload for a single published scheme. Returns:
- Scheme fields (slug, name, tier, color_key, blurb, approval, …)
- `center` (`{lng, lat}`) derived from generated `center` column
- `geom` (GeoJSON MultiPolygon at 6dp)
- `developer` object (`id`, `name`, `site`) — `null` if no dev linked
- `media` array ordered by `ord`
- `tours` array (verified only for public callers), ordered primary first

#### `is_editor() → boolean` (security definer)
Returns `true` if `auth.uid()` has `role in ('editor','admin')` in `profiles`.  
Used as the gating check in all editor-only RLS policies.

#### `save_scheme_geom(p_scheme_id uuid, p_geom_geojson text) → jsonb`
Editor RPC for the admin polygon tool. Validates:
1. Caller is editor/admin (`is_editor()`)
2. Input is a valid `MULTIPOLYGON`
3. `ST_IsValid()` – rejects self-intersections
4. Snaps to 6dp via `ST_ReducePrecision`, sets SRID 4326
5. Calculates area delta % (warn if > 40% in the UI)

Returns `{ok, area_ha, area_delta_pct}` on success or `{ok:false, error}`.

#### `handle_new_user()` trigger
Fires `after insert on auth.users`.  
Inserts a `profiles` row with `role = 'user'`, `on conflict do nothing`.

---

## RLS Policies Summary

| Table | Public (anon) | Authenticated user | Editor/Admin |
|-------|---------------|-------------------|--------------|
| cities | SELECT | SELECT | ALL |
| developers | SELECT | SELECT | ALL |
| schemes | SELECT where published | SELECT where published | SELECT all + ALL |
| tours | SELECT where verified & scheme published | same | SELECT all + ALL |
| scenes | SELECT where tour verified & scheme published | same | ALL |
| media | SELECT where scheme published | same | ALL |
| favs | — | own rows only | own rows |
| events | INSERT | INSERT | SELECT (admin only) |
| audit_log | — | — | ALL (admin only) |
| embed_allowlist | SELECT | SELECT | ALL (admin only) |
| profiles | — | own row | admin reads all, admin updates role |

---

## Seed data (`supabase/seed/lahore.sql`)

- **Lahore** city row: center `(74.3587, 31.5204)`, zoom 11, `live = true`
- Two developers: `DHA Lahore`, `Bahria Town`
- Five embed allowlist entries: Matterport, Momento360, Roundme, Kuula, VRWay

---

## Verification

Run in the Supabase SQL editor (as anon role or service role):

```sql
-- Should return an empty FeatureCollection (no published schemes yet)
select map_schemes('lahore');
-- Expected: {"type":"FeatureCollection","features":[]}

-- Verify tables exist
select table_name from information_schema.tables
where table_schema = 'public'
order by table_name;

-- Verify Lahore city was seeded
select id, slug, name, st_astext(center::geometry), zoom, live
from cities;

-- Verify embed allowlist
select * from embed_allowlist;
```

---

## What was NOT done (out of scope for Task 0.3)

- pgTAP tests (Task 0.4)
- Supabase CLI push / CI pipeline (Task 0.4)
- Storage bucket configuration (Task 0.6)
- TypeScript type generation (Task 0.5)
- No Next.js routes were modified
