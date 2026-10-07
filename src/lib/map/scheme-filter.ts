import type { FilterSpecification } from "mapbox-gl";
import type { Tier } from "@/lib/schema/map-geojson";

const ALL_TIERS: Tier[] = ["ultra", "premium", "upper"];

export type MapFilters = {
  tiers: Tier[];
  toursOnly: boolean;
};

export const defaultMapFilters: MapFilters = {
  tiers: [...ALL_TIERS],
  toursOnly: false,
};

export function buildSchemeLayerFilter(
  filters: MapFilters
): FilterSpecification | undefined {
  const parts: unknown[] = ["all"];

  if (filters.tiers.length > 0 && filters.tiers.length < ALL_TIERS.length) {
    parts.push([
      "match",
      ["get", "tier"],
      ...filters.tiers.flatMap((t) => [t, true]),
      false,
    ]);
  }

  if (filters.toursOnly) {
    parts.push(["==", ["get", "has_tour"], true]);
  }

  return parts.length > 1 ? (parts as FilterSpecification) : undefined;
}
