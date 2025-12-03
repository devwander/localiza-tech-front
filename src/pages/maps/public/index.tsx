import { EyeIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Canvas } from "../../../components/fair-mapper/Canvas";
import { Loading } from "../../../components/loading";
import { StoreInfoModal } from "../../../components/store";
import type { Store } from "../../../models";
import { usePublicMap, useStoresByMapPublicQuery } from "../../../queries";
import type { MapElement, MapLayers } from "../../../types/fair-mapper";
import { useCanvasRenderer } from "../../../utils/canvas-renderer";
import { apiFormatToLayers } from "../../../utils/map-converter";
import { enrichLayersWithStoreData } from "../../../utils/store-enrichment";

export function MapPublicView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const layersRef = useRef<MapLayers>({
    background: [],
    submaps: [],
    locations: [],
  });
  const [layers, setLayers] = useState<MapLayers>({
    background: [],
    submaps: [],
    locations: [],
  });
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const { data: mapData, isLoading, isError, error } = usePublicMap(id);
  const { data: storesData } = useStoresByMapPublicQuery(id || "");

  // Use the same canvas renderer hook as the editor
  const { render } = useCanvasRenderer(canvasRef);

  // Render canvas callback
  const renderCanvas = useCallback((): void => {
    render(layers, null, false);
  }, [layers, render]);

  // Load map data and convert to layers
  useEffect(() => {
    if (!mapData) return;

    const { layers: convertedLayers } = apiFormatToLayers(mapData);

    // Enriquecer layers com dados das stores vinculadas
    let enrichedLayers = convertedLayers;
    if (storesData && storesData.length > 0) {
      enrichedLayers = enrichLayersWithStoreData(
        convertedLayers,
        storesData
      );
    }

    layersRef.current = enrichedLayers;
    setLayers(enrichedLayers);
  }, [mapData, storesData]);

  // Re-render when layers change (similar to useFairMapper)
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Listen for canvas resize events
  useEffect(() => {
    const handleCanvasResize = () => {
      renderCanvas();
    };

    globalThis.addEventListener("canvas-resized", handleCanvasResize);

    // Initial render with a delay to ensure canvas is ready
    const timer = setTimeout(() => {
      renderCanvas();
    }, 100);

    return () => {
      globalThis.removeEventListener("canvas-resized", handleCanvasResize);
      clearTimeout(timer);
    };
  }, [renderCanvas]);

  // Handler para clique no canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const dpr = globalThis.devicePixelRatio || 1;
    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;

    // Procurar elemento clicado nos locais
    const clickedElement = findElementAtPoint(x, y, layers.locations);

    if (clickedElement?.storeId && storesData) {
      const store = storesData.find(
        (s) => s._id === clickedElement.storeId
      );
      if (store) {
        setSelectedStore(store);
      }
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex justify-center mb-4">
            <XMarkIcon className="w-16 h-16 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-4 text-center">
            Erro ao carregar mapa
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            {error instanceof Error
              ? error.message
              : "Não foi possível carregar o mapa público. Verifique se o link está correto."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Ir para Página Inicial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <EyeIcon className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {mapData?.name || "Visualização do Mapa"}
                </h1>
                {mapData?.metadata?.description && (
                  <p className="text-sm text-gray-500">
                    {mapData.metadata.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
                <EyeIcon className="w-4 h-4 mr-1.5" />
                Modo Visualização
              </div>

              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Info Banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 sm:px-6 py-3 flex-shrink-0">
        <div className="flex items-center text-sm text-blue-800">
          <EyeIcon className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>
            Você está visualizando este mapa em modo somente leitura. Para
            editar, faça login no sistema.
          </p>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="w-full h-full max-w-7xl">
          <div className="bg-white rounded-lg shadow-sm border h-full flex items-center justify-center relative">
            {/* Debug info overlay */}
            {mapData && (
              <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-md text-xs z-10">
                <div>Features: {mapData.features?.length || 0}</div>
                <div>Background: {layers.background.length}</div>
                <div>Submapas: {layers.submaps.length}</div>
                <div>Locais: {layers.locations.length}</div>
              </div>
            )}
            <div 
              onClick={handleCanvasClick}
              onKeyDown={(e) => e.key === 'Enter' && handleCanvasClick(e as unknown as React.MouseEvent<HTMLDivElement>)}
              role="button"
              tabIndex={0}
              className="cursor-pointer"
            >
              <Canvas canvasRef={canvasRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t px-4 sm:px-6 py-3 flex-shrink-0">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            {mapData?.metadata?.author && (
              <span>Criado por: {mapData.metadata.author}</span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {layers && (
              <>
                <span className="hidden sm:inline">
                  Background: {layers.background.length}
                </span>
                <span className="hidden sm:inline">
                  Submapas: {layers.submaps.length}
                </span>
                <span>Locais: {layers.locations.length}</span>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* Modal de Informações da Store */}
      {selectedStore && (
        <StoreInfoModal
          store={selectedStore}
          onClose={() => setSelectedStore(null)}
        />
      )}
    </div>
  );
}

// Helper function para encontrar elemento em uma posição
function findElementAtPoint(
  x: number,
  y: number,
  elements: MapElement[]
): MapElement | null {
  // Procurar do último para o primeiro (ordem Z reversa)
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    if (
      x >= element.x &&
      x <= element.x + element.width &&
      y >= element.y &&
      y <= element.y + element.height
    ) {
      return element;
    }
  }
  return null;
}
