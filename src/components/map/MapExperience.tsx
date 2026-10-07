"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MapRef } from "react-map-gl/mapbox";
import { MapShell } from "@/components/map/MapShell";
import { MapChrome } from "@/components/map/MapChrome";
import { SchemeDrawer } from "@/components/scheme/SchemeDrawer";
import { useMapSchemes } from "@/hooks/use-map-schemes";
import { useMapStore } from "@/stores/map-store";
import { defaultMapFilters, type MapFilters } from "@/lib/map/scheme-filter";
import { getBoundsFromFeature } from "@/lib/geo/bounds";
import { trackEvent } from "@/lib/analytics/track-event";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";

type MapExperienceProps = {
  slug?: string;
};

export function MapExperience({ slug }: MapExperienceProps) {
  const router = useRouter();
  const { user, profile, displayName, signOut } = useAuth();
  const { saveCamera, restoreCamera } = useMapStore();
  const { data } = useMapSchemes("lahore");
  const mapRef = useRef<MapRef | null>(null);
  const [filters, setFilters] = useState<MapFilters>(defaultMapFilters);

  const flyToSlug = useCallback(
    (targetSlug: string) => {
      const feature = data?.features.find((f) => f.properties.slug === targetSlug);
      if (!feature) return;
      const map = mapRef.current?.getMap();
      if (map) {
        map.fitBounds(getBoundsFromFeature(feature as GeoJSON.Feature), {
          padding: 80,
          duration: 1200,
        });
      }
      router.push(`/s/${targetSlug}`);
    },
    [data?.features, router]
  );

  const onSchemeSelect = useCallback(
    (targetSlug: string) => {
      const map = mapRef.current?.getMap();
      if (map) {
        saveCamera({
          lng: map.getCenter().lng,
          lat: map.getCenter().lat,
          zoom: map.getZoom(),
          bearing: map.getBearing(),
          pitch: map.getPitch(),
        });
      }
      void trackEvent({ kind: "scheme_click", meta: { slug: targetSlug } });
      router.push(`/s/${targetSlug}`);
    },
    [router, saveCamera]
  );

  const closeDrawer = useCallback(() => {
    const saved = restoreCamera();
    const map = mapRef.current?.getMap();
    if (map && saved) {
      map.easeTo({
        center: [saved.lng, saved.lat],
        zoom: saved.zoom,
        bearing: saved.bearing ?? 0,
        pitch: saved.pitch ?? 0,
        duration: 800,
      });
    }
    router.push("/");
  }, [restoreCamera, router]);

  const isEditor =
    profile?.role === "editor" || profile?.role === "admin";

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between border-b bg-card px-3 py-2 md:px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            Panora
          </Link>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Lahore housing schemes
          </span>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          {user ? (
            <>
              <span className="hidden max-w-[8rem] truncate text-xs text-muted-foreground md:inline">
                {displayName}
              </span>
              <Button asChild variant="ghost" size="sm">
                <Link href="/favourites">Favourites</Link>
              </Button>
              {isEditor && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
              <Button type="button" variant="outline" size="sm" onClick={() => signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          )}
        </nav>
      </header>

      <div className="relative min-h-0 flex-1">
        <MapChrome
          features={data?.features ?? []}
          filters={filters}
          onFiltersChange={setFilters}
          onSelectSlug={flyToSlug}
        />
        <MapShell
          filters={filters}
          onSchemeSelect={onSchemeSelect}
          onMapReady={(ref) => {
            mapRef.current = ref;
          }}
        />
        {slug && <SchemeDrawer slug={slug} onClose={closeDrawer} />}
      </div>

      <footer className="shrink-0 border-t px-3 py-1.5 text-center text-[10px] text-muted-foreground md:text-xs">
        Scheme boundaries are indicative.{" "}
        <Link href="/terms" className="underline">
          Terms
        </Link>{" "}
        ·{" "}
        <Link href="/privacy" className="underline">
          Privacy
        </Link>
      </footer>
    </div>
  );
}
