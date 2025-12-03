import type { Store } from "../models";
import type { LocationElement, MapLayers } from "../types/fair-mapper";

/**
 * Enriquece os elementos do mapa com informações das lojas vinculadas
 */
export function enrichLayersWithStoreData(
  layers: MapLayers,
  stores: Store[]
): MapLayers {
  // Criar um mapa de stores por ID para busca rápida
  const storeMap = new Map(stores.map((store) => [store._id, store]));

  // Função para enriquecer um elemento de localização
  const enrichElement = (element: LocationElement): LocationElement => {
    // Se não tem storeId, retornar elemento sem modificação
    if (!element.storeId) {
      return element;
    }

    // Buscar a store correspondente
    const store = storeMap.get(element.storeId);
    
    // Se não encontrar a store, manter o storeId mas retornar sem enriquecimento
    if (!store) {
      return element;
    }

    // Retornar elemento enriquecido com informações da loja
    const enriched: LocationElement = {
      ...element,
      name: store.name,
      storeName: store.name,
      storeCategory: store.category,
      storeLogo: store.logo || undefined,
      // Garantir que o storeId seja mantido
      storeId: element.storeId,
    };

    return enriched;
  };

  // Enriquecer todos os elementos
  return {
    background: layers.background,
    submaps: layers.submaps,
    locations: layers.locations.map(enrichElement),
  };
}
