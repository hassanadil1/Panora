Panora-Properties: Development Book
An agent-executable build manual for a Mapbox + Supabase + TypeScript app where users explore Lahore's high-end housing schemes on a custom-styled map and enter each scheme's virtual tour by clicking its polygon. Prepared 7 October 2026.
How to use this book
This book is written so a coding agent can execute it top to bottom. Part A is research and scope. Part B is architecture and data. Part C is the phased build plan with tasks and acceptance criteria. Every task has a definition of done. Do not skip the verification gates; they exist because several facts in this domain (virtual tour availability, scheme boundaries, licensing) cannot be assumed.
Note on your story: no story file arrived in this chat (the uploads folder was empty). This book therefore follows your written brief in the message. When you upload the story, the agent should reconcile it with Part A.3 (product spec) and amend names, tone and flows. Anything marked ASSUMPTION is a default to confirm.
Part A: Research and Scope
A.1 Research method and honesty about confidence
I searched the public web for Lahore's high-end schemes and for evidence of virtual tours. Findings fall in two classes:
• Market facts (which schemes are premium, what they contain): well supported by property-portal guides.
• Virtual tour availability: poorly documented publicly. Search surfaced only a few confirmed cases. Most schemes publish photo galleries, drone videos or sales-office walkthroughs rather than navigable 360 tours, and tour URLs change often.
Therefore the app must not hard-code a belief about which schemes have tours. Instead, Part B includes a Tour Audit pipeline and a tour_status field, and the launch list below is a candidate list with confidence levels, to be verified by the agent and by a human before publishing.
A.2 Lahore high-end schemes: candidate list
Confidence column: Confirmed means I found direct evidence of a virtual or 360 tour. Candidate means premium and plausible but a tour was not confirmed; the audit must check.
#
Scheme / sub-project
Why it is high-end
Tour evidence
Launch priority
1
DHA Lahore: Phases 5, 6, 7, 8 and neighbours
The flagship premium society, widely described as the most sought-after in the city; plots from small marla sizes up to kanals; 10-marla plots in Phase 8 averaged about PKR 93.6 lakh in one portal analysis
Candidate for the society itself
P0
2
DHA Penta Square (CCA, Phase 5)
DHA-owned mall, apartments and corporate block
Confirmed: its own site was reported to offer virtual tours of model apartments
P0
3
Defence Raya (golf community inside DHA, Phase 6)
Golf-course premium community
Candidate
P0
4
Bahria Town Lahore (Sectors A to F and beyond)
Master-planned, own utilities, themed landmarks, hospital, golf
Candidate
P0
5
Bahria Nasheman
Bahria's large project near the airport with Zinia, Iris and Sunflower sectors
Confirmed (a 360-style tour of the society was shot by a portal-registered agent and published on a property portal; ownership of that tour is third party, so licensing must be sorted)
P1
6
Bahria Orchard
Bahria project popular for mid-premium homes
Candidate
P1
7
Park View City Lahore and Park View Villas (Vision Group)
Developer with premium positioning across Lahore, Islamabad and Karachi
Candidate
P1
8
Eden City / Air Avenue area near DHA Phase 8
Premium cluster near DHA Phase 8
Candidate
P2
9
Lake City (Golf and Country Club)
Gated, golf club, Ring Road access
Candidate
P1
10
Central Park Housing Scheme
Named among top Lahore schemes by a portal
Candidate
P2
11
New Lahore City
Named among top schemes by the same portal
Candidate
P2
12
DHA Phase 11 (Rahbar)
DHA extension, smaller plots
Candidate
P2
13
Gulberg, Model Town, Cantt, Askari
Legacy premium localities, not single gated schemes
Candidate (mostly no scheme-owned tour)
P3, treat as areas not schemes
14
Wapda Town, Etihad Town, LDA City, Al Jalil Garden
Established mid-market schemes
Out of scope for "high-end" v1
Backlog
Rule for v1 launch: only schemes whose tour_status is verified appear as clickable polygons in the live map. Others render as dimmed "coming soon" outlines if you want to show breadth, or are hidden. Start with a minimum of 5 verified schemes or the demo will feel empty; if fewer than 5 are found, commission tours (A.5).
A.3 Pakistan expansion list (Phase 2 onward)
These come from public descriptions of each developer's footprint. Treat all tour availability as Unverified until audited.
City
Candidate schemes
Notes
Islamabad / Rawalpindi
DHA Islamabad (phases 1 to 5, DHA Valley), Bahria Town Rawalpindi/Islamabad (nine phases across two compounds), Bahria Enclave, Park View City Islamabad (Zone IV, Margalla foothills, CDA NOC reported)
Largest second market; Bahria and DHA both have scale
Karachi
DHA Karachi, Bahria Town Karachi (launched 2015, the largest Bahria community), Bahria Golf View Terrace apartments (upcoming at last report)
Large premium market
Peshawar
Bahria Town Peshawar (planned near the M-2 per public descriptions; confirm status)
Status uncertain, verify
Sindh interior
Bahria Town Nawabshah
Lower priority
Other DHA cities
DHA in Multan, Gujranwala, Bahawalpur and others
ASSUMPTION: check current status before scoping
Expansion order recommendation: Lahore, then Islamabad/Rawalpindi, then Karachi, then others. The data model (Part B) is city-agnostic so expansion is a data task, not a code task.
A.4 Pitfalls found in research
• Scheme names collide (several "Park View" and "Eden" projects, DHA phase numbering that differs between marketing and legal names). Use a canonical slug plus aliases.
• Developer sites get hacked or move; tour links rot. Run a nightly link checker.
• Plot and price data on portals is dated (some figures cited are from 2019 to 2020 analyses). Do not display prices in v1 unless sourced and dated.
• Regulatory approval status (LDA, CDA, DHA's own) matters to buyers; show an approval_status field only with a source URL.
A.5 Where virtual tours come from (three sourcing routes)
1. Developer-owned tours. Embed via link or iframe where permitted. Needs written permission. Cheapest, least control.
2. Third-party agent tours. Same permission issue; also quality varies.
3. Commissioned or partnered capture. Shoot 360 panoramas (drone plus ground) and host them yourself. Highest control and the strongest product moat. Matches the 3DVista and 360 skills in your existing tour work, so this is the route I recommend as your differentiator.
Decision ASSUMPTION: v1 supports all three through a tour_provider field: embed, native_360, external_link.
A.6 Product spec
Core user story. A visitor opens the app and sees a real map of Lahore rendered in a distinctive custom colour style. Verified schemes appear as translucent coloured polygons. Hovering highlights a polygon and shows a name chip. Clicking flies the camera into the scheme, then opens its virtual tour in a full-screen viewer. A back control returns to the map at the previous camera position.
Screens.
1. Map home (Lahore). Search box, filter chips (tour type, tier), legend.
2. Scheme detail drawer (slide-up on mobile, side panel on desktop): name, developer, short description, tour entry button, photos, key facts, source links.
3. Tour viewer: full-screen, scene list, minimap with current position, share, exit.
4. Admin (role-gated): scheme CRUD, polygon editor, tour upload and audit queue, user management.
5. Auth screens: email magic link and Google; browsing needs no login, saving favourites does.
Non-goals for v1: buying, payments, chat, price listings, agent marketplace.
Success metrics: map interactive under 3 seconds on a mid-range phone over 4G; click-to-tour under 2 seconds; at least 5 verified schemes; tour completion rate tracked.
Part B: Architecture and Data
B.1 Stack decisions
Layer
Choice
Reason
Language
TypeScript everywhere, strict: true
Your requirement
Frontend
React 18 + Vite + TypeScript
Fast dev loop; no SSR needed for a map app
Map
Mapbox GL JS v3 via react-map-gl
Custom style, GeoJSON fill layers, camera animation
State
Zustand for UI state, TanStack Query for server state
Small, typed
Backend
Supabase: Postgres + PostGIS, Auth, Storage, Edge Functions, Realtime
Your requirement; PostGIS stores polygons
Tour viewer
Pannellum or Marzipano (open source 360) for native tours; iframe sandbox for embeds
No licence fees; 3DVista export can be hosted as static files in Storage
Styling
Tailwind CSS
Consistent design tokens
Validation
Zod, shared between client and Edge Functions
One schema source
Testing
Vitest, Playwright, pgTAP for SQL
Covers unit, e2e, DB
CI/CD
GitHub Actions; deploy frontend to Vercel or Cloudflare Pages; Supabase CLI migrations
Reproducible
Monitoring
Sentry, Supabase logs, Mapbox usage dashboard
Know when the map breaks
Repository layout (monorepo, pnpm workspaces):
panora/
  apps/web/            # React app
  apps/admin/          # Admin UI (can share web build, route-gated)
  packages/schema/     # Zod schemas + generated DB types
  packages/geo/        # Polygon helpers, simplification, validation
  supabase/
    migrations/        # SQL, ordered
    functions/         # Edge Functions
    seed/              # Seed GeoJSON and scheme rows
    tests/             # pgTAP
  scripts/             # tour audit, import, tile build
  docs/                # This book, ADRs
B.2 Mapbox: the custom coloured Lahore map
Style. Create a custom style in Mapbox Studio starting from a monochrome base, then apply your own palette so the map is recognisably yours. Suggested palette (ASSUMPTION, change freely): deep teal land (#0f2a2e), lighter teal parks (#1f5a54), muted sand roads (#c9b38a), dim water (#14394a), faint labels (#a9c1bd). Polygons then use a vivid contrasting accent set (amber, coral, violet, mint) so they pop against the dark base.
Rules for a good style here.
• Reduce label density; keep scheme names as your own layer so they are not drowned by basemap labels.
• Keep roads visible enough that users can orient to DHA and Bahria Town by recognised roads (Ring Road, Canal Road, Ferozepur Road, GT Road).
• Test the style at zoom 10 to 17 on a phone.
• Publish the style, store its mapbox://styles/... URL in an env var; never hard-code.
Token handling. Create a public token restricted by URL to your domains, and a separate secret token for any server-side tilesets upload. Never commit tokens. Frontend reads VITE_MAPBOX_TOKEN.
Polygon layers. Render schemes as a GeoJSON source with three layers:
1. schemes-fill: fill type, fill-color driven by a tier or colour_key property, fill-opacity expression: 0.18 default, 0.38 on hover (feature-state), 0.0 for hidden.
2. schemes-line: line type, 1.5 px, same colour at higher opacity.
3. schemes-label: symbol type with text-field from short_name, shown from zoom 12.
Use feature-state for hover and selected to avoid re-rendering the source.
Click behaviour. On click of schemes-fill: read slug from feature properties, push route /s/:slug, then map.fitBounds(bounds, { padding, pitch: 55, bearing: -17, duration: 1600 }), then open the drawer, and the Enter tour button opens the viewer. Persist previous camera in the store for the back action.
Performance. Keep the GeoJSON under about 1 MB by simplifying polygons (ST_SimplifyPreserveTopology with a tolerance around 0.00001 degrees) and rounding coordinates to 6 decimals. If you pass about 200 schemes or go nationwide, switch to a Mapbox Tileset (upload via the Tilesets API or MTS) and use vector tiles instead.
B.3 Where polygons come from
No public, authoritative scheme boundary dataset is guaranteed. Options, in order of preference:
1. OpenStreetMap boundaries (landuse=residential, place=neighbourhood) where they exist; credit OSM and respect the ODbL licence.
2. Developer master plans: trace manually over the basemap.
3. Satellite tracing by an editor in the admin polygon tool.
Every polygon row stores source and verified_by and verified_at. Polygons are approximate representations; show a small disclaimer in the drawer ("boundaries indicative, not for legal use").
B.4 Supabase data model
Enable PostGIS first. Migrations are numbered SQL files in supabase/migrations/.
create extension if not exists postgis;

create type tour_kind as enum ('embed','native_360','external_link');
create type tour_state as enum ('unchecked','verified','broken','pending_permission','rejected');
create type tier as enum ('ultra','premium','upper');

create table cities (
  id serial primary key,
  slug text unique not null,
  name text not null,
  center geography(point,4326) not null,
  zoom real not null default 11,
  live boolean not null default false
);

create table developers (
  id serial primary key,
  name text unique not null,
  site text
);

create table schemes (
  id uuid primary key default gen_random_uuid(),
  city_id int not null references cities,
  dev_id int references developers,
  slug text unique not null,
  name text not null,
  short_name text,
  aliases text[] default '{}',
  tier tier not null default 'premium',
  color_key text not null default 'amber',
  blurb text,
  geom geometry(multipolygon,4326) not null,
  center geometry(point,4326) generated always as (st_pointonsurface(geom)) stored,
  approval text,
  approval_src text,
  geom_src text not null,
  geom_by uuid references auth.users,
  geom_at timestamptz,
  published boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index schemes_geom_gix on schemes using gist (geom);
create index schemes_city_ix on schemes (city_id) where published;

create table tours (
  id uuid primary key default gen_random_uuid(),
  scheme_id uuid not null references schemes on delete cascade,
  kind tour_kind not null,
  title text not null,
  url text,
  storage_path text,
  owner text not null,
  licence text not null,
  permission_doc text,
  state tour_state not null default 'unchecked',
  checked_at timestamptz,
  is_primary boolean not null default false
);
create unique index one_primary on tours (scheme_id) where is_primary;

create table scenes (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references tours on delete cascade,
  ord int not null,
  name text not null,
  pano_path text not null,
  yaw real default 0, pitch real default 0, hfov real default 100,
  pos geometry(point,4326),
  hotspots jsonb not null default '[]'
);

create table media (
  id uuid primary key default gen_random_uuid(),
  scheme_id uuid not null references schemes on delete cascade,
  path text not null, alt text, credit text, ord int default 0
);

create table favs (
  user_id uuid references auth.users on delete cascade,
  scheme_id uuid references schemes on delete cascade,
  primary key (user_id, scheme_id)
);

create table events (
  id bigserial primary key,
  user_id uuid,
  anon_id text,
  scheme_id uuid,
  kind text not null,
  meta jsonb,
  at timestamptz default now()
);

create table audit_log (
  id bigserial primary key,
  tour_id uuid references tours on delete cascade,
  http_status int, ok boolean, note text,
  at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'user' check (role in ('user','editor','admin'))
);
Public read view. Expose only what the client needs, as GeoJSON, through a function so the client makes one request:
create or replace function map_schemes(p_city text)
returns jsonb language sql stable security invoker as $$
  select jsonb_build_object('type','FeatureCollection','features',
    coalesce(jsonb_agg(jsonb_build_object(
      'type','Feature','id', row_number() over (),
      'geometry', st_asgeojson(st_reduceprecision(s.geom,0.000001))::jsonb,
      'properties', jsonb_build_object(
        'slug',s.slug,'name',s.name,'short',coalesce(s.short_name,s.name),
        'tier',s.tier,'color',s.color_key,
        'has_tour', exists(select 1 from tours t where t.scheme_id=s.id and t.state='verified')
    ))),'[]'::jsonb))
  from schemes s join cities c on c.id=s.city_id
  where c.slug=p_city and s.published
$$;
Acceptance: select map_schemes('lahore') returns a valid FeatureCollection under 1 MB with only published schemes.
B.5 Row Level Security
Turn RLS on for every table. Policies:
• schemes, tours, scenes, media, cities, developers: select allowed to everyone, but only rows where published (schemes) or whose scheme is published and tour state='verified'.
• Writes on those tables: only users whose profiles.role in ('editor','admin'). Use a security definer helper is_editor().
• favs: a user reads and writes only rows where user_id = auth.uid().
• events: insert allowed for anyone (anonymous analytics), select only admin.
• audit_log, profiles: admin only; profiles.role can be changed only by admin.
Write a pgTAP test per policy: anonymous cannot read an unpublished scheme; an editor can; a user cannot read another user's favourites.
B.6 Storage buckets
• panos (public read, editor write): 360 equirectangular images, tiled variants.
• tour-bundles (public read, editor write): static exported tours (for example a 3DVista export folder). Serve with correct MIME types; set Cache-Control long and immutable with hashed filenames.
• media (public read): photos.
• permissions (private, admin only): scanned permission letters for third-party tours.
Images are resized on upload by an Edge Function into three widths (1024, 2048, 4096) plus a 256 preview.
B.7 Tour viewer design
One TourViewer React component with three strategies selected by tours.kind:
1. native_360: load scenes ordered by ord, render with Pannellum (multi-scene config) or Marzipano. Hotspots from scenes.hotspots (JSON: {type:'link', to:sceneId, yaw, pitch} or {type:'info', yaw, pitch, text}). Preload the next scene's preview image on hover of its hotspot. Show a scene strip at the bottom and a minimap using scenes.pos on the Mapbox map (small inset, current position marker).
2. embed: sandboxed iframe, sandbox="allow-scripts allow-same-origin allow-fullscreen", referrerpolicy="no-referrer", only for hosts in an allowlist table to prevent arbitrary embedding. Add a visible "powered by owner" credit.
3. external_link: open in a new tab with rel="noopener noreferrer" and show an interstitial that says the user is leaving the app.
All three share a chrome: close, share, fullscreen, "report a broken tour" button writing an events row of kind tour_report.
Mobile. Support gyroscope look-around (request permission on iOS) and touch drag. Lazy-load the viewer library only when a tour opens to keep map startup fast.
B.8 Tour Audit pipeline
Purpose: keep tour_status honest.
• Nightly Supabase scheduled Edge Function audit-tours: for each tours row of kind embed or external_link, issue a HEAD then GET request with a 10 second timeout, record status in audit_log, set state='broken' after 3 consecutive failures, and email admins.
• Verify the page actually looks like a tour: check for known markers in the HTML (3DVista, Matterport, Pannellum, Marzipano, krpano) and flag unchecked if none.
• Manual gate: a human opens each candidate once and sets state='verified', filling owner, licence and, where needed, permission_doc. No tour goes live without owner and licence fields filled.
B.9 Admin tool
Route /admin guarded by role. Features:
• Scheme list with status badges (published, tour state).
• Polygon editor: Mapbox GL Draw on the same custom style, with satellite toggle for tracing; save writes geom through an RPC that validates with ST_IsValid, snaps to precision 6 and rejects self-intersections. Show the area in acres and warn if it differs by more than 40 percent from the previous version.
• Tour manager: add tour, upload scenes in bulk (drag many panos, auto-order by filename), place hotspots by clicking in the viewer.
• Audit queue: broken and unchecked tours first.
• Import: upload GeoJSON to bulk create schemes (preview before commit).
B.10 Security and privacy
• Supabase anon key on the client; service role key only in Edge Functions and CI secrets.
• Rate-limit events inserts via an Edge Function proxy (per IP bucket) so analytics cannot be spammed.
• Enforce CSP: frame-src limited to the embed allowlist; img-src to your Storage and Mapbox; connect-src to Supabase and Mapbox.
• No personal data beyond email for favourites. Add a privacy page; support account deletion (cascade handles favourites).
• Do not store panoramas that show identifiable people or house numbers unless blurred; the capture checklist (C.7) covers it.
Part C: Phased Build Plan for the Agent
Each phase ends with a gate. Do not start the next phase until the gate passes. Code conventions: strict TypeScript, short clear names, minimal comments, no any, Zod validation at every boundary, small pure functions in packages/geo.
Phase 0: Foundations (day 1 to 2)
Task
Detail
Done when
0.1 Repo
pnpm monorepo per B.1, ESLint, Prettier, tsconfig strict
pnpm lint && pnpm typecheck pass
0.2 Supabase project
Create project, enable PostGIS, link CLI, supabase db push
Migrations apply on a fresh project
0.3 Env
.env.example with VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_MAPBOX_TOKEN, VITE_MAPBOX_STYLE
App boots, no secrets committed
0.4 CI
GitHub Actions: lint, typecheck, unit tests, pgTAP, Playwright smoke
Green on PR
0.5 Types
supabase gen types typescript into packages/schema
Types import cleanly
Gate 0: a blank Vite app deploys to preview and reads cities from Supabase.
Phase 1: The map (day 3 to 6)
Task
Detail
Done when
1.1 Style
Build and publish the custom Mapbox style (B.2 palette)
Style loads; screenshot approved
1.2 Map shell
react-map-gl full-screen map, centred on Lahore from cities, zoom limits 9 to 18, max bounds around the city
Pans and zooms smoothly on a phone
1.3 Schemes source
Call map_schemes('lahore'), add schemes-fill, -line, -label layers
Seed polygons appear
1.4 Interaction
Hover feature-state, pointer cursor, selected state, click handler with fitBounds fly-in and route /s/:slug
Click animates and URL updates; browser back returns to prior view
1.5 Legend and filters
Tier chips, "has tour" toggle, search by name or alias (client-side fuse.js)
Filtering changes polygon opacity, not the source
1.6 Seed data
Insert 3 seed schemes with rough polygons to test (DHA Phase 6 area, Bahria Town, Lake City) marked geom_src='rough-seed' and published=false until traced
Seeds render in dev only
Gate 1: Lighthouse performance 80 or above on mobile; polygons hit-test correctly at zoom 11 and 16; unit tests for the GeoJSON parser and camera helper.
Phase 2: Scheme detail and tour viewer (day 7 to 12)
Task
Detail
Done when
2.1 Drawer
Scheme drawer (bottom sheet mobile, right panel desktop), blurb, developer, media carousel, approval note with source
Renders for every published scheme
2.2 Viewer shell
TourViewer with strategy switch (B.7), full-screen route /s/:slug/tour
Opens and closes without map state loss
2.3 Native 360
Pannellum multi-scene from scenes, hotspots, scene strip, preview-first loading
Works with a 3-scene test tour
2.4 Embed and link
Allowlist-based iframe and interstitial
Non-allowlisted host is refused
2.5 Minimap
Inset map with current scene marker
Marker updates on scene change
2.6 Deep link and share
Share URL /s/:slug, Web Share API fallback to copy
Cold-load of URL lands inside the drawer
Gate 2: Playwright test: open home, click a seeded polygon, drawer appears, press Enter tour, viewer shows first scene, press close, map restored.
Phase 3: Auth, favourites, analytics (day 13 to 15)
• Supabase Auth: magic link and Google OAuth; profiles row created by trigger.
• Favourites toggle with optimistic update via TanStack Query.
• Events: map_open, scheme_click, tour_open, tour_scene, tour_exit, tour_report; anonymous id in local storage.
• Admin dashboard chart of clicks per scheme.
Gate 3: pgTAP RLS tests pass; a user cannot read others' favourites; anonymous browsing still works.
Phase 4: Admin and content pipeline (day 16 to 22)
• Build everything in B.9.
• Implement Edge Functions: audit-tours, resize-pano, import-geojson.
• Write the content runbook (docs/CONTENT.md): how to trace a polygon, how to add a tour, how to record owner and licence.
Gate 4: an editor with no code skills can add a scheme, trace a polygon, attach a tour, and publish it in under 20 minutes.
Phase 5: Content sprint for Lahore (parallel from Phase 1)
This is the real critical path; code is the easy part.
1. For each row in A.2, search for an official virtual or 360 tour. Record candidates in a sheet with columns: scheme, URL, owner, kind, quality score 1 to 5, permission status.
2. Email or WhatsApp the developer or sales office requesting permission to link or embed; log replies.
3. For schemes without any tour, scope a capture project (C.7).
4. Trace polygons using the admin tool (OSM first, then master plans, then satellite).
5. Review every polygon visually against the basemap and, where possible, against the developer's published master plan.
6. Publish only after owner, licence and a verified polygon exist.
Gate 5: at least 5 schemes live in Lahore, each with a verified tour and a reviewed polygon.
Phase 6: Hardening and launch (day 23 to 28)
• Performance budget: first map render under 3 s on throttled 4G; JS bundle for home under 250 KB gzip (viewer lazy-loaded).
• Accessibility: keyboard focus for drawer and viewer, labels on controls, reduced-motion respects prefers-reduced-motion (skip fly-in animation).
• Offline fallbacks: tour load failure shows retry and a link to the developer.
• Error tracking (Sentry), uptime check, Mapbox usage alert.
• Privacy page, terms, boundary disclaimer.
• Soft launch to 20 testers; collect tour_report events for a week.
Gate 6: zero critical bugs, Lighthouse accessibility 90 or above, rollback tested.
Phase 7: Pakistan expansion (after Lahore is stable)
Because the model is city-agnostic, each new city is a content sprint:
1. Insert the city (cities.live=false), set centre and zoom.
2. Repeat Phase 5 with the A.3 list for that city.
3. Create a city switcher in the UI (a dropdown with live cities; non-live shown as "coming soon").
4. Move to vector tiles when total polygons exceed about 200 or the GeoJSON passes 1 MB.
5. Add Urdu localisation (i18n with i18next, RTL layout support) before Karachi and Islamabad launches.
Suggested order: Islamabad/Rawalpindi, Karachi, then others. Re-verify each scheme's current status and approvals before listing.
C.7 Capture checklist (for self-produced 360 tours)
• Gear: 360 camera or DSLR with panoramic head, tripod; drone for aerial and master-plan overlays where legally permitted.
• Capture the gate, main boulevard, central park, clubhouse, a model home, and one sample street per tier.
• Shoot in even light; avoid people and number plates; blur anything identifiable.
• Export equirectangular JPEG at 8192 by 4096 minimum, sRGB, GPS tagged.
• Get a signed location release from the developer; store scans in the permissions bucket.
• Naming: scheme-slug_scene-03_gate.jpg so bulk upload orders and names scenes automatically.
• If you build tours in 3DVista, export as a static bundle and host it in tour-bundles; embed via the embed strategy from your own domain.
C.8 Risks and mitigations
Risk
Mitigation
Few schemes have usable tours
Capture sprint; start outreach in week 1; ship with fewer, higher-quality schemes
Developer objects to polygon or tour use
Permission log; takedown flow; boundaries labelled indicative
Inaccurate boundaries mislead buyers
Verified-by stamps, disclaimer, no legal claims
Mapbox cost grows
Restrict token, cache style, vector tiles, cap zoom, monitor usage
Link rot
Nightly audit, broken-state auto-hide
Licensing of OSM and third-party tours
Attribution in the map footer and drawer, record owner and licence per tour
Single scheme names ambiguous
Slugs and aliases, developer field
C.9 Definition of done for v1
• Custom-styled Lahore map live on production domain.
• At least 5 verified schemes with transparent, clickable polygons.
• Click enters the tour with smooth fly-in, and back returns correctly.
• RLS verified, no secrets exposed, CSP set.
• Admin can onboard a new scheme without engineering help.
• Analytics showing clicks and tour opens.
• Content runbook and this book kept in docs/.
C.10 Open questions to settle
1. Your story: please upload it so tone, character names and flows can be merged into Part A.6.
2. Palette and brand: confirm the colour direction in B.2.
3. Tour sourcing: partner outreach, commissioned capture, or both?
4. Languages: English first, Urdu at expansion, or both at launch?
5. Price and plot data: excluded from v1 unless you accept sourcing and dating responsibilities.