# Task 1.1 Report — Map store and geo helpers

**Status:** Complete  
**Branch:** `feat/panora-map-rebuild`  
**Date:** 2026-10-07  

## Summary

Added Zustand map interaction state (camera snapshot, hover/selection slugs) and a GeoJSON bounds helper for scheme fly-in (Task 1.3).

## Files created

| File | Purpose |
|------|---------|
| `src/stores/map-store.ts` | `useMapStore` with camera fields, `saveCamera` / `restoreCamera`, `setHoveredSlug`, `setSelectedSlug` |
| `src/lib/geo/bounds.ts` | `getBoundsFromFeature` → SW/NE `[[lng, lat], [lng, lat]]` |
| `src/lib/geo/bounds.test.ts` | Square polygon bounds test |

## Interfaces

### `useMapStore` (`src/stores/map-store.ts`)

- **State:** `lng`, `lat`, `zoom`, optional `bearing` / `pitch` (defaults: Lahore center `74.3587`, `31.5204`, zoom `11`)
- **`saveCamera(view)`** — stores `view` in `savedCamera` for back-navigation restore
- **`restoreCamera()`** — applies saved camera to store, clears snapshot, returns restored view or `null`
- **`setHoveredSlug(slug | null)`**, **`setSelectedSlug(slug | null)`**

Exported type: `MapCameraView`.

### `getBoundsFromFeature(feature: GeoJSON.Feature)`

- Supports Point through MultiPolygon and GeometryCollection
- Returns Mapbox-style bounds: southwest corner then northeast corner
- Throws if geometry is missing or has no coordinates

## Verification

```text
npm test  →  exit 0
Test Files  2 passed (2)
Tests       4 passed (4)
```

Includes new `getBoundsFromFeature` square polygon case plus existing `parseMapGeoJson` tests.

## Notes

- No git commit (per task brief).
- Store is not wired to UI until Task 1.2–1.3 (`MapShell`, click/fly-in).

## Next

Task 1.2 — `MapShell`, `SchemeLayers`, `useMapSchemes`, home page map.
