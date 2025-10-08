import type { Map as ApiMap, CreateMapRequest, MapFeature } from "../models";
import type {
  BackgroundElement,
  LocationElement,
  MapElement,
  MapLayers,
  SubmapElement,
} from "../types/fair-mapper";

/**
 * Converter utility to transform between FairMapper format and API GeoJSON format
 */

/**
 * Converts a FairMapper element to a GeoJSON feature
 */
function mapElementToFeature(element: MapElement): MapFeature {
  // Convert element bounds to GeoJSON Polygon coordinates
  const coordinates = [
    [
      [element.x, element.y],
      [element.x + element.width, element.y],
      [element.x + element.width, element.y + element.height],
      [element.x, element.y + element.height],
      [element.x, element.y], // Close the polygon
    ],
  ];

  // Map FairMapper layer types to API types
  let apiType: "background" | "submapa" | "local";
  if (element.layer === "background") {
    apiType = "background";
  } else if (element.layer === "submaps") {
    apiType = "submapa";
  } else if (element.layer === "locations") {
    apiType = "local";
  } else {
    apiType = "background"; // Fallback
  }

  return {
    type: "Feature",
    id: element.id.toString(),
    geometry: {
      type: "Polygon",
      coordinates,
    },
    properties: {
      type: apiType,
      name: element.name,
      color: element.color,
      borderColor: element.borderColor,
      // Include type-specific properties
      ...(element.layer === "background" && {
        backgroundType: (element as BackgroundElement).type,
      }),
      ...(element.layer === "submaps" && {
        submapType: (element as SubmapElement).type,
      }),
      ...(element.layer === "locations" && {
        locationType: (element as LocationElement).type,
      }),
    },
  };
}

/**
 * Converts a GeoJSON feature to a FairMapper element
 */
function featureToMapElement(feature: MapFeature): MapElement | null {
  if (feature.geometry.type !== "Polygon") {
    console.warn("Skipping non-polygon feature:", feature);
    return null;
  }

  const coordinates = feature.geometry.coordinates as number[][][];
  const ring = coordinates[0];

  if (!ring || ring.length < 4) {
    console.warn("Invalid polygon coordinates:", feature);
    return null;
  }

  // Extract bounds from polygon coordinates
  const x = ring[0][0];
  const y = ring[0][1];
  const width = ring[1][0] - x;
  const height = ring[2][1] - y;

  const id = feature.id ? parseInt(feature.id.toString()) : Date.now();

  // Map API types to FairMapper layer types
  const apiType = feature.properties.type || "background";
  let layer: "background" | "submaps" | "locations";

  if (apiType === "background") {
    layer = "background";
  } else if (apiType === "submapa") {
    layer = "submaps";
  } else if (apiType === "local") {
    layer = "locations";
  } else {
    // Fallback for unknown types
    console.warn("Unknown API type:", apiType, "defaulting to background");
    layer = "background";
  }

  const baseElement = {
    id,
    x,
    y,
    width,
    height,
    layer,
    name: feature.properties.name || "Elemento sem nome",
    color: feature.properties.color || "#E5E7EB",
    borderColor: feature.properties.borderColor || "#9CA3AF",
  };

  // Create type-specific elements
  switch (layer) {
    case "background":
      return {
        ...baseElement,
        layer: "background",
        type: feature.properties.backgroundType || "Customizado",
      } as BackgroundElement;

    case "submaps":
      return {
        ...baseElement,
        layer: "submaps",
        type: feature.properties.submapType || "Setor",
      } as SubmapElement;

    case "locations":
      return {
        ...baseElement,
        layer: "locations",
        type: feature.properties.locationType || "Outros",
      } as LocationElement;

    default:
      console.warn("Unknown layer type:", layer);
      return null;
  }
}

/**
 * Converts FairMapper layers to API format (CreateMapRequest)
 */
export function layersToApiFormat(
  layers: MapLayers,
  name: string,
  description?: string
): CreateMapRequest {
  const allElements: MapElement[] = [
    ...layers.background,
    ...layers.submaps,
    ...layers.locations,
  ];

  const features = allElements.map(mapElementToFeature);

  return {
    name,
    type: "FeatureCollection",
    metadata: {
      description,
      version: "1.0",
    },
    features,
  };
}

/**
 * Converts API format to FairMapper layers
 */
export function apiFormatToLayers(apiMap: ApiMap): {
  layers: MapLayers;
  nextId: number;
} {
  const layers: MapLayers = {
    background: [],
    submaps: [],
    locations: [],
  };

  let maxId = 0;

  for (const feature of apiMap.features) {
    const element = featureToMapElement(feature);
    if (element) {
      if (element.layer === "background") {
        layers.background.push(element as BackgroundElement);
      } else if (element.layer === "submaps") {
        layers.submaps.push(element as SubmapElement);
      } else if (element.layer === "locations") {
        layers.locations.push(element as LocationElement);
      }
      maxId = Math.max(maxId, element.id);
    }
  }

  return {
    layers,
    nextId: maxId + 1,
  };
}

/**
 * Converts FairMapper layers to API update format
 */
export function layersToUpdateFormat(layers: MapLayers): {
  features: MapFeature[];
} {
  const allElements: MapElement[] = [
    ...layers.background,
    ...layers.submaps,
    ...layers.locations,
  ];

  console.log("[map-converter] layersToUpdateFormat input:", {
    background: layers.background.length,
    submaps: layers.submaps.length,
    locations: layers.locations.length,
    total: allElements.length,
  });

  const features = allElements.map(mapElementToFeature);

  console.log("[map-converter] layersToUpdateFormat output:", {
    featuresCount: features.length,
  });

  return { features };
}
