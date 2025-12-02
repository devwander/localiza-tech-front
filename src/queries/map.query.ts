import { useQuery } from "@tanstack/react-query";
import type { FindMapsRequest } from "../models";
import { Service } from "../services";

export const useMapTags = () => {
  return useQuery({
    queryKey: ["map-tags"],
    queryFn: async () => {
      const result = await Service.map.findAllTags();
      return result;
    },
    staleTime: 0, // Sempre buscar do servidor para debug
    gcTime: 0,
    refetchOnMount: "always",
  });
};

export const useMaps = (params?: FindMapsRequest) => {
  const queryKey = [
    "maps",
    {
      query: params?.query ?? "",
      tags: params?.tags ?? "",
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      order: params?.order ?? "",
    },
  ] as const;

  return useQuery({
    queryKey,
    queryFn: () => Service.map.findAll(params),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
  });
};

export const useMap = (id: string | undefined) => {
  return useQuery({
    queryKey: ["map", id],
    queryFn: () => Service.map.findOne(id!),
    enabled: !!id,
    // Sempre buscar dados frescos do servidor
    staleTime: 0, // Dados ficam stale imediatamente
    gcTime: 0,
    refetchOnMount: "always", // Sempre refetch ao montar
    refetchOnWindowFocus: "always", // Refetch quando a janela ganha foco
    refetchOnReconnect: "always",
  });
};

export const usePublicMap = (id: string | undefined) => {
  return useQuery({
    queryKey: ["map", "public", id],
    queryFn: () => Service.map.findPublic(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos para mapas públicos
    gcTime: 10 * 60 * 1000,
  });
};
