/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import type {
  DebugInfo,
  LayerType,
  MapElement,
  MapLayers,
} from "../types/fair-mapper";

const LAYER_CONFIG = {
  locations: { zIndex: 3, color: "#EF4444", name: "Locais" },
  submaps: { zIndex: 2, color: "#3B82F6", name: "Submapas" },
  background: { zIndex: 1, color: "#6B7280", name: "Background" },
};

// SVG paths dos ícones lucide-react para cada categoria
const CATEGORY_ICONS: Record<string, string> = {
  food: "M3 2l2.01 18.23L12 17l6.99 3.23L21 2H3zm7 12V7h4v7l-2-1-2 1z", // UtensilsCrossed
  clothing:
    "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6zm0 0h12m-9 5h6", // ShoppingBag
  electronics:
    "M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16", // Laptop
  jewelry:
    "M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z", // Gem
  books: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20", // BookOpen
  sports:
    "M6 9H4.5a2.5 2.5 0 0 1 0-5H6m0 5V4m0 5h12m0 0V4m0 5h1.5a2.5 2.5 0 0 0 0-5H18m0 5v10m0-10L6 19m12 0h1.5a2.5 2.5 0 0 1 0 5H18m-12 0H4.5a2.5 2.5 0 0 0 0 5H6m0-5v-5", // Trophy
  home: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10", // Home
  beauty:
    "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z", // Sparkles
  toys: "M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5m-7 6 1-9m6 9-1-9M6 19c.7-1.2 1.8-2 3-2m9 2c-.7-1.2-1.8-2-3-2m3-5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM9 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", // Baby
  services:
    "M8 2v4m8-4v4M3 10h18m-9 4h.01M8 14h.01m7.99 0h.01M8 18h.01m3.99 0h.01m3.99 0h.01M5 22h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z", // Calendar
  other:
    "M16 16h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-6m-2 10H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6m-2 10V6m10 4L3 3", // Package
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
  private imageCache: Map<string, HTMLImageElement> = new Map();

  // Armazenar a transformação atual para conversão de coordenadas
  private currentTransform = {
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  };

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
    debugInfo?: DebugInfo,
    filteredStoreIds?: Set<string>,
    hasActiveFilters: boolean = false,
    zoomLevel: number = 1
  ): void {
    this.clearCanvas();

    // Calculate bounding box and apply transform to center content
    const allElements = [
      ...layers.background,
      ...layers.submaps,
      ...layers.locations,
    ];

    if (allElements.length > 0) {
      this.centerContent(allElements, zoomLevel);
    } else {
      // No elements to render, just return
      return;
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
    this.renderLayer(layers, "background", filteredStoreIds, hasActiveFilters);
    this.renderLayer(layers, "submaps", filteredStoreIds, hasActiveFilters);
    this.renderLayer(layers, "locations", filteredStoreIds, hasActiveFilters);

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
  private centerContent(elements: MapElement[], zoomLevel: number = 1): void {
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
    const baseScale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
    const scale = baseScale * zoomLevel; // Apply zoom level

    // Calculate translation to center the scaled content
    const scaledWidth = contentWidth * scale;
    const scaledHeight = contentHeight * scale;
    const offsetX = (canvasWidth - scaledWidth) / 2 - minX * scale;
    const offsetY = (canvasHeight - scaledHeight) / 2 - minY * scale;

    // Armazenar transformação para uso posterior
    this.currentTransform = {
      offsetX,
      offsetY,
      scale,
    };

    // Apply transformation
    this.ctx.save();
    this.ctx.translate(offsetX, offsetY);
    this.ctx.scale(scale, scale);
  }

  /**
   * Renderiza uma camada específica
   */
  private renderLayer(
    layers: MapLayers,
    layerName: LayerType,
    filteredStoreIds?: Set<string>,
    hasActiveFilters: boolean = false
  ): void {
    const elements = layers[layerName];
    elements.forEach((element) => {
      this.drawElement(element, filteredStoreIds, hasActiveFilters);
    });
  }

  /**
   * Desenha um elemento individual
   */
  private drawElement(
    element: MapElement,
    filteredStoreIds?: Set<string>,
    hasActiveFilters: boolean = false
  ): void {
    // Validar valores antes de desenhar
    if (
      !isFinite(element.x) ||
      !isFinite(element.y) ||
      !isFinite(element.width) ||
      !isFinite(element.height) ||
      element.width <= 0 ||
      element.height <= 0
    ) {
      console.warn("[CanvasRenderer] Skipping invalid element:", element);
      return;
    }

    const radius = 12; // Bordas mais arredondadas
    const isStore = element.layer === "locations" && element.storeId;
    const isSubmap = element.layer === "submaps";
    const isBackground = element.layer === "background";

    // Determinar se este elemento está filtrado
    const isFiltered =
      hasActiveFilters && isStore && filteredStoreIds
        ? filteredStoreIds.has(element.storeId!)
        : true;

    // Aplicar opacidade reduzida para elementos não filtrados
    const opacity = !hasActiveFilters || isFiltered ? 1 : 0.25;
    this.ctx.globalAlpha = opacity;

    // Sombra para todos os elementos
    if (isStore && isFiltered) {
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
      this.ctx.shadowBlur = 16;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 2;
    } else if (isStore || isSubmap || isBackground) {
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.06)";
      this.ctx.shadowBlur = 12;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 2;
    }

    // Corpo do elemento - branco para todos
    this.ctx.fillStyle = "#FFFFFF";
    this.drawRoundedRect(
      element.x,
      element.y,
      element.width,
      element.height,
      radius
    );
    this.ctx.fill();

    // Remover sombra para próximos desenhos
    this.ctx.shadowColor = "transparent";
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;

    // Borda sutil
    this.ctx.strokeStyle = "#E5E7EB";
    this.ctx.lineWidth = 1;

    if (isSubmap) {
      this.ctx.setLineDash([5, 5]);
    } else {
      this.ctx.setLineDash([]);
    }

    this.drawRoundedRect(
      element.x,
      element.y,
      element.width,
      element.height,
      radius
    );
    this.ctx.stroke();

    // Adicionar destaque visual para elementos filtrados (borda azul)
    if (hasActiveFilters && isFiltered && isStore) {
      this.ctx.strokeStyle = "#3B82F6";
      this.ctx.lineWidth = 3;
      this.ctx.setLineDash([]);
      this.drawRoundedRect(
        element.x,
        element.y,
        element.width,
        element.height,
        radius
      );
      this.ctx.stroke();
    }

    // Texto/Label
    this.drawElementText(element);

    // Debug: mostrar Z-index se debug mode ativo
    this.drawElementDebugInfo(element);

    // Resetar globalAlpha
    this.ctx.globalAlpha = 1;
  }

  /**
   * Carrega uma imagem no cache
   */
  private loadImageToCache(url: string): void {
    if (this.imageCache.has(url)) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      this.imageCache.set(url, img);
    };

    img.onerror = () => {
      // Remover do cache se falhar
      this.imageCache.delete(url);
    };

    img.src = url;
  }

  /**
   * Desenha um ícone de categoria usando path SVG
   */
  private drawCategoryIcon(
    category: string,
    centerX: number,
    centerY: number,
    size: number,
    color: string
  ): void {
    const iconPath = CATEGORY_ICONS[category] || CATEGORY_ICONS.other;

    this.ctx.save();
    this.ctx.translate(centerX, centerY);

    // Escalar o ícone para o tamanho desejado (ícones lucide são 24x24 por padrão)
    const scale = size / 24;
    this.ctx.scale(scale, scale);

    // Centralizar o ícone (compensar o viewBox 0 0 24 24)
    this.ctx.translate(-12, -12);

    // Criar path a partir do SVG
    const path = new Path2D(iconPath);

    // Configurar estilo
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.fillStyle = "transparent";

    // Desenhar o path
    this.ctx.stroke(path);

    this.ctx.restore();
  }

  /**
   * Desenha o texto do elemento
   */
  private drawElementText(element: MapElement): void {
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;

    // Se o elemento tiver uma loja vinculada com imagem, desenhar a imagem de fundo de forma discreta
    if (element.layer === "locations" && element.storeLogo) {
      // Tentar carregar a imagem no cache
      this.loadImageToCache(element.storeLogo);
      // Desenhar se já estiver carregada
      const cachedImage = this.imageCache.get(element.storeLogo);
      if (cachedImage) {
        this.drawStoreLogoBackground(element, cachedImage);
      }
    }

    // Badge colorido no canto superior direito
    // Para lojas - badge com ícone de categoria
    if (element.layer === "locations" && element.storeId) {
      const badgeSize = Math.min(32, element.width / 4);
      const badgeX = element.x + element.width - badgeSize - 8;
      const badgeY = element.y + 8;

      // Obter cor da categoria (ou cinza padrão se não tiver categoria)
      const categoryColors: Record<string, string> = {
        food: "#F97316",
        clothing: "#3B82F6",
        electronics: "#9333EA",
        jewelry: "#EC4899",
        books: "#EAB308",
        sports: "#EF4444",
        home: "#10B981",
        beauty: "#EC4899",
        toys: "#6366F1",
        services: "#22D3EE",
        other: "#6B7280",
      };
      const badgeColor = element.storeCategory
        ? categoryColors[element.storeCategory] || "#6B7280"
        : "#6B7280"; // Cinza padrão se não tiver categoria

      // Sombra do badge
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
      this.ctx.shadowBlur = 4;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 2;

      // Badge circular colorido
      this.ctx.fillStyle = badgeColor;
      this.ctx.beginPath();
      this.ctx.arc(
        badgeX + badgeSize / 2,
        badgeY + badgeSize / 2,
        badgeSize / 2,
        0,
        Math.PI * 2
      );
      this.ctx.fill();

      // Remover sombra
      this.ctx.shadowColor = "transparent";
      this.ctx.shadowBlur = 0;

      // Desenhar ícone SVG branco no centro do badge
      if (element.storeCategory) {
        this.drawCategoryIcon(
          element.storeCategory,
          badgeX + badgeSize / 2,
          badgeY + badgeSize / 2,
          badgeSize * 0.5,
          "#FFFFFF"
        );
      } else {
        // Se não tiver categoria, desenhar ícone genérico de loja (MapPin)
        const iconSize = badgeSize * 0.5;
        this.ctx.strokeStyle = "#FFFFFF";
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";

        const cx = badgeX + badgeSize / 2;
        const cy = badgeY + badgeSize / 2;
        const r = iconSize / 3;

        // Desenhar pin de localização simples
        this.ctx.beginPath();
        this.ctx.arc(cx, cy - r * 0.5, r, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy + r * 0.5);
        this.ctx.lineTo(cx, cy + r * 1.5);
        this.ctx.stroke();
      }
    }

    // Para submapas - badge com cor do layer
    if (element.layer === "submaps") {
      const badgeSize = Math.min(32, element.width / 4);
      const badgeX = element.x + element.width - badgeSize - 8;
      const badgeY = element.y + 8;

      // Sombra do badge
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
      this.ctx.shadowBlur = 4;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 2;

      // Badge circular com cor do submapa
      this.ctx.fillStyle = LAYER_CONFIG.submaps.color;
      this.ctx.beginPath();
      this.ctx.arc(
        badgeX + badgeSize / 2,
        badgeY + badgeSize / 2,
        badgeSize / 2,
        0,
        Math.PI * 2
      );
      this.ctx.fill();

      // Remover sombra
      this.ctx.shadowColor = "transparent";
      this.ctx.shadowBlur = 0;

      // Ícone de grid/mapa no badge
      const iconSize = badgeSize * 0.5;
      this.ctx.strokeStyle = "#FFFFFF";
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";

      const cx = badgeX + badgeSize / 2;
      const cy = badgeY + badgeSize / 2;
      const r = iconSize / 2;

      // Desenhar ícone de grid 3x3
      this.ctx.beginPath();
      this.ctx.moveTo(cx - r * 0.6, cy - r);
      this.ctx.lineTo(cx - r * 0.6, cy + r);
      this.ctx.moveTo(cx + r * 0.6, cy - r);
      this.ctx.lineTo(cx + r * 0.6, cy + r);
      this.ctx.moveTo(cx - r, cy - r * 0.6);
      this.ctx.lineTo(cx + r, cy - r * 0.6);
      this.ctx.moveTo(cx - r, cy + r * 0.6);
      this.ctx.lineTo(cx + r, cy + r * 0.6);
      this.ctx.stroke();
    }

    // Para background - badge com cor do layer
    if (element.layer === "background") {
      const badgeSize = Math.min(32, element.width / 4);
      const badgeX = element.x + element.width - badgeSize - 8;
      const badgeY = element.y + 8;

      // Sombra do badge
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
      this.ctx.shadowBlur = 4;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 2;

      // Badge circular com cor do background
      this.ctx.fillStyle = LAYER_CONFIG.background.color;
      this.ctx.beginPath();
      this.ctx.arc(
        badgeX + badgeSize / 2,
        badgeY + badgeSize / 2,
        badgeSize / 2,
        0,
        Math.PI * 2
      );
      this.ctx.fill();

      // Remover sombra
      this.ctx.shadowColor = "transparent";
      this.ctx.shadowBlur = 0;

      // Ícone de camadas no badge
      const iconSize = badgeSize * 0.5;
      this.ctx.strokeStyle = "#FFFFFF";
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";

      const cx = badgeX + badgeSize / 2;
      const cy = badgeY + badgeSize / 2;
      const r = iconSize / 2;

      // Desenhar ícone de camadas (3 retângulos empilhados)
      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.fillRect(cx - r * 0.8, cy - r * 0.8, r * 1.6, r * 0.4);
      this.ctx.fillRect(cx - r * 0.8, cy - r * 0.2, r * 1.6, r * 0.4);
      this.ctx.fillRect(cx - r * 0.8, cy + r * 0.4, r * 1.6, r * 0.4);
    }

    // Desenhar o nome e subtítulo
    const isStore = element.layer === "locations" && element.storeId;
    const isSubmap = element.layer === "submaps";
    const isBackground = element.layer === "background";

    const text = element.name || element.type || "Sem nome";
    const maxWidth = element.width - 24;

    if (isStore) {
      // Lojas: título + subtítulo (categoria se disponível)
      const titleFontSize = Math.min(13, Math.max(11, element.width / 12));
      const subtitleFontSize = Math.min(10, Math.max(8, element.width / 16));

      // Título (nome da loja)
      this.ctx.font = `600 ${titleFontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillStyle = "#1F2937";
      this.ctx.fillText(text, centerX, centerY - 6, maxWidth);

      // Subtítulo (categoria)
      if (element.storeCategory) {
        const categoryLabels: Record<string, string> = {
          food: "ALIMENTAÇÃO",
          clothing: "ROUPAS",
          electronics: "TECNOLOGIA",
          jewelry: "JOIAS",
          books: "LIVROS",
          sports: "ESPORTES",
          home: "CASA",
          beauty: "BELEZA",
          toys: "BRINQUEDOS",
          services: "SERVIÇOS",
          other: "OUTROS",
        };
        const categoryText = categoryLabels[element.storeCategory] || "OUTROS";

        this.ctx.font = `400 ${subtitleFontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`;
        this.ctx.fillStyle = "#9CA3AF";
        this.ctx.fillText(categoryText, centerX, centerY + 8, maxWidth);
      } else {
        // Se não tiver categoria, mostrar "ESPAÇO"
        this.ctx.font = `400 ${subtitleFontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`;
        this.ctx.fillStyle = "#9CA3AF";
        this.ctx.fillText("ESPAÇO", centerX, centerY + 8, maxWidth);
      }
    } else if (isSubmap) {
      // Submapas: título + subtítulo "SUBMAPA"
      const titleFontSize = Math.min(13, Math.max(11, element.width / 12));
      const subtitleFontSize = Math.min(10, Math.max(8, element.width / 16));

      // Título
      this.ctx.font = `600 ${titleFontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillStyle = "#1F2937";
      this.ctx.fillText(text, centerX, centerY - 6, maxWidth);

      // Subtítulo
      this.ctx.font = `400 ${subtitleFontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`;
      this.ctx.fillStyle = "#9CA3AF";
      this.ctx.fillText("SUBMAPA", centerX, centerY + 8, maxWidth);
    } else if (isBackground) {
      // Background: título + subtítulo "FUNDO"
      const titleFontSize = Math.min(13, Math.max(11, element.width / 12));
      const subtitleFontSize = Math.min(10, Math.max(8, element.width / 16));

      // Título
      this.ctx.font = `600 ${titleFontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillStyle = "#1F2937";
      this.ctx.fillText(text, centerX, centerY - 6, maxWidth);

      // Subtítulo
      this.ctx.font = `400 ${subtitleFontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`;
      this.ctx.fillStyle = "#9CA3AF";
      this.ctx.fillText("FUNDO", centerX, centerY + 8, maxWidth);
    } else {
      // Outros elementos - texto simples
      const fontSize = Math.min(12, Math.max(10, element.width / 12));
      this.ctx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillStyle = "#1F2937";
      this.ctx.fillText(text, centerX, centerY, maxWidth);
    }
  }

  /**
   * Desenha a logo da loja como fundo discreto
   */
  private drawStoreLogoBackground(
    element: MapElement,
    img: HTMLImageElement
  ): void {
    this.ctx.save();

    // Desenhar com opacidade baixa para ser discreto
    this.ctx.globalAlpha = 0.15;

    // Calcular dimensões para manter proporção
    const padding = 10;
    const maxWidth = element.width - padding * 2;
    const maxHeight = element.height - padding * 2;

    let drawWidth = maxWidth;
    let drawHeight = maxHeight;

    const aspectRatio = img.width / img.height;

    if (maxWidth / maxHeight > aspectRatio) {
      drawWidth = maxHeight * aspectRatio;
    } else {
      drawHeight = maxWidth / aspectRatio;
    }

    const drawX = element.x + (element.width - drawWidth) / 2;
    const drawY = element.y + (element.height - drawHeight) / 2;

    try {
      this.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    } catch (err) {
      // Ignorar erros de desenho
    }

    this.ctx.restore();
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
   * Desenha um retângulo com bordas arredondadas
   */
  private drawRoundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height
    );
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  /**
   * Limpa o canvas
   */
  private clearCanvas(): void {
    // Fundo cinza bem claro
    this.ctx.fillStyle = "#F5F7FA";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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

  /**
   * Transforma coordenadas de tela para coordenadas do mundo do canvas
   * Aplica a transformação inversa usada na renderização
   */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const { offsetX, offsetY, scale } = this.currentTransform;

    // Aplicar transformação inversa
    const worldX = (screenX - offsetX) / scale;
    const worldY = (screenY - offsetY) / scale;

    return { x: worldX, y: worldY };
  }

  /**
   * Obtém a transformação atual
   */
  getCurrentTransform() {
    return { ...this.currentTransform };
  }
}

/**
 * Hook para usar o renderer do canvas
 */
export function useCanvasRenderer(
  canvasRef: React.RefObject<HTMLCanvasElement>
) {
  const rendererRef = React.useRef<CanvasRenderer | null>(null);

  const getRenderer = React.useCallback((): CanvasRenderer | null => {
    if (!canvasRef.current) return null;

    if (!rendererRef.current) {
      rendererRef.current = new CanvasRenderer(canvasRef.current);
    }

    return rendererRef.current;
  }, [canvasRef]);

  const render = React.useCallback(
    (
      layers: MapLayers,
      selectedElement: MapElement | null = null,
      debugMode: boolean = false,
      debugInfo?: DebugInfo,
      filteredStoreIds?: Set<string>,
      hasActiveFilters: boolean = false,
      zoomLevel: number = 1
    ): void => {
      const canvasRenderer = getRenderer();
      if (canvasRenderer) {
        canvasRenderer.render(
          layers,
          selectedElement,
          debugMode,
          debugInfo,
          filteredStoreIds,
          hasActiveFilters,
          zoomLevel
        );
      }
    },
    [getRenderer]
  );

  const drawPreviewElement = React.useCallback(
    (
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
    },
    [getRenderer]
  );

  const drawResizeHandles = React.useCallback(
    (element: MapElement): void => {
      const canvasRenderer = getRenderer();
      if (canvasRenderer) {
        canvasRenderer.drawResizeHandles(element);
      }
    },
    [getRenderer]
  );

  const updateCursor = React.useCallback(
    (tool: string, isDrawing: boolean = false): void => {
      const canvasRenderer = getRenderer();
      if (canvasRenderer) {
        canvasRenderer.updateCursor(tool, isDrawing);
      }
    },
    [getRenderer]
  );

  const screenToWorld = React.useCallback(
    (screenX: number, screenY: number): { x: number; y: number } => {
      const canvasRenderer = getRenderer();
      if (canvasRenderer) {
        return canvasRenderer.screenToWorld(screenX, screenY);
      }
      return { x: screenX, y: screenY };
    },
    [getRenderer]
  );

  return {
    render,
    drawPreviewElement,
    drawResizeHandles,
    updateCursor,
    getRenderer,
    screenToWorld,
  };
}
