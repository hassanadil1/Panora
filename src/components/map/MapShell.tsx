"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Map, { type MapMouseEvent, type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { SchemeLayers } from "@/components/map/SchemeLayers";
import { useMapSchemes } from "@/hooks/use-map-schemes";
import { useMapStore } from "@/stores/map-store";
import { buildSchemeLayerFilter, type MapFilters } from "@/lib/map/scheme-filter";
import { getBoundsFromFeature } from "@/lib/geo/bounds";
import type { MapFeature } from "@/lib/schema/map-geojson";

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const mapStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL;

type MapShellProps = {
  filters: MapFilters;
  onSchemeSelect: (slug: string, feature: MapFeature) => void;
  onMapReady?: (map: MapRef) => void;
};

export function MapShell({ filters, onSchemeSelect, onMapReady }: MapShellProps) {
  const { lng, lat, zoom, bearing, pitch, setHoveredSlug } = useMapStore();
  const { data, isLoading, isError, error } = useMapSchemes("lahore");
  const mapRef = useRef<MapRef | null>(null);
  const hoveredFeatureId = useRef<string | number | null>(null);
  const [ready, setReady] = useState(false);

  const initialViewState = useMemo(
    () => ({ longitude: lng, latitude: lat, zoom, bearing, pitch }),
    [lng, lat, zoom, bearing, pitch]
  );

  const layerFilter = useMemo(
    () => buildSchemeLayerFilter(filters),
    [filters]
  );

  const onMouseMove = useCallback(
    (event: MapMouseEvent) => {
      const map = mapRef.current?.getMap();
      if (!map) return;
      const feature = event.features?.find((f) => f.layer?.id === "schemes-fill");
      const slug =
        feature?.properties && typeof feature.properties.slug === "string"
          ? feature.properties.slug
          : null;

      map.getCanvas().style.cursor = slug ? "pointer" : "";

      const nextId = feature?.id ?? null;
      if (hoveredFeatureId.current !== nextId) {
        if (hoveredFeatureId.current != null) {
          map.setFeatureState(
            { source: "schemes", id: hoveredFeatureId.current },
            { hover: false }
          );
        }
        if (nextId != null) {
          map.setFeatureState({ source: "schemes", id: nextId }, { hover: true });
        }
        hoveredFeatureId.current = nextId;
      }

      setHoveredSlug(slug);
    },
    [setHoveredSlug]
  );

  const onClick = useCallback(
    (event: MapMouseEvent) => {
      const feature = event.features?.find((f) => f.layer?.id === "schemes-fill");
      if (!feature?.properties?.slug || typeof feature.properties.slug !== "string") {
        return;
      }
      const clickedSlug = feature.properties.slug;
      const mapFeature = data?.features.find(
        (f) => f.properties.slug === clickedSlug
      );
      if (!mapFeature) return;

      const map = mapRef.current?.getMap();
      if (map) {
        const bounds = getBoundsFromFeature(mapFeature as GeoJSON.Feature);
        const prefersReduced =
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const wide = window.innerWidth >= 768;
        map.fitBounds(bounds, {
          padding: wide
            ? { top: 72, bottom: 48, left: 520, right: 48 }
            : { top: 72, bottom: 48, left: 24, right: 24 },
          pitch: prefersReduced ? map.getPitch() : 24,
          bearing: prefersReduced ? map.getBearing() : -12,
          duration: prefersReduced ? 0 : 700,
        });
      }

      onSchemeSelect(feature.properties.slug, mapFeature);
    },
    [data?.features, onSchemeSelect]
  );

  const onMouseLeave = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) map.getCanvas().style.cursor = "";
    setHoveredSlug(null);
  }, [setHoveredSlug]);

  if (!mapboxToken || !mapStyle) {
    return (
      <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-lg font-medium">Mapbox not configured</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Add{" "}
          <code className="text-xs">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> and{" "}
          <code className="text-xs">NEXT_PUBLIC_MAPBOX_STYLE_URL</code> to{" "}
          <code className="text-xs">.env.local</code>, then restart dev.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center px-6 text-center text-sm text-destructive">
        Could not load schemes:{" "}
        {error instanceof Error ? error.message : "unknown error"}
      </div>
    );
  }

  const collection = data ?? { type: "FeatureCollection" as const, features: [] };

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="pointer-events-none absolute left-3 top-24 z-10 rounded-md bg-background/90 px-3 py-1.5 text-xs shadow md:top-3">
          Loading schemes…
        </div>
      )}
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        mapStyle={mapStyle}
        initialViewState={initialViewState}
        style={{ width: "100%", height: "100%" }}
        interactiveLayerIds={["schemes-fill"]}
        onLoad={() => {
          setReady(true);
          if (mapRef.current) onMapReady?.(mapRef.current);
        }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        attributionControl
        reuseMaps
      >
        {ready && <SchemeLayers data={collection} filter={layerFilter} />}
      </Map>
    </div>
  );
}
