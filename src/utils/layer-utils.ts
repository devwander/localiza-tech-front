import type {
  BackgroundElement,
  LayerType,
  LocationElement,
  MapElement,
  MapLayers,
  Point,
  ResizeHandle,
  ResizeHandleInfo,
  SubmapElement,
} from "../types/fair-mapper";

// Import constants directly
const MAP_ELEMENT_TYPES = {
  Corredor: { color: "#E5E7EB", borderColor: "#9CA3AF", icon: "🛤️" },
  Praça: { color: "#D1FAE5", borderColor: "#10B981", icon: "🏛️" },
  "Área Comum": { color: "#DBEAFE", borderColor: "#3B82F6", icon: "👥" },
  Entrada: { color: "#FEF3C7", borderColor: "#F59E0B", icon: "🚪" },
  Banheiro: { color: "#EDE9FE", borderColor: "#8B5CF6", icon: "🚻" },
  Customizado: { color: "#F3F4F6", borderColor: "#6B7280", icon: "⚙️" },
};

const LOCATION_CATEGORIES = {
  Alimentação: "#4CAF50",
  Vestuário: "#2196F3",
  Artesanato: "#FF9800",
  Serviços: "#9C27B0",
  Outros: "#607D8B",
};

const SELECTION_CONFIG = {
  tolerance: 5,
  highlightColor: "#FF0000",
  highlightWidth: 3,
  showHandles: true,
  handleSize: 8,
};

/**
 * Utilitários para manipulação de camadas
 */
export class LayerUtils {
  /**
   * Cria camadas vazias
   */
  static createEmptyLayers(): MapLayers {
    return {
      background: [],
      submaps: [],
      locations: [],
    };
  }

  /**
   * Obtém todos os elementos ordenados por Z-index (do mais baixo para o mais alto)
   */
  static getAllElementsOrdered(layers: MapLayers): MapElement[] {
    return [...layers.background, ...layers.submaps, ...layers.locations];
  }

  /**
   * Obtém todos os elementos em ordem reversa de Z-index (do mais alto para o mais baixo)
   * Usado para hit-testing correto
   */
  static getAllElementsReverseOrder(layers: MapLayers): MapElement[] {
    return [
      ...layers.locations.slice().reverse(),
      ...layers.submaps.slice().reverse(),
      ...layers.background.slice().reverse(),
    ];
  }

  /**
   * Adiciona um elemento à camada apropriada
   */
  static addElement(layers: MapLayers, element: MapElement): MapLayers {
    const newLayers = { ...layers };

    switch (element.layer) {
      case "background":
        newLayers.background = [
          ...layers.background,
          element as BackgroundElement,
        ];
        break;
      case "submaps":
        newLayers.submaps = [...layers.submaps, element as SubmapElement];
        break;
      case "locations":
        newLayers.locations = [...layers.locations, element as LocationElement];
        break;
    }

    return newLayers;
  }

  /**
   * Remove um elemento por ID
   */
  static removeElement(layers: MapLayers, elementId: number): MapLayers {
    return {
      background: layers.background.filter((el) => el.id !== elementId),
      submaps: layers.submaps.filter((el) => el.id !== elementId),
      locations: layers.locations.filter((el) => el.id !== elementId),
    };
  }

  /**
   * Atualiza um elemento por ID
   */
  static updateElement(
    layers: MapLayers,
    elementId: number,
    updates: Partial<MapElement>
  ): MapLayers {
    const updateInLayer = <T extends MapElement>(elements: T[]): T[] =>
      elements.map((el) =>
        el.id === elementId ? ({ ...el, ...updates } as T) : el
      );

    return {
      background: updateInLayer(layers.background),
      submaps: updateInLayer(layers.submaps),
      locations: updateInLayer(layers.locations),
    };
  }

  /**
   * Encontra um elemento por ID
   */
  static findElement(layers: MapLayers, elementId: number): MapElement | null {
    const allElements = this.getAllElementsOrdered(layers);
    return allElements.find((el) => el.id === elementId) || null;
  }

  /**
   * Conta o total de elementos em cada camada
   */
  static getLayerCounts(layers: MapLayers): Record<LayerType, number> {
    return {
      background: layers.background.length,
      submaps: layers.submaps.length,
      locations: layers.locations.length,
    };
  }
}

/**
 * Utilitários para hit-testing e seleção
 */
export class SelectionUtils {
  /**
   * Verifica se um ponto está dentro de um elemento
   */
  static isPointInElement(point: Point, element: MapElement): boolean {
    const tolerance = SELECTION_CONFIG.tolerance;
    return (
      point.x >= element.x - tolerance &&
      point.x <= element.x + element.width + tolerance &&
      point.y >= element.y - tolerance &&
      point.y <= element.y + element.height + tolerance
    );
  }

  /**
   * Seleciona o elemento na posição especificada, respeitando Z-index
   */
  static selectElementAtPosition(
    layers: MapLayers,
    point: Point
  ): MapElement | null {
    const elementsInReverseOrder =
      LayerUtils.getAllElementsReverseOrder(layers);

    for (const element of elementsInReverseOrder) {
      if (this.isPointInElement(point, element)) {
        return element;
      }
    }

    return null;
  }

  /**
   * Obtém os handles de redimensionamento para um elemento
   */
  static getResizeHandles(element: MapElement): ResizeHandleInfo[] {
    return [
      { name: "nw", x: element.x, y: element.y },
      { name: "ne", x: element.x + element.width, y: element.y },
      { name: "sw", x: element.x, y: element.y + element.height },
      {
        name: "se",
        x: element.x + element.width,
        y: element.y + element.height,
      },
    ];
  }

  /**
   * Verifica qual handle de redimensionamento está sendo clicado
   */
  static getResizeHandle(
    point: Point,
    element: MapElement
  ): ResizeHandle | null {
    const handles = this.getResizeHandles(element);
    const tolerance = SELECTION_CONFIG.handleSize;

    for (const handle of handles) {
      if (
        Math.abs(point.x - handle.x) < tolerance &&
        Math.abs(point.y - handle.y) < tolerance
      ) {
        return handle.name;
      }
    }

    return null;
  }
}

/**
 * Utilitários para criação de elementos
 */
export class ElementUtils {
  /**
   * Cria um novo elemento background
   */
  static createBackgroundElement(
    id: number,
    x: number,
    y: number,
    width: number,
    height: number,
    type: keyof typeof MAP_ELEMENT_TYPES = "Customizado"
  ): BackgroundElement {
    const elementType = MAP_ELEMENT_TYPES[type];

    return {
      id,
      layer: "background",
      type,
      name: `Background ${id}`,
      x,
      y,
      width,
      height,
      color: elementType.color,
      borderColor: elementType.borderColor,
    };
  }

  /**
   * Cria um novo elemento submapa
   */
  static createSubmapElement(
    id: number,
    x: number,
    y: number,
    width: number,
    height: number
  ): SubmapElement {
    return {
      id,
      layer: "submaps",
      type: "Setor",
      name: `Submapa ${id}`,
      x,
      y,
      width,
      height,
      color: "#DBEAFE",
      borderColor: "#3B82F6",
    };
  }

  /**
   * Cria um novo elemento local
   */
  static createLocationElement(
    id: number,
    x: number,
    y: number,
    width: number,
    height: number,
    category: keyof typeof LOCATION_CATEGORIES = "Outros"
  ): LocationElement {
    return {
      id,
      layer: "locations",
      type: category,
      name: `Local ${id}`,
      x,
      y,
      width,
      height,
      color: LOCATION_CATEGORIES[category],
      borderColor: this.getBorderColorForCategory(category),
    };
  }

  /**
   * Obtém a cor da borda para uma categoria de local
   */
  private static getBorderColorForCategory(
    category: keyof typeof LOCATION_CATEGORIES
  ): string {
    const colorMap: Record<keyof typeof LOCATION_CATEGORIES, string> = {
      Alimentação: "#2E7D32",
      Vestuário: "#1565C0",
      Artesanato: "#E65100",
      Serviços: "#6A1B9A",
      Outros: "#455A64",
    };

    return colorMap[category];
  }

  /**
   * Redimensiona um elemento baseado no handle e nova posição
   */
  static resizeElement(
    element: MapElement,
    handle: ResizeHandle,
    newPoint: Point
  ): Partial<MapElement> {
    const updates: Partial<MapElement> = {};

    switch (handle) {
      case "nw":
        updates.width = element.width + (element.x - newPoint.x);
        updates.height = element.height + (element.y - newPoint.y);
        updates.x = newPoint.x;
        updates.y = newPoint.y;
        break;
      case "ne":
        updates.width = newPoint.x - element.x;
        updates.height = element.height + (element.y - newPoint.y);
        updates.y = newPoint.y;
        break;
      case "sw":
        updates.width = element.width + (element.x - newPoint.x);
        updates.height = newPoint.y - element.y;
        updates.x = newPoint.x;
        break;
      case "se":
        updates.width = newPoint.x - element.x;
        updates.height = newPoint.y - element.y;
        break;
    }

    // Manter dimensões mínimas
    if (updates.width !== undefined) {
      updates.width = Math.max(10, updates.width);
    }
    if (updates.height !== undefined) {
      updates.height = Math.max(10, updates.height);
    }

    return updates;
  }
}

/**
 * Utilitários para cores
 */
export class ColorUtils {
  /**
   * Obtém cor de contraste para um hex color
   */
  static getContrastColor(hexColor: string): string {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155 ? "#000000" : "#FFFFFF";
  }

  /**
   * Converte cor para hex (se já não for)
   */
  static colorToHex(color: string): string {
    if (color.startsWith("#")) return color;
    // Implementar conversão RGB para hex se necessário
    return color;
  }

  /**
   * Obtém a próxima cor na paleta de categorias
   */
  static getNextLocationColor(currentColor: string): string {
    const colors = Object.values(LOCATION_CATEGORIES);
    const currentIndex = colors.indexOf(currentColor);
    const nextIndex = (currentIndex + 1) % colors.length;
    return colors[nextIndex];
  }
}
