-- Demo Lahore scheme polygons + tours (run after lahore.sql + migration)
-- Boundaries are approximate placeholders for development only.

insert into public.developers (name, site)
values ('Lake City', 'https://lakecitylahore.com')
on conflict (name) do nothing;

-- DHA Phase 6 (published + verified embed tour)
insert into public.schemes (
  city_id, dev_id, slug, name, short_name, aliases, tier, color_key, blurb,
  geom, geom_src, published
)
select
  c.id,
  d.id,
  'dha-phase-6',
  'DHA Phase 6',
  'DHA P6',
  array['DHA 6', 'Defence Phase 6'],
  'ultra',
  'amber',
  'Premium Defence corridor scheme with wide boulevards and park-facing plots.',
  st_geomfromgeojson(
    '{"type":"MultiPolygon","coordinates":[[[[74.438,31.485],[74.458,31.485],[74.458,31.502],[74.438,31.502],[74.438,31.485]]]]}'
  ),
  'rough-seed',
  true
from public.cities c
cross join public.developers d
where c.slug = 'lahore' and d.name = 'DHA Lahore'
on conflict (slug) do update set
  published = excluded.published,
  blurb = excluded.blurb,
  geom = excluded.geom;

-- Bahria Town (published, tour pending — tests has_tour filter off)
insert into public.schemes (
  city_id, dev_id, slug, name, short_name, tier, color_key, blurb,
  geom, geom_src, published
)
select
  c.id,
  d.id,
  'bahria-town-lahore',
  'Bahria Town Lahore',
  'Bahria',
  'premium',
  'coral',
  'Large master-planned community with themed sectors and commercial hubs.',
  st_geomfromgeojson(
    '{"type":"MultiPolygon","coordinates":[[[[74.165,31.335],[74.195,31.335],[74.195,31.365],[74.165,31.365],[74.165,31.335]]]]}'
  ),
  'rough-seed',
  true
from public.cities c
cross join public.developers d
where c.slug = 'lahore' and d.name = 'Bahria Town'
on conflict (slug) do update set published = excluded.published, geom = excluded.geom;

-- Lake City (published + verified tour)
insert into public.schemes (
  city_id, dev_id, slug, name, short_name, tier, color_key, blurb,
  geom, geom_src, published
)
select
  c.id,
  d.id,
  'lake-city-lahore',
  'Lake City Lahore',
  'Lake City',
  'upper',
  'mint',
  'Family-oriented development with lakefront promenade and golf course.',
  st_geomfromgeojson(
    '{"type":"MultiPolygon","coordinates":[[[[74.395,31.375],[74.420,31.375],[74.420,31.395],[74.395,31.395],[74.395,31.375]]]]}'
  ),
  'rough-seed',
  true
from public.cities c
cross join public.developers d
where c.slug = 'lahore' and d.name = 'Lake City'
on conflict (slug) do update set published = excluded.published, geom = excluded.geom;

-- DHA Phase 5 (published, verified tour)
insert into public.schemes (
  city_id, dev_id, slug, name, short_name, tier, color_key, blurb,
  geom, geom_src, published
)
select
  c.id,
  d.id,
  'dha-phase-5',
  'DHA Phase 5',
  'DHA P5',
  'premium',
  'violet',
  'Established Defence phase with mature landscaping and schools.',
  st_geomfromgeojson(
    '{"type":"MultiPolygon","coordinates":[[[[74.415,31.465],[74.435,31.465],[74.435,31.482],[74.415,31.482],[74.415,31.465]]]]}'
  ),
  'rough-seed',
  true
from public.cities c
cross join public.developers d
where c.slug = 'lahore' and d.name = 'DHA Lahore'
on conflict (slug) do update set published = excluded.published, geom = excluded.geom;

-- Park View City (published)
insert into public.schemes (
  city_id, dev_id, slug, name, short_name, tier, color_key, blurb,
  geom, geom_src, published
)
select
  c.id,
  d.id,
  'park-view-city',
  'Park View City',
  'PVC',
  'upper',
  'amber',
  'Accessible mid-market scheme with strong road links to Ring Road.',
  st_geomfromgeojson(
    '{"type":"MultiPolygon","coordinates":[[[[74.355,31.445],[74.375,31.445],[74.375,31.462],[74.355,31.462],[74.355,31.445]]]]}'
  ),
  'rough-seed',
  true
from public.cities c
cross join public.developers d
where c.slug = 'lahore' and d.name = 'DHA Lahore'
on conflict (slug) do nothing;

-- Verified embed tours (public Matterport demos — replace with licensed URLs in production)
insert into public.tours (scheme_id, kind, title, url, owner, licence, state, is_primary)
select s.id, 'embed', 'Model home walkthrough',
  'https://my.matterport.com/show/?m=SxQL3iGyoDo',
  'Matterport (demo)', 'Embed permitted for demo', 'verified', true
from public.schemes s where s.slug = 'dha-phase-6'
and not exists (select 1 from public.tours t where t.scheme_id = s.id and t.is_primary);

insert into public.tours (scheme_id, kind, title, url, owner, licence, state, is_primary)
select s.id, 'embed', 'Streetscape tour',
  'https://my.matterport.com/show/?m=8CkLnkC7p2F',
  'Matterport (demo)', 'Embed permitted for demo', 'verified', true
from public.schemes s where s.slug = 'lake-city-lahore'
and not exists (select 1 from public.tours t where t.scheme_id = s.id and t.is_primary);

insert into public.tours (scheme_id, kind, title, url, owner, licence, state, is_primary)
select s.id, 'embed', 'Boulevard preview',
  'https://my.matterport.com/show/?m=8CkLnkC7p2F',
  'Matterport (demo)', 'Embed permitted for demo', 'verified', true
from public.schemes s where s.slug = 'dha-phase-5'
and not exists (select 1 from public.tours t where t.scheme_id = s.id and t.is_primary);
