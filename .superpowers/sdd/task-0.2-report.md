# Task 0.2 Report — Remove legacy product surface

**Status:** Complete  
**Branch:** `feat/panora-map-rebuild`  
**Date:** 2026-10-07  

## Summary

Removed the legacy listings product (protected app routes, chatbot, Convex backend, Clerk integration) and replaced the home route with a minimal placeholder. Supabase auth remains via `AuthProvider`, sign-in/sign-up pages, and `src/lib/supabase/client.ts`.

## Commits

| SHA | Message |
|-----|---------|
| `7c1153a` | refactor: remove legacy listings, convex, and clerk |

## Deleted / removed

- `src/app/(protected)/` (all listing/virtual-tour pages)
- `src/app/api/chat/`, `src/app/api/webhooks/clerk/`
- `src/components/chatbot/`
- `convex/` (entire directory)
- `providers/convex-client-provider.tsx`
- Root duplicate `middleware.ts` (Clerk-era)
- `src/app/clerk-users/`
- Clerk/Convex sync scripts: `scripts/sync-clerk-users.ts`, `scripts/sync-users.ts`
- Untracked cleanup: `scripts/setup-supabase.mjs`, `scripts/demo-listings.mjs`, `src/hooks/use-panora-data.ts`, `src/lib/properties.ts` (removed from workspace; were not in prior commit)

## Modified / added

- `package.json` / `package-lock.json` — uninstalled `@clerk/nextjs`, `@clerk/backend`, `@clerk/clerk-sdk-node`, `convex`
- `tsconfig.json` — removed `@/convex/*` path alias
- `src/app/page.tsx` — placeholder: “Panora map — coming soon”
- `src/app/layout.tsx` — metadata updated; wraps children in Supabase `AuthProvider`
- `src/middleware.ts` — pass-through (Task 0.5 will restore auth routing)
- Auth pages and navbar retained (Supabase sign-in/sign-up; navbar still references legacy routes — acceptable until map shell lands)

## Gate 0.2 verification

```text
rg '@clerk|convex/' src/  →  no matches
```

## Build

```text
npm run build  →  exit 0
```

Routes after build: `/`, `/sign-in`, `/sign-up`, `/_not-found`.

## Notes

- `scripts/seed-properties.js` still references Convex (outside `src/`); not used by the app build. Consider removing in a later cleanup task.
- PostGIS / `supabase/` migrations intentionally **not** applied (Task 0.3).

## Next

Task 0.3 — PostGIS schema migrations.
