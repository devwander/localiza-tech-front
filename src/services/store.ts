import { api } from "../lib/api";
import type {
  Store,
  CreateStoreRequest,
  UpdateStoreRequest,
  FindStoresRequest,
  FindStoresResponse,
} from "../models/store.model";

export const storeService = {
  async create(data: CreateStoreRequest): Promise<Store> {
    const response = await api.post("/stores", data);
    return response.data;
  },

  async findAll(params?: FindStoresRequest): Promise<FindStoresResponse> {
    const response = await api.get("/stores", { params });
    return response.data;
  },

  async findById(id: string): Promise<Store> {
    const response = await api.get(`/stores/${id}`);
    return response.data;
  },

  async findByMapId(mapId: string): Promise<Store[]> {
    const response = await api.get(`/stores/map/${mapId}`);
    return response.data;
  },

  async update(id: string, data: UpdateStoreRequest): Promise<Store> {
    const response = await api.patch(`/stores/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/stores/${id}`);
  },
};
