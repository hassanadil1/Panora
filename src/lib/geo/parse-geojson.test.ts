import { describe, it, expect } from "vitest";
import { parseMapGeoJson } from "./parse-geojson";

describe("parseMapGeoJson", () => {
  it("accepts empty FeatureCollection", () => {
    const result = parseMapGeoJson({ type: "FeatureCollection", features: [] });
    expect(result.features).toEqual([]);
  });

  it("rejects missing type", () => {
    expect(() => parseMapGeoJson({ features: [] })).toThrow();
  });

  it("accepts a feature with map_schemes properties", () => {
    const result = parseMapGeoJson({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: 1,
          geometry: { type: "MultiPolygon", coordinates: [] },
          properties: {
            slug: "dha-phase-6",
            name: "DHA Phase 6",
            short: "Phase 6",
            tier: "premium",
            color: "blue",
            has_tour: true,
          },
        },
      ],
    });
    expect(result.features[0]?.properties.slug).toBe("dha-phase-6");
  });
});
