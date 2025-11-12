export interface MapMetadata {
  author: string;
  description?: string;
  version?: string;
  dimensions?: {
    width: number;
    height: number;
    unit: string;
  };
}

export const MapElementType = {
  BACKGROUND: "background",
  SUBMAPA: "submapa",
  LOCAL: "local",
  PATH: "path",
  AMENITY: "amenity",
} as const;

export type MapElementType =
  (typeof MapElementType)[keyof typeof MapElementType];

export const LocalCategory = {
  BOOTH: "booth",
  STORE: "store",
  RESTAURANT: "restaurant",
  RESTROOM: "restroom",
  EXIT: "exit",
  STAGE: "stage",
  INFO: "info",
  OTHER: "other",
} as const;

export type LocalCategory = (typeof LocalCategory)[keyof typeof LocalCategory];

export interface MapFeature {
  type: string;
  id?: string;
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
  properties: {
    type: MapElementType;
    name: string;
    parentId?: string;
    category?: LocalCategory;
    color?: string;
    exhibitor?: string;
    selected?: boolean;
    storeId?: string; // ID da loja vinculada a este espaço
    [key: string]: unknown;
  };
}

export interface Map {
  _id: string;
  name: string;
  type: string;
  metadata: MapMetadata;
  features: MapFeature[];
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMapRequest {
  name: string;
  type?: string;
  metadata?: {
    description?: string;
    version?: string;
  };
  features: MapFeature[];
}

export interface UpdateMapRequest {
  name?: string;
  type?: string;
  metadata?: {
    description?: string;
    version?: string;
  };
  features?: MapFeature[];
}

export interface FindMapsRequest {
  query?: string;
  page?: number;
  limit?: number;
  order?: "alphabetical" | "most_recent" | "oldest";
}

export interface FindMapsResponse {
  data: Map[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateElementRequest {
  type: string;
  id?: string;
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
  properties: Record<string, unknown>;
}

export interface UpdateElementRequest {
  type?: string;
  geometry?: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
  properties?: Record<string, unknown>;
}
