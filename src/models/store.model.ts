export const StoreCategory = {
  FOOD: "food",
  CLOTHING: "clothing",
  ELECTRONICS: "electronics",
  JEWELRY: "jewelry",
  BOOKS: "books",
  SPORTS: "sports",
  HOME: "home",
  BEAUTY: "beauty",
  TOYS: "toys",
  SERVICES: "services",
  OTHER: "other",
} as const;

export type StoreCategory = (typeof StoreCategory)[keyof typeof StoreCategory];

export interface StoreLocation {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface Store {
  _id: string;
  name: string;
  floor: string;
  category: StoreCategory;
  openingHours: string;
  logo: string;
  description: string;
  mapId: string;
  featureId: string;
  location: StoreLocation;
  phone?: string;
  email?: string;
  website?: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStoreRequest {
  name: string;
  floor: string;
  category: StoreCategory;
  openingHours: string;
  logo: string;
  description: string;
  mapId: string;
  featureId: string;
  location: StoreLocation;
  phone?: string;
  email?: string;
  website?: string;
}

export interface UpdateStoreRequest {
  name?: string;
  floor?: string;
  category?: StoreCategory;
  openingHours?: string;
  logo?: string;
  description?: string;
  featureId?: string;
  location?: StoreLocation;
  phone?: string;
  email?: string;
  website?: string;
}

export interface FindStoresRequest {
  query?: string;
  mapId?: string;
  category?: StoreCategory;
  floor?: string;
  page?: number;
  limit?: number;
}

export interface FindStoresResponse {
  data: Store[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const StoreCategoryLabels: Record<StoreCategory, string> = {
  food: "Alimentação",
  clothing: "Vestuário",
  electronics: "Eletrônicos",
  jewelry: "Joalheria",
  books: "Livros",
  sports: "Esportes",
  home: "Casa e Decoração",
  beauty: "Beleza e Cosméticos",
  toys: "Brinquedos",
  services: "Serviços",
  other: "Outros",
};
