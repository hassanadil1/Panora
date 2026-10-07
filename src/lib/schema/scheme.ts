import { z } from "zod";
import { TierSchema } from "@/lib/schema/map-geojson";

export const TourKindSchema = z.enum([
  "embed",
  "native_360",
  "external_link",
]);

export const TourStateSchema = z.enum([
  "unchecked",
  "verified",
  "broken",
  "pending_permission",
  "rejected",
]);

export const SchemeDeveloperSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    site: z.string().nullable(),
  })
  .nullable();

export const SchemeMediaSchema = z.object({
  id: z.string().uuid(),
  path: z.string(),
  alt: z.string().nullable(),
  credit: z.string().nullable(),
  ord: z.number(),
});

export const SchemeTourSchema = z.object({
  id: z.string().uuid(),
  kind: TourKindSchema,
  title: z.string(),
  url: z.string().nullable(),
  owner: z.string().nullable(),
  licence: z.string().nullable(),
  state: TourStateSchema,
  is_primary: z.boolean(),
});

export const SchemePublicSchema = z.object({
  slug: z.string(),
  name: z.string(),
  short_name: z.string().nullable(),
  aliases: z.array(z.string()).nullable(),
  tier: TierSchema,
  color_key: z.string(),
  blurb: z.string().nullable(),
  approval: z.string().nullable(),
  published: z.boolean(),
  created_at: z.string(),
  center: z.object({ lng: z.number(), lat: z.number() }),
  geom: z.unknown(),
  developer: SchemeDeveloperSchema,
  media: z.array(SchemeMediaSchema),
  tours: z.array(SchemeTourSchema),
});

export type SchemePublic = z.infer<typeof SchemePublicSchema>;
export type SchemeTour = z.infer<typeof SchemeTourSchema>;

export function parseSchemePublic(input: unknown): SchemePublic {
  return SchemePublicSchema.parse(input);
}

export function primaryVerifiedTour(scheme: SchemePublic | undefined) {
  if (!scheme) return null;
  return (
    scheme.tours.find((t) => t.is_primary && t.state === "verified") ??
    scheme.tours.find((t) => t.state === "verified") ??
    null
  );
}
