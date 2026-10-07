import {
  MapFeatureCollectionSchema,
  type MapFeatureCollection,
} from "@/lib/schema/map-geojson";

export function parseMapGeoJson(input: unknown): MapFeatureCollection {
  return MapFeatureCollectionSchema.parse(input);
}
