-- =============================================================================
-- Panora – Lahore seed data
-- Run AFTER the migration: 202610070001_init_postgis.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Lahore city
-- ---------------------------------------------------------------------------
insert into public.cities (slug, name, center, zoom, live)
values (
  'lahore',
  'Lahore',
  st_point(74.3587, 31.5204)::geography,   -- lng, lat  (Gulberg centre)
  11,
  true
)
on conflict (slug) do update
  set name   = excluded.name,
      center = excluded.center,
      zoom   = excluded.zoom,
      live   = excluded.live;

-- ---------------------------------------------------------------------------
-- 2. Sample developers (two common Lahore housing names)
-- ---------------------------------------------------------------------------
insert into public.developers (name, site)
values
  ('DHA Lahore',    'https://dhalahore.org'),
  ('Bahria Town',   'https://bahria.com')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Embed allowlist – pre-populate common safe 360 hosts
-- ---------------------------------------------------------------------------
insert into public.embed_allowlist (host, label)
values
  ('my.matterport.com',    'Matterport'),
  ('momento360.com',        'Momento360'),
  ('roundme.com',           'Roundme'),
  ('kuula.co',              'Kuula'),
  ('vrway.com',             'VRWay'),
  ('tours.panoraproperties.com', 'Panora Properties')
on conflict (host) do nothing;

-- ---------------------------------------------------------------------------
-- Next: run supabase/seed/lahore-schemes.sql for demo polygons + tours.
-- Smoke: select map_schemes('lahore');
-- ---------------------------------------------------------------------------
