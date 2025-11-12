/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  DebugInfo,
  LayerType,
  MapElement,
  MapLayers,
} from "../types/fair-mapper";
import { ColorUtils } from "./layer-utils";

const LAYER_CONFIG = {
  locations: { zIndex: 3, color: "#EF4444", name: "Locais" },
  submaps: { zIndex: 2, color: "#3B82F6", name: "Submapas" },
  background: { zIndex: 1, color: "#6B7280", name: "Background" },
};

const SELECTION_CONFIG = {
  tolerance: 5,
  highlightColor: "#FF0000",
  highlightWidth: 3,
  showHandles: true,
  handleSize: 8,
};

/**
 * Classe responsável por renderizar o canvas do mapeador
 */
export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private backgroundImage: HTMLImageElement | null = null;
  private backgroundMeta: {
    opacity: number;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Não foi possível obter o contexto 2D do canvas");
    }
    this.ctx = context;
  }

  /**
   * Renderiza todo o mapa
   */
  render(
    layers: MapLayers,
    selectedElement: MapElement | null = null,
    debugMode: boolean = false,
    debugInfo?: DebugInfo
  ): void {
    console.log("[CanvasRenderer] render called with:", {
      background: layers.background.length,
      submaps: layers.submaps.length,
      locations: layers.locations.length,
      selectedElement: selectedElement?.id,
    });

    this.clearCanvas();

    // Calculate bounding box and apply transform to center content
    const allElements = [
      ...layers.background,
      ...layers.submaps,
      ...layers.locations,
    ];

    if (allElements.length > 0) {
      this.centerContent(allElements);
    }

    // Draw background image first (if present)
    if (this.backgroundImage && this.backgroundMeta) {
      const { opacity, x, y, width, height } = this.backgroundMeta;
      this.ctx.save();
      this.ctx.globalAlpha = opacity;
      try {
        this.ctx.drawImage(this.backgroundImage, x, y, width, height);
      } catch (err) {
        // ignore draw errors
      }
      this.ctx.restore();
    }

    // Desenhar grid se debug ativo
    if (debugMode) {
      this.drawGrid();
    }

    // Renderizar na ordem Z crescente (background primeiro, locations por último)
    this.renderLayer(layers, "background");
    this.renderLayer(layers, "submaps");
    this.renderLayer(layers, "locations");

    // Highlight do elemento selecionado
    if (selectedElement) {
      this.drawSelectionHighlight(selectedElement);
    }

    // Debug info
    if (debugMode && debugInfo) {
      this.drawDebugInfo(debugInfo);
    }

    // Restore context after centering transformation
    if (allElements.length > 0) {
      this.ctx.restore();
    }
  }

  /**
   * Centraliza o conteúdo do mapa no canvas
   */
  private centerContent(elements: MapElement[]): void {
    if (elements.length === 0) return;

    // Calculate bounding box of all elements
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    elements.forEach((element) => {
      minX = Math.min(minX, element.x);
      minY = Math.min(minY, element.y);
      maxX = Math.max(maxX, element.x + element.width);
      maxY = Math.max(maxY, element.y + element.height);
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);

    // Calculate scale to fit content in canvas (with padding)
    const padding = 40;
    const scaleX = (canvasWidth - padding * 2) / contentWidth;
    const scaleY = (canvasHeight - padding * 2) / contentHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down

    // Calculate translation to center the scaled content
    const scaledWidth = contentWidth * scale;
    const scaledHeight = contentHeight * scale;
    const offsetX = (canvasWidth - scaledWidth) / 2 - minX * scale;
    const offsetY = (canvasHeight - scaledHeight) / 2 - minY * scale;

    // Apply transformation
    this.ctx.save();
    this.ctx.translate(offsetX, offsetY);
    this.ctx.scale(scale, scale);
  }

  /**
   * Renderiza uma camada específica
   */
  private renderLayer(layers: MapLayers, layerName: LayerType): void {
    const elements = layers[layerName];
    elements.forEach((element) => {
      this.drawElement(element);
    });
  }

  /**
   * Desenha um elemento individual
   */
  private drawElement(element: MapElement): void {
    // Corpo do elemento
    this.ctx.fillStyle = element.color;
    this.ctx.fillRect(element.x, element.y, element.width, element.height);

    // Borda
    this.ctx.strokeStyle = element.borderColor;
    this.ctx.lineWidth = 1;

    if (element.layer === "submaps") {
      this.ctx.setLineDash([5, 5]);
    } else {
      this.ctx.setLineDash([]);
    }

    this.ctx.strokeRect(element.x, element.y, element.width, element.height);

    // Texto/Label
    this.drawElementText(element);

    // Debug: mostrar Z-index se debug mode ativo
    this.drawElementDebugInfo(element);
  }

  /**
   * Desenha o texto do elemento
   */
  private drawElementText(element: MapElement): void {
    this.ctx.fillStyle = ColorUtils.getContrastColor(element.color);
    this.ctx.font = `${Math.min(12, element.width / 8)}px Arial`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;

    // Nome ou tipo
    const text = element.name || element.type || "Sem nome";
    const maxWidth = element.width - 4;
    this.ctx.fillText(text, centerX, centerY, maxWidth);
  }

  /**
   * Desenha informações de debug do elemento
   */
  private drawElementDebugInfo(_element: MapElement): void {
    // Esta função será chamada apenas quando debug mode estiver ativo
    // A lógica será implementada quando necessário
  }

  /**
   * Desenha o highlight de seleção
   */
  private drawSelectionHighlight(element: MapElement): void {
    this.ctx.strokeStyle = SELECTION_CONFIG.highlightColor;
    this.ctx.lineWidth = SELECTION_CONFIG.highlightWidth;
    this.ctx.setLineDash([]);
    this.ctx.strokeRect(
      element.x - 2,
      element.y - 2,
      element.width + 4,
      element.height + 4
    );
  }

  /**
   * Desenha os handles de redimensionamento
   */
  drawResizeHandles(element: MapElement): void {
    if (!SELECTION_CONFIG.showHandles) return;

    const size = SELECTION_CONFIG.handleSize;
    const positions = [
      { x: element.x - size / 2, y: element.y - size / 2 }, // nw
      { x: element.x + element.width - size / 2, y: element.y - size / 2 }, // ne
      { x: element.x - size / 2, y: element.y + element.height - size / 2 }, // sw
      {
        x: element.x + element.width - size / 2,
        y: element.y + element.height - size / 2,
      }, // se
    ];

    this.ctx.fillStyle = SELECTION_CONFIG.highlightColor;
    positions.forEach((pos) => {
      this.ctx.fillRect(pos.x, pos.y, size, size);
    });
  }

  /**
   * Desenha um preview do elemento sendo criado
   */
  drawPreviewElement(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    layer: LayerType
  ): void {
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    this.ctx.strokeStyle = LAYER_CONFIG[layer].color;
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeRect(x, y, width, height);

    this.ctx.fillStyle = LAYER_CONFIG[layer].color + "40"; // Transparente
    this.ctx.fillRect(x, y, width, height);
  }

  /**
   * Desenha o grid de debug
   */
  private drawGrid(): void {
    const gridSize = 20;
    this.ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    this.ctx.lineWidth = 0.5;
    this.ctx.setLineDash([]);

    for (let x = 0; x <= this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y <= this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  /**
   * Desenha informações de debug
   */
  private drawDebugInfo(_debugInfo: DebugInfo): void {
    // Implementar visualização de debug se necessário
    // Por exemplo, mostrar coordenadas do mouse, hit-test info, etc.
  }

  /**
   * Limpa o canvas
   */
  private clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Obtém o contexto do canvas para operações customizadas
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * Set background image and display meta
   */
  setBackgroundImage(
    img: HTMLImageElement | null,
    meta?: {
      opacity: number;
      x: number;
      y: number;
      width: number;
      height: number;
    }
  ) {
    this.backgroundImage = img;
    this.backgroundMeta = meta || null;
    // debug

    console.debug("[CanvasRenderer] setBackgroundImage", {
      hasImage: !!img,
      meta: this.backgroundMeta,
    });
  }

  getBackgroundMeta() {
    return this.backgroundMeta;
  }

  /**
   * Atualiza o cursor baseado na ferramenta atual
   */
  updateCursor(tool: string, isDrawing: boolean = false): void {
    let cursor = "default";

    switch (tool) {
      case "select":
        cursor = "pointer";
        break;
      case "move":
        cursor = isDrawing ? "grabbing" : "grab";
        break;
      case "resize":
        cursor = "nw-resize";
        break;
      case "paint":
        cursor = "crosshair";
        break;
      case "draw":
        cursor = "crosshair";
        break;
    }

    this.canvas.style.cursor = cursor;
  }
}

/**
 * Hook para usar o renderer do canvas
 */
export function useCanvasRenderer(
  canvasRef: React.RefObject<HTMLCanvasElement>
) {
  let renderer: CanvasRenderer | null = null;

  const getRenderer = (): CanvasRenderer | null => {
    if (!canvasRef.current) return null;

    if (!renderer) {
      renderer = new CanvasRenderer(canvasRef.current);
    }

    return renderer;
  };

  const render = (
    layers: MapLayers,
    selectedElement: MapElement | null = null,
    debugMode: boolean = false,
    debugInfo?: DebugInfo
  ): void => {
    const canvasRenderer = getRenderer();
    if (canvasRenderer) {
      canvasRenderer.render(layers, selectedElement, debugMode, debugInfo);
    }
  };

  const drawPreviewElement = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    layer: LayerType
  ): void => {
    const canvasRenderer = getRenderer();
    if (canvasRenderer) {
      canvasRenderer.drawPreviewElement(startX, startY, endX, endY, layer);
    }
  };

  const drawResizeHandles = (element: MapElement): void => {
    const canvasRenderer = getRenderer();
    if (canvasRenderer) {
      canvasRenderer.drawResizeHandles(element);
    }
  };

  const updateCursor = (tool: string, isDrawing: boolean = false): void => {
    const canvasRenderer = getRenderer();
    if (canvasRenderer) {
      canvasRenderer.updateCursor(tool, isDrawing);
    }
  };

  return {
    render,
    drawPreviewElement,
    drawResizeHandles,
    updateCursor,
    getRenderer,
  };
}
