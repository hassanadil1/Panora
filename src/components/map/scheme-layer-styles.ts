import type {
  Expression,
  FillLayerSpecification,
  LineLayerSpecification,
  SymbolLayerSpecification,
} from "mapbox-gl";

const schemeColor: Expression = [
  "match",
  ["get", "color"],
  "amber",
  "#f59e0b",
  "coral",
  "#fb7185",
  "violet",
  "#a78bfa",
  "mint",
  "#34d399",
  "#f59e0b",
];

export const schemesFillLayer: FillLayerSpecification = {
  id: "schemes-fill",
  type: "fill",
  source: "schemes",
  paint: {
    "fill-color": schemeColor,
    "fill-opacity": [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      0.38,
      0.18,
    ],
  },
};

export const schemesLineLayer: LineLayerSpecification = {
  id: "schemes-line",
  type: "line",
  source: "schemes",
  paint: {
    "line-color": schemeColor,
    "line-width": 1.5,
    "line-opacity": 0.85,
  },
};

export const schemesLabelLayer: SymbolLayerSpecification = {
  id: "schemes-label",
  type: "symbol",
  source: "schemes",
  minzoom: 12,
  layout: {
    "text-field": ["get", "short"],
    "text-size": 13,
    "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
    "text-anchor": "center",
  },
  paint: {
    "text-color": "#e2e8f0",
    "text-halo-color": "#0f172a",
    "text-halo-width": 1.2,
  },
};
