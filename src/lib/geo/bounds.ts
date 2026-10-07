function coordPair(position: GeoJSON.Position): [number, number] {
  return [position[0], position[1]];
}

function positionsFromGeometry(geometry: GeoJSON.Geometry): [number, number][] {
  switch (geometry.type) {
    case "Point":
      return [coordPair(geometry.coordinates)];
    case "MultiPoint":
      return geometry.coordinates.map(coordPair);
    case "LineString":
      return geometry.coordinates.map(coordPair);
    case "MultiLineString":
      return geometry.coordinates.flatMap((line) => line.map(coordPair));
    case "Polygon":
      return geometry.coordinates.flatMap((ring) => ring.map(coordPair));
    case "MultiPolygon":
      return geometry.coordinates.flatMap((polygon) =>
        polygon.flatMap((ring) => ring.map(coordPair)),
      );
    case "GeometryCollection":
      return geometry.geometries.flatMap(positionsFromGeometry);
    default: {
      const _exhaustive: never = geometry;
      return _exhaustive;
    }
  }
}

/** Bounding box as Mapbox-style corners: southwest then northeast. */
export function getBoundsFromFeature(
  feature: GeoJSON.Feature,
): [[number, number], [number, number]] {
  if (!feature.geometry) {
    throw new Error("Feature has no geometry");
  }

  const positions = positionsFromGeometry(feature.geometry);
  if (positions.length === 0) {
    throw new Error("Feature geometry has no coordinates");
  }

  let minLng = positions[0][0];
  let minLat = positions[0][1];
  let maxLng = positions[0][0];
  let maxLat = positions[0][1];

  for (const [lng, lat] of positions) {
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}
