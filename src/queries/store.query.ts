import { useQuery } from "@tanstack/react-query";
import { Service } from "../services";
import type { FindStoresRequest } from "../models";

export const useStoresQuery = (params?: FindStoresRequest) => {
  return useQuery({
    queryKey: ["stores", params],
    queryFn: () => Service.store.findAll(params),
  });
};

export const useStoreQuery = (id: string) => {
  return useQuery({
    queryKey: ["stores", id],
    queryFn: () => Service.store.findById(id),
    enabled: !!id,
  });
};

export const useStoresByMapQuery = (mapId: string) => {
  return useQuery({
    queryKey: ["stores", "map", mapId],
    queryFn: () => Service.store.findByMapId(mapId),
    enabled: !!mapId,
  });
};

export const useStoresByMapPublicQuery = (mapId: string) => {
  return useQuery({
    queryKey: ["stores", "public", "map", mapId],
    queryFn: () => Service.store.findByMapIdPublic(mapId),
    enabled: !!mapId,
  });
};
