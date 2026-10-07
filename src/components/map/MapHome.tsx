"use client";

import dynamic from "next/dynamic";

const MapExperience = dynamic(
  () =>
    import("@/components/map/MapExperience").then((m) => m.MapExperience),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[100dvh] items-center justify-center text-sm text-muted-foreground">
        Loading map…
      </div>
    ),
  }
);

export function MapHome({ slug }: { slug?: string }) {
  return <MapExperience slug={slug} />;
}
