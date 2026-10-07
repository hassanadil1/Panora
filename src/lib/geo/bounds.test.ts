import { describe, it, expect } from "vitest";
import { getBoundsFromFeature } from "./bounds";

describe("getBoundsFromFeature", () => {
  it("returns SW and NE corners for a square polygon", () => {
    const feature: GeoJSON.Feature = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0],
          ],
        ],
      },
    };

    expect(getBoundsFromFeature(feature)).toEqual([
      [0, 0],
      [10, 10],
    ]);
  });
});
