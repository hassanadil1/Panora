import { z } from "zod";

export const TierSchema = z.enum(["ultra", "premium", "upper"]);

export const MapFeaturePropertiesSchema = z.object({
  slug: z.string(),
  name: z.string(),
  short: z.string(),
  tier: TierSchema,
  color: z.string(),
  has_tour: z.boolean(),
});

export const MapFeatureSchema = z.object({
  type: z.literal("Feature"),
  id: z.union([z.number(), z.string()]).optional(),
  geometry: z.unknown(),
  properties: MapFeaturePropertiesSchema,
});

export const MapFeatureCollectionSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(MapFeatureSchema),
});

export type Tier = z.infer<typeof TierSchema>;
export type MapFeatureProperties = z.infer<typeof MapFeaturePropertiesSchema>;
export type MapFeature = z.infer<typeof MapFeatureSchema>;
export type MapFeatureCollection = z.infer<typeof MapFeatureCollectionSchema>;
