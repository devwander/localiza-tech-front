import { useCallback, useEffect, useRef, useState } from "react";
import type {
  BackgroundImageMeta,
  DebugInfo,
  LayerType,
  MapData,
  MapElement,
  MapLayers,
  MouseState,
  Point,
  ToolType,
  UseFairMapperReturn,
} from "../types/fair-mapper";
import { useCanvasRenderer } from "../utils/canvas-renderer";
import {
  ColorUtils,
  ElementUtils,
  LayerUtils,
  SelectionUtils,
} from "../utils/layer-utils";

/**
 * Hook principal do Fair Mapper
 */
export function useFairMapper(): UseFairMapperReturn {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextIdRef = useRef(1);

  // Estado principal
  const [layers, setLayers] = useState<MapLayers>(
    LayerUtils.createEmptyLayers()
  );
  const [selectedElement, setSelectedElement] = useState<MapElement | null>(
    null
  );
  const [currentTool, setCurrentTool] = useState<ToolType>("select");
  const [currentLayer, setCurrentLayer] = useState<LayerType | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  // Estado do mouse e interações
  const [mouseState, setMouseState] = useState<MouseState>({
    isDrawing: false,
    isDragging: false,
    isResizing: false,
    drawStart: null,
    dragOffset: { x: 0, y: 0 },
    resizeHandle: null,
  });

  // Estado de debug
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    mousePos: { x: 0, y: 0 },
    canvasPos: { x: 0, y: 0 },
    lastHitTest: [],
  });

  // Renderer do canvas
  const {
    render,
    drawPreviewElement,
    drawResizeHandles,
    updateCursor,
    getRenderer,
  } = useCanvasRenderer(canvasRef as React.RefObject<HTMLCanvasElement>);

  // Background image (in-memory). We keep meta here but do not persist the binary in fairMapperData.
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const [backgroundMeta, setBackgroundMeta] =
    useState<BackgroundImageMeta | null>(null);

  /**
   * Converte coordenadas do mouse para coordenadas do canvas
   */
  const getCanvasCoordinates = useCallback(
    (e: MouseEvent): Point => {
      if (!canvasRef.current) {
        return { x: 0, y: 0 };
      }

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Atualizar debug info
      if (debugMode) {
        setDebugInfo((prev) => ({
          ...prev,
          mousePos: { x: e.clientX, y: e.clientY },
          canvasPos: { x, y },
        }));
      }

      return { x, y };
    },
    [debugMode]
  );

  /**
   * Seleciona um elemento na posição especificada
   */
  const selectElementAtPosition = useCallback(
    (point: Point): MapElement | null => {
      const element = SelectionUtils.selectElementAtPosition(layers, point);

      if (debugMode) {
        const hitTestInfo = element
          ? `✓ HIT: ${element.name} (${element.layer})`
          : "✗ No element found";

        setDebugInfo((prev) => ({
          ...prev,
          lastHitTest: [hitTestInfo],
        }));
      }

      return element;
    },
    [layers, debugMode]
  );

  /**
   * Atualiza um elemento
   */
  const updateElement = useCallback(
    (id: number, updates: Partial<MapElement>): void => {
      console.log("[FairMapper] updateElement called", { id, updates });

      setLayers((prev) => {
        const updated = LayerUtils.updateElement(prev, id, updates);
        console.log("[FairMapper] Layers before:", {
          background: prev.background.length,
          submaps: prev.submaps.length,
          locations: prev.locations.length,
        });
        console.log("[FairMapper] Layers after:", {
          background: updated.background.length,
          submaps: updated.submaps.length,
          locations: updated.locations.length,
        });
        return updated;
      });

      // Atualizar selectedElement se for o mesmo
      if (selectedElement && selectedElement.id === id) {
        setSelectedElement((prev) => {
          if (!prev) return null;
          return { ...prev, ...updates } as MapElement;
        });
      }
    },
    [selectedElement]
  );

  /**
   * Cria um novo elemento
   */
  const createNewElement = useCallback(
    (
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      layer: LayerType
    ): void => {
      const x = Math.min(startX, endX);
      const y = Math.min(startY, endY);
      const width = Math.abs(endX - startX);
      const height = Math.abs(endY - startY);

      // debug: log dimensions

      console.debug("[FairMapper] createNewElement dims", {
        startX,
        startY,
        endX,
        endY,
        x,
        y,
        width,
        height,
        layer,
      });

      if (width < 10 || height < 10) {
        console.debug(
          "[FairMapper] createNewElement aborted: element too small"
        );
        return; // Elemento muito pequeno
      }

      const id = nextIdRef.current++;
      let element: MapElement;

      switch (layer) {
        case "background":
          element = ElementUtils.createBackgroundElement(
            id,
            x,
            y,
            width,
            height
          );
          break;
        case "submaps":
          element = ElementUtils.createSubmapElement(id, x, y, width, height);
          break;
        case "locations":
          element = ElementUtils.createLocationElement(id, x, y, width, height);
          break;
      }

      setLayers((prev) => LayerUtils.addElement(prev, element));
      setSelectedElement(element);
    },
    []
  );

  /**
   * Renderiza o canvas
   */
  const renderCanvas = useCallback((): void => {
    // Render the canvas
    render(layers, selectedElement, debugMode, debugInfo);

    // Desenhar handles de resize se necessário
    if (selectedElement && currentTool === "resize") {
      drawResizeHandles(selectedElement);
    }
  }, [
    layers,
    selectedElement,
    debugMode,
    debugInfo,
    currentTool,
    render,
    drawResizeHandles,
  ]);

  // Sync background image to renderer when meta or image changes
  useEffect(() => {
    const canvasRenderer = getRenderer();
    if (canvasRenderer) {
      const img = backgroundImageRef.current;
      if (img && backgroundMeta) {
        canvasRenderer.setBackgroundImage(img, {
          opacity: backgroundMeta.opacity,
          x: backgroundMeta.x,
          y: backgroundMeta.y,
          width: backgroundMeta.width,
          height: backgroundMeta.height,
        });
      } else {
        canvasRenderer.setBackgroundImage(null);
      }
    }

    // re-render to show changes
    renderCanvas();
  }, [backgroundMeta, canvasRef, renderCanvas]);

  /**
   * Handler para clique no canvas
   */
  const handleCanvasClick = useCallback(
    (e: MouseEvent): void => {
      const { x, y } = getCanvasCoordinates(e);

      if (currentTool === "select") {
        const element = selectElementAtPosition({ x, y });
        setSelectedElement(element);
      } else if (currentTool === "paint") {
        // Selecionar elemento sob o cursor
        const element = selectElementAtPosition({ x, y });
        if (element) {
          setSelectedElement(element);
          // Muda a cor do elemento (ciclo)
          const nextColor = ColorUtils.getNextLocationColor(element.color);
          updateElement(element.id, { color: nextColor });
          // Re-render
          renderCanvas();
        }
      }
    },
    [
      currentTool,
      selectedElement,
      getCanvasCoordinates,
      selectElementAtPosition,
      updateElement,
      renderCanvas,
    ]
  );

  /**
   * Handler para mouse down
   */
  const handleMouseDown = useCallback(
    (e: MouseEvent): void => {
      const { x, y } = getCanvasCoordinates(e);

      console.debug("[FairMapper] mouseDown", {
        x,
        y,
        currentLayer,
        currentTool,
      });

      if (currentLayer && currentTool === "draw") {
        // Iniciando desenho de novo elemento
        setMouseState((prev) => ({
          ...prev,
          isDrawing: true,
          drawStart: { x, y },
        }));
      } else if (currentTool === "move" || currentTool === "resize") {
        const element = selectElementAtPosition({ x, y });
        if (element) {
          setSelectedElement(element);

          if (currentTool === "move") {
            setMouseState((prev) => ({
              ...prev,
              isDragging: true,
              dragOffset: {
                x: x - element.x,
                y: y - element.y,
              },
            }));
          } else if (currentTool === "resize") {
            const handle = SelectionUtils.getResizeHandle({ x, y }, element);
            if (handle) {
              setMouseState((prev) => ({
                ...prev,
                isResizing: true,
                resizeHandle: handle,
              }));
            }
          }
        }
      }
    },
    [currentLayer, currentTool, getCanvasCoordinates, selectElementAtPosition]
  );

  /**
   * Handler para mouse move
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent): void => {
      const { x, y } = getCanvasCoordinates(e);

      if (mouseState.isDrawing && mouseState.drawStart && currentLayer) {
        // Redesenhar com preview
        renderCanvas();
        drawPreviewElement(
          mouseState.drawStart.x,
          mouseState.drawStart.y,
          x,
          y,
          currentLayer
        );
      } else if (mouseState.isDragging && selectedElement) {
        // Mover elemento selecionado
        const newX = x - mouseState.dragOffset.x;
        const newY = y - mouseState.dragOffset.y;
        updateElement(selectedElement.id, { x: newX, y: newY });
      } else if (
        mouseState.isResizing &&
        selectedElement &&
        mouseState.resizeHandle
      ) {
        // Redimensionar elemento
        const updates = ElementUtils.resizeElement(
          selectedElement,
          mouseState.resizeHandle,
          { x, y }
        );
        updateElement(selectedElement.id, updates);
      }

      // Atualizar cursor
      updateCursor(currentTool, mouseState.isDragging);
    },
    [
      mouseState,
      selectedElement,
      currentLayer,
      currentTool,
      getCanvasCoordinates,
      drawPreviewElement,
      updateCursor,
      renderCanvas,
      updateElement,
    ]
  );

  /**
   * Handler para mouse up
   */
  const handleMouseUp = useCallback(
    (e: MouseEvent): void => {
      const { x, y } = getCanvasCoordinates(e);

      console.debug("[FairMapper] mouseUp", { x, y, mouseState, currentLayer });

      if (mouseState.isDrawing && mouseState.drawStart && currentLayer) {
        // Finalizar desenho de elemento
        createNewElement(
          mouseState.drawStart.x,
          mouseState.drawStart.y,
          x,
          y,
          currentLayer
        );
        setCurrentLayer(null);
      }

      // Reset do estado do mouse
      setMouseState((prev) => ({
        ...prev,
        isDrawing: false,
        isDragging: false,
        isResizing: false,
        drawStart: null,
        resizeHandle: null,
      }));
    },
    [mouseState, currentLayer, getCanvasCoordinates, createNewElement]
  );

  /**
   * Handler para clique direito
   */
  const handleRightClick = useCallback((e: MouseEvent): void => {
    e.preventDefault();

    // Cancelar operações em andamento
    setMouseState({
      isDrawing: false,
      isDragging: false,
      isResizing: false,
      drawStart: null,
      dragOffset: { x: 0, y: 0 },
      resizeHandle: null,
    });
    setCurrentLayer(null);
  }, []);

  /**
   * Remove um elemento
   */
  const deleteElement = useCallback(
    (id: number): void => {
      setLayers((prev) => LayerUtils.removeElement(prev, id));

      // Deselecionar se for o elemento atual
      if (selectedElement && selectedElement.id === id) {
        setSelectedElement(null);
      }
    },
    [selectedElement]
  );

  /**
   * Define a ferramenta ativa
   */
  const setTool = useCallback((tool: ToolType): void => {
    setCurrentTool(tool);
    setCurrentLayer(null);
    setSelectedElement(null);
    setMouseState({
      isDrawing: false,
      isDragging: false,
      isResizing: false,
      drawStart: null,
      dragOffset: { x: 0, y: 0 },
      resizeHandle: null,
    });
  }, []);

  /**
   * Define o modo de desenho
   */
  const setDrawMode = useCallback((layer: LayerType): void => {
    setCurrentTool("draw");
    setCurrentLayer(layer);
    setSelectedElement(null);
  }, []);

  /**
   * Seleciona um elemento
   */
  const selectElement = useCallback((element: MapElement | null): void => {
    setSelectedElement(element);
  }, []);

  /**
   * Toggle do modo debug
   */
  const toggleDebugMode = useCallback((): void => {
    setDebugMode((prev) => !prev);
  }, []);

  /**
   * Salva mapa como arquivo
   */
  const saveMap = useCallback((): void => {
    const data: MapData = {
      layers,
      nextId: nextIdRef.current,
      timestamp: new Date().toISOString(),
      version: "1.0",
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mapa-feira-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [layers]);

  /**
   * Carrega mapa de arquivo
   */
  const loadMap = useCallback(async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string) as MapData;
          setLayers(data.layers || LayerUtils.createEmptyLayers());
          nextIdRef.current = data.nextId || 1;
          setSelectedElement(null);
          resolve();
        } catch (error) {
          if (error instanceof Error) reject(error);
          else reject(new Error(String(error)));
        }
      };
      reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
      reader.readAsText(file);
    });
  }, []);

  /**
   * Carrega layers diretamente (usado para carregar dados da API)
   * SEMPRE usa os dados da API - sem cache
   */
  const loadLayers = useCallback(
    (newLayers: MapLayers, nextId?: number, mapId?: string): void => {
      console.log("[FairMapper] loadLayers called with:", {
        background: newLayers.background.length,
        submaps: newLayers.submaps.length,
        locations: newLayers.locations.length,
        nextId,
        mapId,
      });

      // SEMPRE usa os dados fornecidos (da API)
      console.log(
        "[FairMapper] Loading layers from API (always uses latest from database)"
      );
      setLayers(newLayers);
      if (nextId !== undefined) {
        nextIdRef.current = nextId;
      }
      setSelectedElement(null);
      // Renderização será feita pelo useEffect que monitora layers
    },
    []
  );

  /**
   * Handle image file upload: load into an HTMLImageElement and set background meta
   */
  const uploadBackgroundImage = useCallback(
    (file: File): Promise<void> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = String(reader.result ?? "");
          const img = new Image();
          img.onload = () => {
            backgroundImageRef.current = img;

            // default to fit canvas size; fall back to natural image size when canvas is not yet measured
            const canvas = canvasRef.current;
            let cssWidth = canvas ? canvas.clientWidth : 0;
            let cssHeight = canvas ? canvas.clientHeight : 0;
            if (!cssWidth || cssWidth < 10)
              cssWidth = img.naturalWidth || img.width || 800;
            if (!cssHeight || cssHeight < 10)
              cssHeight = img.naturalHeight || img.height || 600;

            // debug trace

            console.debug("[FairMapper] background image loaded", {
              file: file.name,
              cssWidth,
              cssHeight,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
            });

            setBackgroundMeta({
              src: dataUrl,
              opacity: 0.5,
              x: 0,
              y: 0,
              width: cssWidth,
              height: cssHeight,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
            });

            // trigger render
            renderCanvas();
            resolve();
          };
          img.onerror = (err) => reject(err);
          img.src = dataUrl;
        };
        reader.onerror = () => reject(new Error("Erro ao carregar imagem"));
        reader.readAsDataURL(file);
      });
    },
    [canvasRef, renderCanvas]
  );

  const setBackgroundOpacity = useCallback((opacity: number) => {
    setBackgroundMeta((prev: BackgroundImageMeta | null) =>
      prev ? { ...prev, opacity } : prev
    );
  }, []);

  const setBackgroundTransform = useCallback(
    (x: number, y: number, width: number, height: number) => {
      setBackgroundMeta((prev: BackgroundImageMeta | null) =>
        prev ? { ...prev, x, y, width, height } : prev
      );
    },
    []
  );

  const removeBackgroundImage = useCallback(() => {
    backgroundImageRef.current = null;
    setBackgroundMeta(null);
    renderCanvas();
  }, [renderCanvas]);

  // Adicionar event listeners ao canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("click", handleCanvasClick as EventListener);
    canvas.addEventListener("mousedown", handleMouseDown as EventListener);
    canvas.addEventListener("mousemove", handleMouseMove as EventListener);
    // capture mouseup on both canvas and window so we don't miss it when cursor leaves canvas
    canvas.addEventListener("mouseup", handleMouseUp as EventListener);
    window.addEventListener("mouseup", handleMouseUp as EventListener);
    canvas.addEventListener("contextmenu", handleRightClick as EventListener);

    return () => {
      canvas.removeEventListener("click", handleCanvasClick as EventListener);
      canvas.removeEventListener("mousedown", handleMouseDown as EventListener);
      canvas.removeEventListener("mousemove", handleMouseMove as EventListener);
      canvas.removeEventListener("mouseup", handleMouseUp as EventListener);
      window.removeEventListener("mouseup", handleMouseUp as EventListener);
      canvas.removeEventListener(
        "contextmenu",
        handleRightClick as EventListener
      );
    };
  }, [
    handleCanvasClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleRightClick,
  ]);

  // Re-renderizar quando estado mudar
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas, layers]);

  // Re-renderizar quando o canvas for redimensionado
  useEffect(() => {
    const handleCanvasResize = () => {
      renderCanvas();
    };

    window.addEventListener("canvas-resized", handleCanvasResize);
    return () => {
      window.removeEventListener("canvas-resized", handleCanvasResize);
    };
  }, [renderCanvas]);

  return {
    // State
    layers,
    selectedElement,
    currentTool,
    currentLayer,
    debugMode,
    debugInfo,
    mouseState,

    // Actions
    setTool,
    setDrawMode,
    selectElement,
    updateElement,
    deleteElement,
    toggleDebugMode,

    // File operations
    saveMap,
    loadMap,
    loadLayers,

    // Canvas operations
    render: renderCanvas,

    // Canvas ref
    canvasRef: canvasRef as React.RefObject<HTMLCanvasElement>,
    // Background image controls
    uploadBackgroundImage,
    setBackgroundOpacity,
    setBackgroundTransform,
    removeBackgroundImage,
    backgroundMeta,
  };
}
