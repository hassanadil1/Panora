"use client";

import { Layer, Source } from "react-map-gl/mapbox";
import type { FilterSpecification } from "mapbox-gl";
import type { MapFeatureCollection } from "@/lib/schema/map-geojson";
import {
  schemesFillLayer,
  schemesLabelLayer,
  schemesLineLayer,
} from "@/components/map/scheme-layer-styles";

type SchemeLayersProps = {
  data: MapFeatureCollection;
  filter?: FilterSpecification;
};

export function SchemeLayers({ data, filter }: SchemeLayersProps) {
  return (
    <Source
      id="schemes"
      type="geojson"
      data={data as GeoJSON.FeatureCollection}
      promoteId="slug"
    >
      <Layer {...schemesFillLayer} filter={filter} />
      <Layer {...schemesLineLayer} filter={filter} />
      <Layer {...schemesLabelLayer} filter={filter} />
    </Source>
  );
}
