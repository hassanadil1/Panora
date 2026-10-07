-- =============================================================================
-- Panora Map – PostGIS Schema v1
-- Migration: 202610070001_init_postgis
-- Applies to: Supabase (PostgreSQL 15+, PostGIS 3.x)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
create extension if not exists postgis;
create extension if not exists pgcrypto;   -- gen_random_uuid() polyfill (PG < 13)

-- ---------------------------------------------------------------------------
-- 1. Drop legacy tables from the prototype app (if they exist)
-- ---------------------------------------------------------------------------
drop table if exists public.favorites cascade;
drop table if exists public.properties cascade;

-- ---------------------------------------------------------------------------
-- 2. Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.tour_kind  as enum ('embed','native_360','external_link');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.tour_state as enum (
    'unchecked','verified','broken','pending_permission','rejected'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.tier as enum ('ultra','premium','upper');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 3. Core tables
-- ---------------------------------------------------------------------------

-- cities
create table if not exists public.cities (
  id     serial  primary key,
  slug   text    unique not null,
  name   text    not null,
  center geography(point, 4326) not null,
  zoom   real    not null default 11,
  live   boolean not null default false
);

-- developers
create table if not exists public.developers (
  id   serial primary key,
  name text   unique not null,
  site text
);

-- schemes (the main map layer)
create table if not exists public.schemes (
  id          uuid    primary key default gen_random_uuid(),
  city_id     int     not null references public.cities,
  dev_id      int     references public.developers,
  slug        text    unique not null,
  name        text    not null,
  short_name  text,
  aliases     text[]  not null default '{}',
  tier        public.tier not null default 'premium',
  color_key   text    not null default 'amber',
  blurb       text,
  geom        geometry(multipolygon, 4326) not null,
  -- generated centroid for label / marker placement
  center      geometry(point, 4326)
    generated always as (st_pointonsurface(geom)) stored,
  approval     text,
  approval_src text,
  geom_src     text    not null,
  geom_by      uuid    references auth.users,
  geom_at      timestamptz,
  published    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists schemes_geom_gix  on public.schemes using gist (geom);
create index if not exists schemes_city_ix   on public.schemes (city_id) where published;

-- tours
create table if not exists public.tours (
  id             uuid           primary key default gen_random_uuid(),
  scheme_id      uuid           not null references public.schemes on delete cascade,
  kind           public.tour_kind not null,
  title          text           not null,
  url            text,
  storage_path   text,
  owner          text           not null,
  licence        text           not null,
  permission_doc text,
  state          public.tour_state not null default 'unchecked',
  checked_at     timestamptz,
  is_primary     boolean        not null default false
);

-- only one primary tour per scheme
create unique index if not exists one_primary
  on public.tours (scheme_id) where is_primary;

-- scenes (panorama frames inside a tour)
create table if not exists public.scenes (
  id         uuid    primary key default gen_random_uuid(),
  tour_id    uuid    not null references public.tours on delete cascade,
  ord        int     not null,
  name       text    not null,
  pano_path  text    not null,
  yaw        real    not null default 0,
  pitch      real    not null default 0,
  hfov       real    not null default 100,
  pos        geometry(point, 4326),
  hotspots   jsonb   not null default '[]'
);

-- media (photos attached to a scheme)
create table if not exists public.media (
  id        uuid  primary key default gen_random_uuid(),
  scheme_id uuid  not null references public.schemes on delete cascade,
  path      text  not null,
  alt       text,
  credit    text,
  ord       int   not null default 0
);

-- favourites
create table if not exists public.favs (
  user_id   uuid references auth.users    on delete cascade,
  scheme_id uuid references public.schemes on delete cascade,
  primary key (user_id, scheme_id)
);

-- analytics events (insert-only, anon friendly)
create table if not exists public.events (
  id        bigserial primary key,
  user_id   uuid,
  anon_id   text,
  scheme_id uuid,
  kind      text not null,
  meta      jsonb,
  at        timestamptz not null default now()
);

-- tour link-rot audit log
create table if not exists public.audit_log (
  id          bigserial primary key,
  tour_id     uuid references public.tours on delete cascade,
  http_status int,
  ok          boolean,
  note        text,
  at          timestamptz not null default now()
);

-- embed iframe allowlist (hosts allowed in frame-src CSP)
create table if not exists public.embed_allowlist (
  host       text primary key,
  label      text,
  created_at timestamptz not null default now()
);

-- user profiles (mirrors auth.users row)
create table if not exists public.profiles (
  id   uuid primary key references auth.users on delete cascade,
  role text not null default 'user'
    check (role in ('user','editor','admin'))
);

-- Upgrade legacy profiles from the old listings app (name/email/image_url, no role).
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'profiles'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'role'
  ) then
    alter table public.profiles
      add column role text not null default 'user'
      check (role in ('user','editor','admin'));
    alter table public.profiles drop column if exists name;
    alter table public.profiles drop column if exists email;
    alter table public.profiles drop column if exists image_url;
    alter table public.profiles drop column if exists updated_at;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Security-definer helper
-- ---------------------------------------------------------------------------

-- is_editor(): true when the calling user has role editor or admin.
-- SECURITY DEFINER so it can read profiles without exposing the table.
create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('editor', 'admin')
  )
$$;

-- ---------------------------------------------------------------------------
-- 5. handle_new_user trigger
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 6. RLS
-- ---------------------------------------------------------------------------

alter table public.cities         enable row level security;
alter table public.developers     enable row level security;
alter table public.schemes        enable row level security;
alter table public.tours          enable row level security;
alter table public.scenes         enable row level security;
alter table public.media          enable row level security;
alter table public.favs           enable row level security;
alter table public.events         enable row level security;
alter table public.audit_log      enable row level security;
alter table public.embed_allowlist enable row level security;
alter table public.profiles       enable row level security;

-- ── cities ──────────────────────────────────────────────────────────────────
drop policy if exists "cities: public read" on public.cities;
create policy "cities: public read"
  on public.cities for select
  using (true);

drop policy if exists "cities: editor write" on public.cities;
create policy "cities: editor write"
  on public.cities for all
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());

-- ── developers ───────────────────────────────────────────────────────────────
drop policy if exists "developers: public read" on public.developers;
create policy "developers: public read"
  on public.developers for select
  using (true);

drop policy if exists "developers: editor write" on public.developers;
create policy "developers: editor write"
  on public.developers for all
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());

-- ── schemes ──────────────────────────────────────────────────────────────────
drop policy if exists "schemes: published read" on public.schemes;
create policy "schemes: published read"
  on public.schemes for select
  using (published = true);

drop policy if exists "schemes: editor read all" on public.schemes;
create policy "schemes: editor read all"
  on public.schemes for select
  to authenticated
  using (public.is_editor());

drop policy if exists "schemes: editor write" on public.schemes;
create policy "schemes: editor write"
  on public.schemes for all
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());

-- ── tours ─────────────────────────────────────────────────────────────────────
drop policy if exists "tours: public read verified" on public.tours;
create policy "tours: public read verified"
  on public.tours for select
  using (
    state = 'verified'
    and exists (
      select 1 from public.schemes s
      where s.id = scheme_id and s.published
    )
  );

drop policy if exists "tours: editor read all" on public.tours;
create policy "tours: editor read all"
  on public.tours for select
  to authenticated
  using (public.is_editor());

drop policy if exists "tours: editor write" on public.tours;
create policy "tours: editor write"
  on public.tours for all
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());

-- ── scenes ────────────────────────────────────────────────────────────────────
drop policy if exists "scenes: public read verified" on public.scenes;
create policy "scenes: public read verified"
  on public.scenes for select
  using (
    exists (
      select 1 from public.tours t
      join public.schemes s on s.id = t.scheme_id
      where t.id = tour_id
        and t.state = 'verified'
        and s.published
    )
  );

drop policy if exists "scenes: editor write" on public.scenes;
create policy "scenes: editor write"
  on public.scenes for all
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());

-- ── media ─────────────────────────────────────────────────────────────────────
drop policy if exists "media: public read published" on public.media;
create policy "media: public read published"
  on public.media for select
  using (
    exists (
      select 1 from public.schemes s
      where s.id = scheme_id and s.published
    )
  );

drop policy if exists "media: editor write" on public.media;
create policy "media: editor write"
  on public.media for all
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());

-- ── favs ──────────────────────────────────────────────────────────────────────
drop policy if exists "favs: own read" on public.favs;
create policy "favs: own read"
  on public.favs for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "favs: own insert" on public.favs;
create policy "favs: own insert"
  on public.favs for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "favs: own delete" on public.favs;
create policy "favs: own delete"
  on public.favs for delete
  to authenticated
  using (user_id = auth.uid());

-- ── events ────────────────────────────────────────────────────────────────────
drop policy if exists "events: anyone insert" on public.events;
create policy "events: anyone insert"
  on public.events for insert
  with check (true);

drop policy if exists "events: admin select" on public.events;
create policy "events: admin select"
  on public.events for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ── audit_log ─────────────────────────────────────────────────────────────────
drop policy if exists "audit_log: admin only" on public.audit_log;
create policy "audit_log: admin only"
  on public.audit_log for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ── embed_allowlist ───────────────────────────────────────────────────────────
drop policy if exists "embed_allowlist: public read" on public.embed_allowlist;
create policy "embed_allowlist: public read"
  on public.embed_allowlist for select
  using (true);

drop policy if exists "embed_allowlist: admin write" on public.embed_allowlist;
create policy "embed_allowlist: admin write"
  on public.embed_allowlist for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ── profiles ──────────────────────────────────────────────────────────────────
-- Users read only their own profile; admins read all.
drop policy if exists "profiles: own read" on public.profiles;
create policy "profiles: own read"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "profiles: admin read" on public.profiles;
create policy "profiles: admin read"
  on public.profiles for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid() and p2.role = 'admin'
    )
  );

-- Only the trigger / service-role can insert profiles.
-- Role changes: admin only.
drop policy if exists "profiles: admin update role" on public.profiles;
create policy "profiles: admin update role"
  on public.profiles for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid() and p2.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid() and p2.role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- 7. Public read grants
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select on public.cities          to anon, authenticated;
grant select on public.developers      to anon, authenticated;
grant select on public.schemes         to anon, authenticated;
grant select on public.tours           to anon, authenticated;
grant select on public.scenes          to anon, authenticated;
grant select on public.media           to anon, authenticated;
grant select on public.embed_allowlist to anon, authenticated;
grant select on public.profiles        to authenticated;

grant select, insert, delete on public.favs to authenticated;

-- analytics: anyone may insert
grant insert on public.events to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 8. Public API functions
-- ---------------------------------------------------------------------------

-- 8.1  map_schemes – GeoJSON FeatureCollection for the map layer
create or replace function public.map_schemes(p_city text)
returns jsonb
language sql
stable
security invoker
as $$
  select jsonb_build_object(
    'type', 'FeatureCollection',
    'features', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'type',       'Feature',
            'id',         sub.fid,
            'geometry',   sub.geom,
            'properties', sub.props
          )
          order by sub.fid
        )
        from (
          select
            row_number() over (order by s.slug) as fid,
            st_asgeojson(
              st_reduceprecision(s.geom, 0.000001)
            )::jsonb as geom,
            jsonb_build_object(
              'slug',     s.slug,
              'name',     s.name,
              'short',    coalesce(s.short_name, s.name),
              'tier',     s.tier,
              'color',    s.color_key,
              'has_tour', exists (
                select 1 from public.tours t
                where t.scheme_id = s.id
                  and t.state = 'verified'
              )
            ) as props
          from public.schemes s
          join public.cities c on c.id = s.city_id
          where c.slug = p_city
            and s.published
        ) sub
      ),
      '[]'::jsonb
    )
  )
$$;

-- 8.2  scheme_public – full drawer payload for a single scheme
create or replace function public.scheme_public(p_slug text)
returns jsonb
language sql
stable
security invoker
as $$
  select jsonb_build_object(
    -- scheme fields
    'slug',        s.slug,
    'name',        s.name,
    'short_name',  s.short_name,
    'aliases',     s.aliases,
    'tier',        s.tier,
    'color_key',   s.color_key,
    'blurb',       s.blurb,
    'approval',    s.approval,
    'published',   s.published,
    'created_at',  s.created_at,
    -- geometry (centroid for info, full polygon for drawer mini-map)
    'center', jsonb_build_object(
      'lng', st_x(s.center::geometry),
      'lat', st_y(s.center::geometry)
    ),
    'geom', st_asgeojson(
               st_reduceprecision(s.geom, 0.000001)
             )::jsonb,
    -- developer
    'developer', case when d.id is not null then
      jsonb_build_object('id', d.id, 'name', d.name, 'site', d.site)
    else null end,
    -- media array ordered by ord
    'media', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id',     m.id,
          'path',   m.path,
          'alt',    m.alt,
          'credit', m.credit,
          'ord',    m.ord
        ) order by m.ord
      )
      from public.media m
      where m.scheme_id = s.id
    ), '[]'::jsonb),
    -- tours array (only verified for public callers)
    'tours', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id',          t.id,
          'kind',        t.kind,
          'title',       t.title,
          'url',         t.url,
          'owner',       t.owner,
          'licence',     t.licence,
          'state',       t.state,
          'is_primary',  t.is_primary
        ) order by t.is_primary desc, t.id
      )
      from public.tours t
      where t.scheme_id = s.id
        and t.state = 'verified'
    ), '[]'::jsonb)
  )
  from public.schemes  s
  left join public.developers d on d.id = s.dev_id
  where s.slug = p_slug
    and s.published
$$;

-- 8.3  save_scheme_geom – editor RPC that validates geometry before saving
create or replace function public.save_scheme_geom(
  p_scheme_id  uuid,
  p_geom_geojson text   -- GeoJSON MultiPolygon string
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_geom geometry;
  v_area numeric;
  v_prev_area numeric;
begin
  -- permission check
  if not public.is_editor() then
    raise exception 'Forbidden: editor role required' using errcode = 'PGRST';
  end if;

  -- parse and validate
  v_geom := st_geomfromgeojson(p_geom_geojson);

  if geometrytype(v_geom) <> 'MULTIPOLYGON' then
    return jsonb_build_object('ok', false, 'error', 'geometry must be MULTIPOLYGON');
  end if;

  if not st_isvalid(v_geom) then
    return jsonb_build_object(
      'ok',    false,
      'error', st_isvalidreason(v_geom)
    );
  end if;

  -- snap to 6 decimal places (≈ 0.11 m precision)
  v_geom := st_reduceprecision(v_geom, 0.000001);

  -- ensure SRID 4326
  v_geom := st_setsrid(v_geom, 4326);

  -- area delta warning (> 40% change)
  select st_area(geom::geography) / 10000.0 into v_prev_area
  from public.schemes where id = p_scheme_id;

  v_area := st_area(v_geom::geography) / 10000.0;

  update public.schemes
  set geom       = v_geom,
      geom_by    = auth.uid(),
      geom_at    = now(),
      updated_at = now()
  where id = p_scheme_id;

  return jsonb_build_object(
    'ok',             true,
    'area_ha',        round(v_area::numeric, 4),
    'area_delta_pct', case when v_prev_area > 0
                        then round(((v_area - v_prev_area) / v_prev_area * 100)::numeric, 1)
                        else null
                      end
  );
end;
$$;

-- grant execute to authenticated users (is_editor() check is inside)
grant execute on function public.map_schemes(text)        to anon, authenticated;
grant execute on function public.scheme_public(text)      to anon, authenticated;
grant execute on function public.save_scheme_geom(uuid, text) to authenticated;
grant execute on function public.is_editor()              to authenticated;
