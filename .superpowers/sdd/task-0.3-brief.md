### Task 0.3: PostGIS migration (schema v1)

**Files:**
- Create: `supabase/migrations/202610070001_init_postgis.sql`
- Create: `supabase/seed/lahore.sql`
- Replace/archive: `supabase/schema.sql` → short README pointing to migrations

**Interfaces:**
- Produces: `map_schemes(p_city text) returns jsonb`
- Produces: `scheme_public(p_slug text) returns jsonb` (drawer payload)
- Produces: `embed_allowlist(host text primary key, label text, created_at timestamptz)`
- Produces: `save_scheme_geom` RPC for editors (validate ST_IsValid)
- Produces: `is_editor()` security definer helper for RLS

**Requirements:**
Copy enums/tables/RLS from `PROJECT_REQUIREMENT.MD` Part B.4–B.5:
- cities, developers, schemes, tours, scenes, media, favs, events, audit_log, profiles
- tour_kind, tour_state, tier enums
- map_schemes function as in book
- RLS policies per book B.5
- handle_new_user trigger for profiles (role default 'user')
- Drop old listing tables if they exist: properties, favorites (from prior app)

**Seed (`supabase/seed/lahore.sql`):**
- Insert lahore city row (center 74.3587, 31.5204, zoom 11, live=true)
- Optional: 1-2 developers, no schemes yet OR 1 tiny test polygon unpublished

**Do NOT** require Supabase CLI push to succeed in CI — migration file must be valid SQL.

**Verification:** Document in report how to run in Supabase SQL editor:
`select map_schemes('lahore');` → empty FeatureCollection OK.

Commit: "feat(db): add PostGIS schema for schemes and tours"
