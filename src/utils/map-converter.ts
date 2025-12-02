import type {
  Map as ApiMap,
  CreateMapRequest,
  MapFeature,
  UpdateMapRequest,
} from "../models";
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
  console.log("[mapElementToFeature] Converting element:", {
    id: element.id,
    name: element.name,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    layer: element.layer,
  });

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

  console.log("[mapElementToFeature] Generated coordinates:", coordinates);

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

  const feature = {
    type: "Feature" as const,
    id: element.id.toString(),
    geometry: {
      type: "Polygon" as const,
      coordinates,
    },
    properties: {
      type: apiType,
      name: element.name,
      color: element.color,
      borderColor: element.borderColor,
      // Include storeId if present
      ...(element.storeId && { storeId: element.storeId }),
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

  console.log(
    "[mapElementToFeature] Created feature:",
    JSON.stringify(feature, null, 2)
  );

  return feature;
}

/**
 * Converts a GeoJSON feature to a FairMapper element
 */
function featureToMapElement(feature: MapFeature): MapElement | null {
  if (!feature || !feature.geometry) {
    console.warn(
      "[featureToMapElement] Skipping feature with missing geometry:",
      feature
    );
    return null;
  }

  if (feature.geometry.type !== "Polygon") {
    console.warn(
      "[featureToMapElement] Skipping non-polygon feature:",
      feature
    );
    return null;
  }

  const coordinates = feature.geometry.coordinates as number[][][];

  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
    console.warn("[featureToMapElement] Invalid coordinates array:", feature);
    return null;
  }

  const ring = coordinates[0];

  if (!ring || !Array.isArray(ring) || ring.length < 4) {
    console.warn("[featureToMapElement] Invalid polygon coordinates:", feature);
    return null;
  }

  // Extract bounds from polygon coordinates with safety checks
  const point0 = ring[0];
  const point1 = ring[1];
  const point2 = ring[2];

  if (!point0 || !point1 || !point2) {
    console.warn("[featureToMapElement] Missing coordinate points:", feature);
    return null;
  }

  const x = point0[0];
  const y = point0[1];
  const width = point1[0] - x;
  const height = point2[1] - y;

  const id = feature.id ? parseInt(feature.id.toString()) : Date.now();

  // Map API types to FairMapper layer types with safety check
  if (!feature.properties) {
    console.warn("Feature missing properties:", feature);
    return null;
  }

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
    ...(feature.properties.storeId && {
      storeId: feature.properties.storeId as string,
    }),
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

  // Validação: garantir que features existe e é um array
  if (!apiMap.features || !Array.isArray(apiMap.features)) {
    console.warn(
      "[apiFormatToLayers] Map has no valid features array:",
      apiMap
    );
    return {
      layers,
      nextId: 1,
    };
  }

  console.log(
    "[apiFormatToLayers] Processing",
    apiMap.features.length,
    "features"
  );

  for (const feature of apiMap.features) {
    const element = featureToMapElement(feature);
    if (element) {
      console.log("[apiFormatToLayers] Converted feature to element:", {
        id: element.id,
        name: element.name,
        layer: element.layer,
        type: element.type,
      });

      if (element.layer === "background") {
        layers.background.push(element as BackgroundElement);
      } else if (element.layer === "submaps") {
        layers.submaps.push(element as SubmapElement);
      } else if (element.layer === "locations") {
        layers.locations.push(element as LocationElement);
      }
      maxId = Math.max(maxId, element.id);
    } else {
      console.warn("[apiFormatToLayers] Failed to convert feature:", feature);
    }
  }

  console.log("[apiFormatToLayers] Result:", {
    background: layers.background.length,
    submaps: layers.submaps.length,
    locations: layers.locations.length,
    nextId: maxId + 1,
  });

  return {
    layers,
    nextId: maxId + 1,
  };
}

/**
 * Converts FairMapper layers to API update format
 */
export function layersToUpdateFormat(layers: MapLayers): UpdateMapRequest {
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
