### Task 1.1: Map store and geo helpers

**Files:**
- Create: `src/stores/map-store.ts`
- Create: `src/lib/geo/bounds.ts`
- Test: `src/lib/geo/bounds.test.ts`

**Interfaces:**
- `useMapStore`: `saveCamera(view)`, `restoreCamera()`, `setHoveredSlug`, `setSelectedSlug`, camera state (lng, lat, zoom, bearing?, pitch?)
- `getBoundsFromFeature(feature: GeoJSON.Feature): [[number, number], [number, number]]` — SW/NE corners

**Verification:** `npm test` passes.

Do not commit unless user asks (Phase 0.4–0.5 also uncommitted).
