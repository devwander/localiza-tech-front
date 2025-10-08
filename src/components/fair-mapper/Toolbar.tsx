import type { LayerType, ToolType } from "../../types/fair-mapper";
import { Menu } from "@headlessui/react";
import { 
  CursorArrowRaysIcon,
  ArrowsPointingOutIcon,
  PaintBrushIcon,
  ArrowPathIcon,
  PhotoIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  WrenchScrewdriverIcon,
  PlusIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

interface ToolbarProps {
  currentTool: ToolType;
  currentLayer: LayerType | null;
  onToolChange: (tool: ToolType) => void;
  onLayerChange: (layer: LayerType) => void;
  // optional background controls
  onUploadBackground?: (file: File) => void;
  onSetBackgroundOpacity?: (opacity: number) => void;
  onRemoveBackground?: () => void;
  backgroundOpacity?: number | null;
}

export function Toolbar({
  currentTool,
  currentLayer,
  onToolChange,
  onLayerChange,
  onUploadBackground,
  onSetBackgroundOpacity,
  onRemoveBackground,
  backgroundOpacity,
}: ToolbarProps) {
  const tools = [
    { 
      id: "select" as ToolType, 
      label: "Selecionar", 
      title: "Selecionar elementos",
      icon: CursorArrowRaysIcon
    },
    { 
      id: "move" as ToolType, 
      label: "Mover", 
      title: "Mover elementos",
      icon: ArrowPathIcon
    },
    { 
      id: "resize" as ToolType, 
      label: "Redimensionar", 
      title: "Redimensionar elementos",
      icon: ArrowsPointingOutIcon
    },
    { 
      id: "paint" as ToolType, 
      label: "Pintar", 
      title: "Alterar cor dos elementos",
      icon: PaintBrushIcon
    },
  ];

  const layers = [
    { 
      id: "background" as LayerType, 
      label: "Background", 
      title: "Desenhar elementos de fundo",
      icon: PhotoIcon
    },
    { 
      id: "submaps" as LayerType, 
      label: "Submapa", 
      title: "Desenhar submapas/setores",
      icon: BuildingOfficeIcon
    },
    { 
      id: "locations" as LayerType, 
      label: "Local", 
      title: "Desenhar locais/lojas",
      icon: BuildingStorefrontIcon
    },
  ];

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4 py-2">
          {/* Tools Dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button 
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border ${
                currentTool ? "bg-blue-50 text-blue-700 border-blue-200" : "text-gray-700 border-gray-200"
              }`}
            >
              <WrenchScrewdriverIcon className="h-5 w-5" />
              <span>Ferramentas</span>
              <ChevronDownIcon className="h-4 w-4 ml-1" />
            </Menu.Button>
            
            <Menu.Items className="absolute left-0 mt-2 w-48 rounded-md bg-white shadow-lg border border-gray-200 focus:outline-none z-10">
              <div className="py-1">
                {tools.map((tool) => (
                  <Menu.Item key={tool.id}>
                    {({ active }) => (
                      <button
                        onClick={() => onToolChange(tool.id)}
                        title={tool.title}
                        className={`${
                          active || currentTool === tool.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        } flex items-center space-x-2 w-full px-4 py-2 text-sm`}
                      >
                        <tool.icon className="h-5 w-5" />
                        <span>{tool.label}</span>
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Menu>

          {/* Add Elements Dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button 
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border ${
                currentLayer ? "bg-green-50 text-green-700 border-green-200" : "text-gray-700 border-gray-200"
              }`}
            >
              <PlusIcon className="h-5 w-5" />
              <span>Adicionar</span>
              <ChevronDownIcon className="h-4 w-4 ml-1" />
            </Menu.Button>
            
            <Menu.Items className="absolute left-0 mt-2 w-48 rounded-md bg-white shadow-lg border border-gray-200 focus:outline-none z-10">
              <div className="py-1">
                {layers.map((layer) => (
                  <Menu.Item key={layer.id}>
                    {({ active }) => (
                      <button
                        onClick={() => onLayerChange(layer.id)}
                        title={layer.title}
                        className={`${
                          active || currentLayer === layer.id ? 'bg-green-50 text-green-700' : 'text-gray-700'
                        } flex items-center space-x-2 w-full px-4 py-2 text-sm`}
                      >
                        <layer.icon className="h-5 w-5" />
                        <span>{layer.label}</span>
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Menu>

          {/* Background controls */}
          {(currentLayer === "background" || backgroundOpacity !== null) && (
            <div className="flex items-center space-x-2">
              <label className="inline-flex items-center px-3 py-2 border border-gray-200 rounded-md text-sm cursor-pointer bg-white hover:bg-gray-50">
                <PhotoIcon className="h-5 w-5 mr-2 text-gray-500" />
                Rascunho
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && onUploadBackground) onUploadBackground(file);
                    e.currentTarget.value = "";
                  }}
                  className="sr-only"
                />
              </label>

              {backgroundOpacity !== null && onSetBackgroundOpacity && (
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={backgroundOpacity}
                    onChange={(e) => onSetBackgroundOpacity(Number(e.target.value))}
                    className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600
                      [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-blue-700
                      [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:border-0
                      [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600
                      hover:[&::-moz-range-thumb]:bg-blue-700"
                    title="Ajustar opacidade do rascunho"
                  />
                  <span className="text-sm text-gray-600 w-12 text-center">
                    {backgroundOpacity !== null ? Math.round(backgroundOpacity * 100) : 0}%
                  </span>
                </div>
              )}

              {onRemoveBackground && backgroundOpacity !== null && (
                <button
                  onClick={onRemoveBackground}
                  className="px-2 py-1 text-sm text-red-600 hover:text-red-700"
                >
                  Remover
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}