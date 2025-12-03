import {
  Grid3x3,
  Map as MapIcon,
  Maximize2,
  Search,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Canvas } from "../../../components/fair-mapper/Canvas";
import { Loading } from "../../../components/loading";
import { StoreInfoModal } from "../../../components/store";
import type { Store } from "../../../models";
import { usePublicMap, useStoresByMapPublicQuery } from "../../../queries";
import type { MapElement, MapLayers } from "../../../types/fair-mapper";
import { useCanvasRenderer } from "../../../utils/canvas-renderer";
import {
  getCategoryColor,
  getCategoryIcon,
  getCategoryLabel,
} from "../../../utils/category-icon-components";
import { apiFormatToLayers } from "../../../utils/map-converter";
import { enrichLayersWithStoreData } from "../../../utils/store-enrichment";

// Helper para calcular a transformação inversa do canvas
function calculateInverseTransform(
  canvasWidth: number,
  canvasHeight: number,
  elements: MapElement[],
  zoomLevel: number
): { offsetX: number; offsetY: number; scale: number } {
  if (elements.length === 0) {
    return { offsetX: 0, offsetY: 0, scale: 1 };
  }

  // Calcular bounding box
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const element of elements) {
    minX = Math.min(minX, element.x);
    minY = Math.min(minY, element.y);
    maxX = Math.max(maxX, element.x + element.width);
    maxY = Math.max(maxY, element.y + element.height);
  }

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;

  // Calculate scale to fit content in canvas (with padding)
  const padding = 40;
  const scaleX = (canvasWidth - padding * 2) / contentWidth;
  const scaleY = (canvasHeight - padding * 2) / contentHeight;
  const baseScale = Math.min(scaleX, scaleY, 1);
  const scale = baseScale * zoomLevel;

  // Calculate translation to center the scaled content
  const scaledWidth = contentWidth * scale;
  const scaledHeight = contentHeight * scale;
  const offsetX = (canvasWidth - scaledWidth) / 2 - minX * scale;
  const offsetY = (canvasHeight - scaledHeight) / 2 - minY * scale;

  return { offsetX, offsetY, scale };
}

// Helper para encontrar elemento no ponto clicado (considerando transformações)
function findElementAtPoint(
  canvasX: number,
  canvasY: number,
  elements: MapElement[],
  canvasWidth: number,
  canvasHeight: number,
  allElements: MapElement[],
  zoomLevel: number
): MapElement | null {
  // Calcular transformação inversa
  const { offsetX, offsetY, scale } = calculateInverseTransform(
    canvasWidth,
    canvasHeight,
    allElements,
    zoomLevel
  );

  // Converter coordenadas do canvas para coordenadas do mundo
  const worldX = (canvasX - offsetX) / scale;
  const worldY = (canvasY - offsetY) / scale;

  // Procurar elemento que contém o ponto
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    if (
      worldX >= element.x &&
      worldX <= element.x + element.width &&
      worldY >= element.y &&
      worldY <= element.y + element.height
    ) {
      return element;
    }
  }
  return null;
}

export function PublicMapView() {
  const { id } = useParams<{ id: string }>();
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const containerRef = useRef<HTMLDivElement>(null!);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [layers, setLayers] = useState<MapLayers>({
    background: [],
    submaps: [],
    locations: [],
  });

  const { data: mapData, isLoading, isError } = usePublicMap(id);
  const { data: storesData = [] } = useStoresByMapPublicQuery(id || "");

  const { render } = useCanvasRenderer(canvasRef);

  // Categorias disponíveis
  const categories = [
    "all",
    "food",
    "clothing",
    "electronics",
    "jewelry",
    "books",
    "sports",
    "home",
    "beauty",
    "toys",
    "services",
    "other",
  ];

  // Filtrar stores por categoria e busca
  const filteredStores = storesData.filter((store) => {
    const matchesCategory =
      selectedCategory === "all" || store.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      store.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // IDs das stores filtradas para destacar no canvas
  const filteredStoreIds = new Set(filteredStores.map((s) => s._id));
  const hasActiveFilters = selectedCategory !== "all" || searchQuery !== "";

  // Contar stores por categoria
  const categoryCounts = storesData.reduce((acc, store) => {
    acc[store.category] = (acc[store.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Render canvas callback com filtros e zoom
  const renderCanvas = useCallback((): void => {
    render(
      layers,
      null,
      false,
      undefined,
      filteredStoreIds,
      hasActiveFilters,
      zoomLevel
    );
  }, [layers, render, filteredStoreIds, hasActiveFilters, zoomLevel]);

  // Load map data and convert to layers
  useEffect(() => {
    if (!mapData) return;

    const { layers: convertedLayers } = apiFormatToLayers(mapData);

    // Enriquecer layers com dados das stores vinculadas
    let enrichedLayers = convertedLayers;
    if (storesData && storesData.length > 0) {
      enrichedLayers = enrichLayersWithStoreData(convertedLayers, storesData);
    }

    setLayers(enrichedLayers);
  }, [mapData, storesData]);

  // Re-render when layers change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Listen for canvas resize events
  useEffect(() => {
    const handleCanvasResize = () => {
      renderCanvas();
    };

    globalThis.addEventListener("canvas-resized", handleCanvasResize);

    const timer = setTimeout(() => {
      renderCanvas();
    }, 100);

    return () => {
      globalThis.removeEventListener("canvas-resized", handleCanvasResize);
      clearTimeout(timer);
    };
  }, [renderCanvas]);

  // Funções de zoom
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    } else {
      containerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error("Erro ao entrar em fullscreen:", err);
        });
    }
  };

  // Listener para mudanças de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Handler para clique no canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Todos os elementos para calcular a transformação
    const allElements = [
      ...layers.background,
      ...layers.submaps,
      ...layers.locations,
    ];

    const clickedElement = findElementAtPoint(
      x,
      y,
      layers.locations,
      rect.width,
      rect.height,
      allElements,
      zoomLevel
    );

    if (clickedElement?.storeId && storesData) {
      const store = storesData.find((s) => s._id === clickedElement.storeId);
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
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Erro ao carregar mapa
          </h2>
          <p className="text-gray-600">
            Não foi possível carregar o mapa público.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <MapIcon className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                Mapeador de Feira
              </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar loja ou setor"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Category Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 py-4 overflow-x-auto">
            {categories.map((category) => {
              const Icon =
                category === "all" ? Grid3x3 : getCategoryIcon(category);
              const label =
                category === "all" ? "Todos" : getCategoryLabel(category);
              const count =
                category === "all"
                  ? storesData.length
                  : categoryCounts[category] || 0;
              const isActive = selectedCategory === category;

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                  {count > 0 && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        isActive ? "bg-blue-500" : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content - Canvas Map */}
      <main ref={containerRef} className="flex-1 relative overflow-hidden">
        <div
          className="h-full cursor-pointer"
          onClick={handleCanvasClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleCanvasClick(e as any);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <Canvas canvasRef={canvasRef} />
        </div>

        {/* Zoom Controls - Bottom Right */}
        <div className="absolute bottom-20 right-4 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 bg-white rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all flex items-center justify-center border border-gray-200"
            title="Aumentar zoom"
          >
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 bg-white rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all flex items-center justify-center border border-gray-200"
            title="Diminuir zoom"
          >
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleResetZoom}
            className="w-10 h-10 bg-white rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all flex items-center justify-center border border-gray-200 text-xs font-semibold text-gray-700"
            title="Resetar zoom"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            onClick={handleFullscreen}
            className="w-10 h-10 bg-white rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all flex items-center justify-center border border-gray-200"
            title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
          >
            <Maximize2 className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Legend - Bottom Left */}
        <div className="absolute bottom-20 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200 max-w-xs">
          <h4 className="font-semibold text-sm text-gray-900 mb-2">
            Categorias
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {categories
              .filter((cat) => cat !== "all")
              .map((category) => {
                const count = categoryCounts[category] || 0;
                if (count === 0) return null;
                const Icon = getCategoryIcon(category);
                const label = getCategoryLabel(category);
                const color = getCategoryColor(category);
                return (
                  <div key={category} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ backgroundColor: color + "20", color: color }}
                    >
                      <Icon size={14} />
                    </div>
                    <span className="text-gray-700">
                      {label} ({count})
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Status Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t px-4 py-2">
          <p className="text-sm text-gray-600">
            Modo: Visualização | Lojas: {filteredStores.length}/
            {storesData.length} | Zoom: {Math.round(zoomLevel * 100)}%
          </p>
        </div>
      </main>

      {/* Store Info Modal */}
      {selectedStore && (
        <StoreInfoModal
          store={selectedStore}
          onClose={() => setSelectedStore(null)}
        />
      )}
    </div>
  );
}
