"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { MapFeature } from "@/lib/schema/map-geojson";
import {
  defaultMapFilters,
  type MapFilters,
} from "@/lib/map/scheme-filter";
import type { Tier } from "@/lib/schema/map-geojson";

const TIER_LABELS: Record<Tier, string> = {
  ultra: "Ultra",
  premium: "Premium",
  upper: "Upper",
};

const TIER_SWATCH: Record<Tier, string> = {
  ultra: "bg-amber-500",
  premium: "bg-rose-400",
  upper: "bg-emerald-400",
};

type MapChromeProps = {
  features: MapFeature[];
  filters: MapFilters;
  onFiltersChange: (next: MapFilters) => void;
  onSelectSlug: (slug: string) => void;
};

export function MapChrome({
  features,
  filters,
  onFiltersChange,
  onSelectSlug,
}: MapChromeProps) {
  const [query, setQuery] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(features, {
        keys: [
          { name: "properties.name", weight: 0.5 },
          { name: "properties.short", weight: 0.3 },
          { name: "properties.slug", weight: 0.2 },
        ],
        threshold: 0.35,
      }),
    [features]
  );

  const results =
    query.trim().length > 1
      ? fuse.search(query.trim()).slice(0, 6)
      : [];

  const toggleTier = (tier: Tier) => {
    const has = filters.tiers.includes(tier);
    const tiers = has
      ? filters.tiers.filter((t) => t !== tier)
      : [...filters.tiers, tier];
    onFiltersChange({ ...filters, tiers: tiers.length ? tiers : [...defaultMapFilters.tiers] });
  };

  return (
    <div className="pointer-events-none absolute left-3 right-3 top-3 z-10 flex flex-col gap-2 md:left-4 md:right-auto md:max-w-sm">
      <div className="pointer-events-auto rounded-lg border bg-card/95 p-3 shadow-md backdrop-blur">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search schemes…"
            className="pl-9"
            aria-label="Search schemes"
          />
        </div>
        {results.length > 0 && (
          <ul className="mt-2 max-h-48 overflow-y-auto rounded-md border text-sm">
            {results.map(({ item }) => (
              <li key={item.properties.slug}>
                <button
                  type="button"
                  className="flex w-full px-3 py-2 text-left hover:bg-accent"
                  onClick={() => {
                    onSelectSlug(item.properties.slug);
                    setQuery("");
                  }}
                >
                  {item.properties.name}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(Object.keys(TIER_LABELS) as Tier[]).map((tier) => (
            <Button
              key={tier}
              type="button"
              size="sm"
              variant={filters.tiers.includes(tier) ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() => toggleTier(tier)}
            >
              {TIER_LABELS[tier]}
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant={filters.toursOnly ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() =>
              onFiltersChange({ ...filters, toursOnly: !filters.toursOnly })
            }
          >
            Has tour
          </Button>
        </div>
      </div>
      <div className="pointer-events-auto hidden rounded-md border bg-card/90 px-3 py-2 text-xs shadow md:block">
        <p className="mb-1 font-medium">Legend</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TIER_SWATCH) as Tier[]).map((tier) => (
            <span key={tier} className="inline-flex items-center gap-1">
              <span className={`h-2.5 w-2.5 rounded-sm ${TIER_SWATCH[tier]}`} />
              {TIER_LABELS[tier]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
