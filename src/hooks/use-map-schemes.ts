"use client";

import { useQuery } from "@tanstack/react-query";
import { parseMapGeoJson } from "@/lib/geo/parse-geojson";
import type { MapFeatureCollection } from "@/lib/schema/map-geojson";
import { createClient } from "@/lib/supabase/client";

export function useMapSchemes(city = "lahore") {
  return useQuery({
    queryKey: ["map-schemes", city],
    queryFn: async (): Promise<MapFeatureCollection> => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("map_schemes", {
        p_city: city,
      });
      if (error) throw error;
      return parseMapGeoJson(data);
    },
  });
}
