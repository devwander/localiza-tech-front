import { api } from "../lib";
import type {
  CreateElementRequest,
  CreateMapRequest,
  FindMapsRequest,
  FindMapsResponse,
  Map,
  UpdateElementRequest,
  UpdateMapRequest,
} from "../models/map.model";

export default class MapService {
  // List all maps for the authenticated user
  public async findAll(params?: FindMapsRequest): Promise<FindMapsResponse> {
    const { data } = await api.get<FindMapsResponse>("maps", { params });
    return data;
  }

  // Get a specific map by ID
  public async findOne(id: string): Promise<Map> {
    const { data } = await api.get<Map>(`maps/${id}`);
    return data;
  }

  // Get a public map by ID (no authentication required)
  public async findPublic(id: string): Promise<Map> {
    const { data } = await api.get<Map>(`maps/public/${id}`);
    return data;
  }

  // Create a new map
  public async create(mapData: CreateMapRequest): Promise<Map> {
    const { data } = await api.post<Map>("maps", mapData);
    return data;
  }

  // Update an existing map
  public async update(id: string, mapData: UpdateMapRequest): Promise<Map> {
    const { data } = await api.patch<Map>(`maps/${id}`, mapData);
    return data;
  }

  // Delete a map
  public async remove(id: string): Promise<Map> {
    const { data } = await api.delete<Map>(`maps/${id}`);
    return data;
  }

  // Search elements within a map
  public async searchElements(
    id: string,
    query?: string
  ): Promise<Map["features"]> {
    const { data } = await api.get<Map["features"]>(`maps/${id}/elements`, {
      params: { query },
    });
    return data;
  }

  // Add an element to a map
  public async addElement(
    id: string,
    element: CreateElementRequest
  ): Promise<Map> {
    const { data } = await api.post<Map>(`maps/${id}/elements`, element);
    return data;
  }

  // Update a specific element in a map
  public async updateElement(
    mapId: string,
    elementId: string,
    updates: UpdateElementRequest
  ): Promise<Map> {
    const { data } = await api.patch<Map>(
      `maps/${mapId}/elements/${elementId}`,
      updates
    );
    return data;
  }

  // Remove an element from a map
  public async removeElement(mapId: string, elementId: string): Promise<Map> {
    const { data } = await api.delete<Map>(
      `maps/${mapId}/elements/${elementId}`
    );
    return data;
  }
}
