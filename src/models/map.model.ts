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

// Tags disponíveis para categorizar mapas
export const MapTag = {
  EVENTO: "evento",
  FEIRA: "feira",
  SHOPPING: "shopping",
  CONGRESSO: "congresso",
  EXPOSICAO: "exposicao",
  FESTIVAL: "festival",
  OUTRO: "outro",
} as const;

export type MapTag = (typeof MapTag)[keyof typeof MapTag];

export const MapTagLabels: Record<MapTag, string> = {
  evento: "Evento",
  feira: "Feira",
  shopping: "Shopping",
  congresso: "Congresso",
  exposicao: "Exposição",
  festival: "Festival",
  outro: "Outro",
};

export const MapTagColors: Record<MapTag, string> = {
  evento: "bg-purple-100 text-purple-800",
  feira: "bg-blue-100 text-blue-800",
  shopping: "bg-green-100 text-green-800",
  congresso: "bg-yellow-100 text-yellow-800",
  exposicao: "bg-pink-100 text-pink-800",
  festival: "bg-orange-100 text-orange-800",
  outro: "bg-gray-100 text-gray-800",
};

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
  tags?: MapTag[]; // Tags para categorizar o mapa
  metadata: MapMetadata;
  features: MapFeature[];
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMapRequest {
  name: string;
  type?: string;
  tags?: MapTag[]; // Tags para categorizar o mapa
  metadata?: {
    description?: string;
    version?: string;
  };
  features: MapFeature[];
}

export interface UpdateMapRequest {
  name?: string;
  type?: string;
  tags?: MapTag[]; // Tags para editar
  metadata?: {
    description?: string;
    version?: string;
  };
  features?: MapFeature[];
}

export interface FindMapsRequest {
  query?: string;
  tags?: string;
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
