import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateMapRequest, UpdateMapRequest } from "../models";
import { Service } from "../services";

export const useCreateMap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMapRequest) => Service.map.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maps"] });
      queryClient.invalidateQueries({ queryKey: ["map-tags"] });
    },
  });
};

export const useUpdateMap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMapRequest }) =>
      Service.map.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["maps"] });
      queryClient.invalidateQueries({ queryKey: ["map", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["map-tags"] });
    },
  });
};

export const useDeleteMap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => Service.map.remove(id),
    onSuccess: () => {
      // Invalidate maps list to refetch
      queryClient.invalidateQueries({ queryKey: ["maps"] });
      queryClient.invalidateQueries({ queryKey: ["map-tags"] });
    },
  });
};
