import type { LocationElement, MapLayers } from "../types/fair-mapper";
import type { Store } from "../models";

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
    if (!element.storeId) {
      return element;
    }

    const store = storeMap.get(element.storeId);
    if (!store) {
      return element;
    }

    // Retornar elemento enriquecido com informações da loja
    return {
      ...element,
      name: store.name, // Copiar o nome da loja
      storeName: store.name,
      storeCategory: store.category,
      storeLogo: store.logo || undefined,
    };
  };

  // Enriquecer todos os elementos
  return {
    background: layers.background,
    submaps: layers.submaps,
    locations: layers.locations.map(enrichElement),
  };
}
