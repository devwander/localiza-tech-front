import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Service } from "../services";
import type { CreateStoreRequest, UpdateStoreRequest } from "../models";

export const useCreateStoreMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStoreRequest) => {
      return Service.store.create(data);
    },
    onSuccess: (createdStore, variables) => {
      // Invalidar stores
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      
      // Invalidar o mapa para recarregar com o storeId atualizado
      if (variables.mapId) {
        queryClient.invalidateQueries({ queryKey: ["maps", variables.mapId] });
        queryClient.invalidateQueries({ queryKey: ["maps", "public", variables.mapId] });
      }
    },
  });
};

export const useUpdateStoreMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStoreRequest }) =>
      Service.store.update(id, data),
    onSuccess: (updatedStore) => {
      // Invalidar stores
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      // Invalidar o mapa se a store tiver mapId
      if (updatedStore.mapId) {
        queryClient.invalidateQueries({ queryKey: ["maps", updatedStore.mapId] });
        queryClient.invalidateQueries({ queryKey: ["maps", "public", updatedStore.mapId] });
      }
    },
  });
};

export const useDeleteStoreMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => Service.store.delete(id),
    onSuccess: (deletedStore) => {
      // Invalidar stores
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      // Invalidar o mapa se a store tinha mapId
      if (deletedStore?.mapId) {
        queryClient.invalidateQueries({ queryKey: ["maps", deletedStore.mapId] });
        queryClient.invalidateQueries({ queryKey: ["maps", "public", deletedStore.mapId] });
      }
    },
  });
};
