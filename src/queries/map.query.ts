import { useQuery } from "@tanstack/react-query";
import type { FindMapsRequest } from "../models";
import { Service } from "../services";

export const useMaps = (params?: FindMapsRequest) => {
  const queryKey = [
    "maps",
    {
      query: params?.query ?? "",
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
