import { useState, useRef, useCallback, useEffect } from 'react';
import type {
  MapLayers,
  MapElement,
  LayerType,
  ToolType,
  MouseState,
  DebugInfo,
  Point,
  UseFairMapperReturn,
  MapData
} from '../types/fair-mapper';
import { 
  LayerUtils, 
  SelectionUtils, 
  ElementUtils, 
  ColorUtils 
} from '../utils/layer-utils';
import { useCanvasRenderer } from '../utils/canvas-renderer';

/**
 * Hook principal do Fair Mapper
 */
export function useFairMapper(): UseFairMapperReturn {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextIdRef = useRef(1);
  
  // Estado principal
  const [layers, setLayers] = useState<MapLayers>(LayerUtils.createEmptyLayers());
  const [selectedElement, setSelectedElement] = useState<MapElement | null>(null);
  const [currentTool, setCurrentTool] = useState<ToolType>('select');
  const [currentLayer, setCurrentLayer] = useState<LayerType | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  
  // Estado do mouse e interações
  const [mouseState, setMouseState] = useState<MouseState>({
    isDrawing: false,
    isDragging: false,
    isResizing: false,
    drawStart: null,
    dragOffset: { x: 0, y: 0 },
    resizeHandle: null
  });

  // Estado de debug
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    mousePos: { x: 0, y: 0 },
    canvasPos: { x: 0, y: 0 },
    lastHitTest: []
  });

  // Renderer do canvas
  const { render, drawPreviewElement, drawResizeHandles, updateCursor } = useCanvasRenderer(
    canvasRef as React.RefObject<HTMLCanvasElement>
  );

  /**
   * Converte coordenadas do mouse para coordenadas do canvas
   */
  const getCanvasCoordinates = useCallback((e: MouseEvent): Point => {
    if (!canvasRef.current) {
      return { x: 0, y: 0 };
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Atualizar debug info
    if (debugMode) {
      setDebugInfo(prev => ({
        ...prev,
        mousePos: { x: e.clientX, y: e.clientY },
        canvasPos: { x, y }
      }));
    }
    
    return { x, y };
  }, [debugMode]);

  /**
   * Seleciona um elemento na posição especificada
   */
  const selectElementAtPosition = useCallback((point: Point): MapElement | null => {
    const element = SelectionUtils.selectElementAtPosition(layers, point);
    
    if (debugMode) {
      const hitTestInfo = element 
        ? `✓ HIT: ${element.name} (${element.layer})`
        : '✗ No element found';
      
      setDebugInfo(prev => ({
        ...prev,
        lastHitTest: [hitTestInfo]
      }));
    }
    
    return element;
  }, [layers, debugMode]);

  /**
   * Atualiza um elemento
   */
  const updateElement = useCallback((id: number, updates: Partial<MapElement>): void => {
    setLayers(prev => LayerUtils.updateElement(prev, id, updates));
    
    // Atualizar selectedElement se for o mesmo
    if (selectedElement && selectedElement.id === id) {
      setSelectedElement(prev => {
        if (!prev) return null;
        return { ...prev, ...updates } as MapElement;
      });
    }
  }, [selectedElement]);

  /**
   * Salva dados no localStorage
   */
  const saveToStorage = useCallback((): void => {
    const data: MapData = {
      layers,
      nextId: nextIdRef.current,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem('fairMapperData', JSON.stringify(data));
  }, [layers]);

  /**
   * Cria um novo elemento
   */
  const createNewElement = useCallback((
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

    if (width < 10 || height < 10) return; // Elemento muito pequeno

    const id = nextIdRef.current++;
    let element: MapElement;

    switch (layer) {
      case 'background':
        element = ElementUtils.createBackgroundElement(id, x, y, width, height);
        break;
      case 'submaps':
        element = ElementUtils.createSubmapElement(id, x, y, width, height);
        break;
      case 'locations':
        element = ElementUtils.createLocationElement(id, x, y, width, height);
        break;
    }

    setLayers(prev => LayerUtils.addElement(prev, element));
    setSelectedElement(element);
  }, []);

  /**
   * Renderiza o canvas
   */
  const renderCanvas = useCallback((): void => {
    render(layers, selectedElement, debugMode, debugInfo);
    
    // Desenhar handles de resize se necessário
    if (selectedElement && currentTool === 'resize') {
      drawResizeHandles(selectedElement);
    }
  }, [layers, selectedElement, debugMode, debugInfo, currentTool, render, drawResizeHandles]);

  /**
   * Handler para clique no canvas
   */
  const handleCanvasClick = useCallback((e: MouseEvent): void => {
    const { x, y } = getCanvasCoordinates(e);

    if (currentTool === 'select') {
      const element = selectElementAtPosition({ x, y });
      setSelectedElement(element);
    } else if (currentTool === 'paint' && selectedElement) {
      // Mudar cor do elemento
      const nextColor = ColorUtils.getNextLocationColor(selectedElement.color);
      updateElement(selectedElement.id, { color: nextColor });
    }
  }, [currentTool, selectedElement, getCanvasCoordinates, selectElementAtPosition, updateElement]);

  /**
   * Handler para mouse down
   */
  const handleMouseDown = useCallback((e: MouseEvent): void => {
    const { x, y } = getCanvasCoordinates(e);

    if (currentLayer && currentTool === 'draw') {
      // Iniciando desenho de novo elemento
      setMouseState(prev => ({
        ...prev,
        isDrawing: true,
        drawStart: { x, y }
      }));
    } else if (currentTool === 'move' || currentTool === 'resize') {
      const element = selectElementAtPosition({ x, y });
      if (element) {
        setSelectedElement(element);
        
        if (currentTool === 'move') {
          setMouseState(prev => ({
            ...prev,
            isDragging: true,
            dragOffset: {
              x: x - element.x,
              y: y - element.y
            }
          }));
        } else if (currentTool === 'resize') {
          const handle = SelectionUtils.getResizeHandle({ x, y }, element);
          if (handle) {
            setMouseState(prev => ({
              ...prev,
              isResizing: true,
              resizeHandle: handle
            }));
          }
        }
      }
    }
  }, [currentLayer, currentTool, getCanvasCoordinates, selectElementAtPosition]);

  /**
   * Handler para mouse move
   */
  const handleMouseMove = useCallback((e: MouseEvent): void => {
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
    } else if (mouseState.isResizing && selectedElement && mouseState.resizeHandle) {
      // Redimensionar elemento
      const updates = ElementUtils.resizeElement(selectedElement, mouseState.resizeHandle, { x, y });
      updateElement(selectedElement.id, updates);
    }

    // Atualizar cursor
    updateCursor(currentTool, mouseState.isDragging);
  }, [
    mouseState, 
    selectedElement, 
    currentLayer, 
    currentTool, 
    getCanvasCoordinates, 
    drawPreviewElement, 
    updateCursor,
    renderCanvas,
    updateElement
  ]);

  /**
   * Handler para mouse up
   */
  const handleMouseUp = useCallback((e: MouseEvent): void => {
    const { x, y } = getCanvasCoordinates(e);

    if (mouseState.isDrawing && mouseState.drawStart && currentLayer) {
      // Finalizar desenho de elemento
      createNewElement(mouseState.drawStart.x, mouseState.drawStart.y, x, y, currentLayer);
      setCurrentLayer(null);
    }

    // Reset do estado do mouse
    setMouseState(prev => ({
      ...prev,
      isDrawing: false,
      isDragging: false,
      isResizing: false,
      drawStart: null,
      resizeHandle: null
    }));

    // Salvar no localStorage
    saveToStorage();
  }, [mouseState, currentLayer, getCanvasCoordinates, createNewElement, saveToStorage]);

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
      resizeHandle: null
    });
    setCurrentLayer(null);
  }, []);

  /**
   * Remove um elemento
   */
  const deleteElement = useCallback((id: number): void => {
    setLayers(prev => LayerUtils.removeElement(prev, id));
    
    // Deselecionar se for o elemento atual
    if (selectedElement && selectedElement.id === id) {
      setSelectedElement(null);
    }
  }, [selectedElement]);

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
      resizeHandle: null
    });
  }, []);

  /**
   * Define o modo de desenho
   */
  const setDrawMode = useCallback((layer: LayerType): void => {
    setCurrentTool('draw');
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
    setDebugMode(prev => !prev);
  }, []);

  /**
   * Salva mapa como arquivo
   */
  const saveMap = useCallback((): void => {
    const data: MapData = {
      layers,
      nextId: nextIdRef.current,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mapa-feira-${new Date().toISOString().split('T')[0]}.json`;
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
          saveToStorage();
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }, [saveToStorage]);

  // Adicionar event listeners ao canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('click', handleCanvasClick as EventListener);
    canvas.addEventListener('mousedown', handleMouseDown as EventListener);
    canvas.addEventListener('mousemove', handleMouseMove as EventListener);
    canvas.addEventListener('mouseup', handleMouseUp as EventListener);
    canvas.addEventListener('contextmenu', handleRightClick as EventListener);

    return () => {
      canvas.removeEventListener('click', handleCanvasClick as EventListener);
      canvas.removeEventListener('mousedown', handleMouseDown as EventListener);
      canvas.removeEventListener('mousemove', handleMouseMove as EventListener);
      canvas.removeEventListener('mouseup', handleMouseUp as EventListener);
      canvas.removeEventListener('contextmenu', handleRightClick as EventListener);
    };
  }, [handleCanvasClick, handleMouseDown, handleMouseMove, handleMouseUp, handleRightClick]);

  // Carregar dados salvos na inicialização
  useEffect(() => {
    const savedData = localStorage.getItem('fairMapperData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData) as MapData;
        setLayers(data.layers || LayerUtils.createEmptyLayers());
        nextIdRef.current = data.nextId || 1;
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
      }
    }
  }, []);

  // Re-renderizar quando estado mudar
  useEffect(() => {
    renderCanvas();
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
    
    // Canvas operations
    render: renderCanvas,
    
    // Canvas ref
    canvasRef: canvasRef as React.RefObject<HTMLCanvasElement>
  };
}