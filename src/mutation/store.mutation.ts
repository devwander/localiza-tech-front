import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Service } from "../services";
import type { CreateStoreRequest, UpdateStoreRequest } from "../models";

export const useCreateStoreMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStoreRequest) => Service.store.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
};

export const useUpdateStoreMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStoreRequest }) =>
      Service.store.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
};

export const useDeleteStoreMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => Service.store.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
};
