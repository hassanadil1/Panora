# Panora content runbook (editors)

## Publish checklist

1. **Polygon** — Trace or import a MultiPolygon (WGS84). Set `geom_src` and verification fields. Use admin or `save_scheme_geom` RPC.
2. **Metadata** — Name, slug, tier, colour key, blurb, developer link.
3. **Tour** — Prefer **embed** (Matterport). Record `owner`, `licence`, permission evidence.
4. **Allowlist** — Add the embed hostname to `embed_allowlist` before verifying the tour.
5. **Verify** — Set tour `state = verified` only after manual QA in iframe.
6. **Publish** — Set `published = true` only when polygon + verified primary tour are ready.

## SQL smoke tests

```sql
select map_schemes('lahore');
select scheme_public('dha-phase-6');
```

## Seed scripts (development)

1. `supabase/seed/lahore.sql` — city, developers, allowlist  
2. `supabase/seed/lahore-schemes.sql` — demo polygons and Matterport demo tours  

## Make yourself an editor

```sql
update public.profiles set role = 'admin' where id = '<your-auth-user-uuid>';
```
