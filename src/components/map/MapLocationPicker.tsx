import { XMarkIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as MapModel } from "../../models";
import type { MapElement, MapLayers } from "../../types/fair-mapper";
import { useCanvasRenderer } from "../../utils/canvas-renderer";
import { apiFormatToLayers } from "../../utils/map-converter";

interface MapLocationPickerProps {
  readonly map: MapModel;
  readonly onSelect: (featureId: string, location: { x: number; y: number; width?: number; height?: number }) => void;
  readonly onCancel: () => void;
  readonly excludeFeatureIds?: string[]; // Features já ocupados
}

export function MapLocationPicker({
  map,
  onSelect,
  onCancel,
  excludeFeatureIds = [],
}: MapLocationPickerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const [layers, setLayers] = useState<MapLayers>({
    background: [],
    submaps: [],
    locations: [],
  });
  const [selectedElement, setSelectedElement] = useState<MapElement | null>(null);
  const [hoveredElement, setHoveredElement] = useState<MapElement | null>(null);

  const { render } = useCanvasRenderer(canvasRef);

  // Carregar o mapa
  useEffect(() => {
    if (!map) return;
    const { layers: convertedLayers } = apiFormatToLayers(map);
    setLayers(convertedLayers);
  }, [map]);

  // Renderizar canvas
  const renderCanvas = useCallback(() => {
    const highlightElement = selectedElement || hoveredElement;
    render(layers, highlightElement, false);
  }, [layers, selectedElement, hoveredElement, render]);

  useEffect(() => {
    renderCanvas();
    
    // Armazenar layers no canvas para uso na função de transformação
    if (canvasRef.current) {
      (canvasRef.current as any).__mapLayers = layers;
    }
  }, [renderCanvas, layers]);

  // Re-renderizar quando o canvas for redimensionado
  useEffect(() => {
    const handleResize = () => renderCanvas();
    globalThis.addEventListener("canvas-resized", handleResize);
    const timer = setTimeout(renderCanvas, 100);

    return () => {
      globalThis.removeEventListener("canvas-resized", handleResize);
      clearTimeout(timer);
    };
  }, [renderCanvas]);

  // Detectar clique no canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Tentar encontrar em locations primeiro, depois em submaps, depois em background
    let clickedElement = null;
    
    if (layers.locations.length > 0) {
      clickedElement = findElementAtPointWithTransform(x, y, layers.locations, canvasRef.current);
    }
    
    if (!clickedElement && layers.submaps.length > 0) {
      clickedElement = findElementAtPointWithTransform(x, y, layers.submaps, canvasRef.current);
    }
    
    if (!clickedElement && layers.background.length > 0) {
      clickedElement = findElementAtPointWithTransform(x, y, layers.background, canvasRef.current);
    }
    
    if (clickedElement?.id) {
      // Verificar se o feature já está ocupado
      if (excludeFeatureIds.includes(String(clickedElement.id))) {
        return;
      }
      setSelectedElement(clickedElement);
    }
  };

  // Detectar hover no canvas
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Procurar em todas as camadas
    let element = findElementAtPointWithTransform(x, y, layers.locations, canvasRef.current);
    if (!element) element = findElementAtPointWithTransform(x, y, layers.submaps, canvasRef.current);
    if (!element) element = findElementAtPointWithTransform(x, y, layers.background, canvasRef.current);
    
    if (element?.id) {
      // Atualizar cursor
      if (excludeFeatureIds.includes(String(element.id))) {
        canvasRef.current.style.cursor = "not-allowed";
      } else {
        canvasRef.current.style.cursor = "pointer";
      }
      setHoveredElement(element);
    } else {
      canvasRef.current.style.cursor = "default";
      setHoveredElement(null);
    }
  };

  const handleCanvasMouseLeave = () => {
    canvasRef.current.style.cursor = "default";
    setHoveredElement(null);
  };

  // Confirmar seleção
  const handleConfirm = () => {
    if (selectedElement?.id) {
      onSelect(String(selectedElement.id), {
        x: selectedElement.x,
        y: selectedElement.y,
        width: selectedElement.width,
        height: selectedElement.height,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Selecione o Local no Mapa
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Clique em um espaço disponível (retângulos em vermelho) para vincular a loja
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden bg-gray-50 p-6">
          <div className="h-full flex items-center justify-center">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={handleCanvasMouseLeave}
              className="max-w-full max-h-full border border-gray-300 rounded-lg shadow-sm bg-white"
              width={800}
              height={600}
            />
          </div>
        </div>

        {/* Info da seleção */}
        {selectedElement && (
          <div className="bg-blue-50 border-t border-blue-200 px-6 py-3">
            <p className="text-sm text-blue-800">
              <strong>Local selecionado:</strong> {selectedElement.name || "Sem nome"}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-50 border-t px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 border border-gray-300"></div>
              <span className="text-gray-600">Disponível</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 border border-gray-300"></div>
              <span className="text-gray-600">Ocupado</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedElement}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Confirmar Local
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function para encontrar elemento em uma posição considerando transformação do canvas
function findElementAtPointWithTransform(
  clickX: number,
  clickY: number,
  elements: MapElement[],
  canvas: HTMLCanvasElement
): MapElement | null {
  if (elements.length === 0) return null;

  // Precisamos considerar TODOS os elementos para calcular a transformação corretamente
  // (assim como o renderer faz), não apenas os elementos da camada atual
  const allElements: MapElement[] = [];
  
  // Adicionar todos os elementos de todas as camadas disponíveis
  // Nota: isso deve corresponder exatamente ao que o renderer usa
  const layersContext = (canvas as any).__mapLayers;
  if (layersContext) {
    allElements.push(
      ...layersContext.background,
      ...layersContext.submaps,
      ...layersContext.locations
    );
  } else {
    // Fallback: usar apenas os elementos passados
    allElements.push(...elements);
  }

  // Calcular bounding box de TODOS os elementos (não só da camada atual)
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  allElements.forEach((element) => {
    minX = Math.min(minX, element.x);
    minY = Math.min(minY, element.y);
    maxX = Math.max(maxX, element.x + element.width);
    maxY = Math.max(maxY, element.y + element.height);
  });

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  const dpr = window.devicePixelRatio || 1;
  const canvasWidth = canvas.width / dpr;
  const canvasHeight = canvas.height / dpr;

  // Calcular escala e offset (mesma lógica exata do canvas-renderer)
  const padding = 40;
  const scaleX = (canvasWidth - padding * 2) / contentWidth;
  const scaleY = (canvasHeight - padding * 2) / contentHeight;
  const scale = Math.min(scaleX, scaleY, 1);

  const scaledWidth = contentWidth * scale;
  const scaledHeight = contentHeight * scale;
  const offsetX = (canvasWidth - scaledWidth) / 2 - minX * scale;
  const offsetY = (canvasHeight - scaledHeight) / 2 - minY * scale;

  // Inverter a transformação: ctx.translate(offsetX, offsetY) + ctx.scale(scale, scale)
  // Para reverter: worldCoord = (clickCoord - offset) / scale
  const worldX = (clickX - offsetX) / scale;
  const worldY = (clickY - offsetY) / scale;

  // Procurar elemento na camada solicitada
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    const isInside = 
      worldX >= element.x &&
      worldX <= element.x + element.width &&
      worldY >= element.y &&
      worldY <= element.y + element.height;
    
    if (isInside) {
      return element;
    }
  }
  
  return null;
}
