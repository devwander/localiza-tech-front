// Tipos para o Feira Mapper

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds extends Point, Size {}

// Configuração das camadas
export interface LayerConfig {
  zIndex: number;
  color: string;
  name: string;
}

export type LayerType = "background" | "submaps" | "locations";

export const LAYER_CONFIG: Record<LayerType, LayerConfig> = {
  locations: { zIndex: 3, color: "#EF4444", name: "Locais" },
  submaps: { zIndex: 2, color: "#3B82F6", name: "Submapas" },
  background: { zIndex: 1, color: "#6B7280", name: "Background" },
};

// Tipos de elementos do mapa
export interface MapElementType {
  color: string;
  borderColor: string;
  icon: string;
}

export type BackgroundElementType =
  | "Corredor"
  | "Praça"
  | "Área Comum"
  | "Entrada"
  | "Banheiro"
  | "Customizado";
export type SubmapElementType = "Setor";
export type LocationElementType =
  | "Alimentação"
  | "Vestuário"
  | "Artesanato"
  | "Serviços"
  | "Outros";

export const MAP_ELEMENT_TYPES: Record<BackgroundElementType, MapElementType> =
  {
    Corredor: { color: "#E5E7EB", borderColor: "#9CA3AF", icon: "🛤️" },
    Praça: { color: "#D1FAE5", borderColor: "#10B981", icon: "🏛️" },
    "Área Comum": { color: "#DBEAFE", borderColor: "#3B82F6", icon: "👥" },
    Entrada: { color: "#FEF3C7", borderColor: "#F59E0B", icon: "🚪" },
    Banheiro: { color: "#EDE9FE", borderColor: "#8B5CF6", icon: "🚻" },
    Customizado: { color: "#F3F4F6", borderColor: "#6B7280", icon: "⚙️" },
  };

export const LOCATION_CATEGORIES: Record<LocationElementType, string> = {
  Alimentação: "#4CAF50",
  Vestuário: "#2196F3",
  Artesanato: "#FF9800",
  Serviços: "#9C27B0",
  Outros: "#607D8B",
};

// Interface base para elementos do mapa
export interface BaseMapElement extends Bounds {
  id: number;
  layer: LayerType;
  name: string;
  color: string;
  borderColor: string;
}

// Elementos específicos por camada
export interface BackgroundElement extends BaseMapElement {
  layer: "background";
  type: BackgroundElementType;
}

export interface SubmapElement extends BaseMapElement {
  layer: "submaps";
  type: SubmapElementType;
}

export interface LocationElement extends BaseMapElement {
  layer: "locations";
  type: LocationElementType;
}

export type MapElement = BackgroundElement | SubmapElement | LocationElement;

// Camadas organizadas
export interface MapLayers {
  background: BackgroundElement[];
  submaps: SubmapElement[];
  locations: LocationElement[];
}

// Ferramentas disponíveis
export type ToolType = "select" | "move" | "resize" | "paint" | "draw";

// Configuração de seleção
export interface SelectionConfig {
  tolerance: number;
  highlightColor: string;
  highlightWidth: number;
  showHandles: boolean;
  handleSize: number;
}

export const SELECTION_CONFIG: SelectionConfig = {
  tolerance: 5,
  highlightColor: "#FF0000",
  highlightWidth: 3,
  showHandles: true,
  handleSize: 8,
};

// Handles de redimensionamento
export type ResizeHandle = "nw" | "ne" | "sw" | "se";

export interface ResizeHandleInfo {
  name: ResizeHandle;
  x: number;
  y: number;
}

// Estado do mouse e interações
export interface MouseState {
  isDrawing: boolean;
  isDragging: boolean;
  isResizing: boolean;
  drawStart: Point | null;
  dragOffset: Point;
  resizeHandle: ResizeHandle | null;
}

// Estado da aplicação
export interface AppState {
  selectedElement: MapElement | null;
  currentTool: ToolType;
  currentLayer: LayerType | null;
  debugMode: boolean;
  nextId: number;
}

// Informações de debug
export interface DebugInfo {
  mousePos: Point;
  canvasPos: Point;
  lastHitTest: string[];
}

// Dados para salvar/carregar
export interface MapData {
  layers: MapLayers;
  nextId: number;
  timestamp: string;
  version: string;
}

// Background image metadata (not required to be persisted with drawing data)
export interface BackgroundImageMeta {
  src: string; // data URL or remote URL
  opacity: number; // 0..1
  x: number; // position on canvas (CSS pixels)
  y: number;
  width: number; // display size on canvas (CSS pixels)
  height: number;
  naturalWidth?: number;
  naturalHeight?: number;
}

// Props dos componentes
export interface CanvasProps {
  width: number;
  height: number;
  onCanvasRef: (canvas: HTMLCanvasElement | null) => void;
}

export interface ToolbarProps {
  currentTool: ToolType;
  currentLayer: LayerType | null;
  onToolChange: (tool: ToolType) => void;
  onLayerChange: (layer: LayerType | null) => void;
}

export interface PropertiesPanelProps {
  selectedElement: MapElement | null;
  onUpdateElement: (updates: Partial<MapElement>) => void;
  onDeleteElement: () => void;
}

export interface LayersPanelProps {
  layers: MapLayers;
  selectedElement: MapElement | null;
}

export interface DebugPanelProps {
  debugInfo: DebugInfo;
  selectedElement: MapElement | null;
  visible: boolean;
}

// Utilitários de cores
export interface ColorUtils {
  getContrastColor: (hexColor: string) => string;
  colorToHex: (color: string) => string;
}

// Events
export interface CanvasEventHandlers {
  onCanvasClick: (e: MouseEvent) => void;
  onMouseDown: (e: MouseEvent) => void;
  onMouseMove: (e: MouseEvent) => void;
  onMouseUp: (e: MouseEvent) => void;
  onRightClick: (e: MouseEvent) => void;
}

// Hook return types
export interface UseCanvasReturn extends CanvasEventHandlers {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  getCanvasCoordinates: (e: MouseEvent) => Point;
}

export interface UseFairMapperReturn {
  // State
  layers: MapLayers;
  selectedElement: MapElement | null;
  currentTool: ToolType;
  currentLayer: LayerType | null;
  debugMode: boolean;
  debugInfo: DebugInfo;
  mouseState: MouseState;

  // Actions
  setTool: (tool: ToolType) => void;
  setDrawMode: (layer: LayerType) => void;
  selectElement: (element: MapElement | null) => void;
  updateElement: (id: number, updates: Partial<MapElement>) => void;
  deleteElement: (id: number) => void;
  toggleDebugMode: () => void;

  // File operations
  saveMap: () => void;
  loadMap: (file: File) => Promise<void>;

  // Canvas operations
  render: () => void;

  // Canvas ref
  canvasRef: React.RefObject<HTMLCanvasElement>;
  // Background image controls (optional)
  uploadBackgroundImage?: (file: File) => Promise<void>;
  setBackgroundOpacity?: (opacity: number) => void;
  setBackgroundTransform?: (x: number, y: number, width: number, height: number) => void;
  removeBackgroundImage?: () => void;
  backgroundMeta?: BackgroundImageMeta | null;
}

// Mensagem de feedback
export interface Message {
  text: string;
  type: "success" | "error" | "info" | "warning";
}
