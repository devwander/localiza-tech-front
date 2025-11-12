import {
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  BuildingStorefrontIcon,
  CursorArrowRaysIcon,
  PaintBrushIcon,
  RectangleGroupIcon,
} from "@heroicons/react/24/outline";
import type { LayerType, ToolType } from "../../types/fair-mapper";

interface ToolbarProps {
  currentTool: ToolType;
  currentLayer: LayerType | null;
  onToolChange: (tool: ToolType) => void;
  onLayerChange: (layer: LayerType) => void;
}

export function Toolbar({
  currentTool,
  currentLayer,
  onToolChange,
  onLayerChange,
}: ToolbarProps) {
  const tools = [
    {
      id: "select" as ToolType,
      label: "Selecionar",
      title: "Selecionar elementos",
      icon: CursorArrowRaysIcon,
    },
    {
      id: "move" as ToolType,
      label: "Mover",
      title: "Mover elementos",
      icon: ArrowPathIcon,
    },
    {
      id: "resize" as ToolType,
      label: "Redimensionar",
      title: "Redimensionar elementos",
      icon: ArrowsPointingOutIcon,
    },
    {
      id: "paint" as ToolType,
      label: "Pintar",
      title: "Alterar cor dos elementos",
      icon: PaintBrushIcon,
    },
  ];

  const layers = [
    {
      id: "background" as LayerType,
      label: "Background",
      title: "Desenhar elementos de fundo",
      icon: RectangleGroupIcon,
    },
    {
      id: "submaps" as LayerType,
      label: "Submapa",
      title: "Desenhar submapas/setores",
      icon: RectangleGroupIcon,
    },
    {
      id: "locations" as LayerType,
      label: "Local",
      title: "Desenhar locais/lojas",
      icon: BuildingStorefrontIcon,
    },
  ];

  return (
    <div className="bg-white border-b shadow-sm flex-shrink-0">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between py-3">
          {/* Left: Tools */}
          <div className="flex items-center space-x-4">
            <div className="text-sm font-semibold text-gray-700">
              Ferramentas
            </div>
            <div className="flex items-center space-x-2">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => onToolChange(tool.id)}
                    title={tool.title}
                    className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                      currentTool === tool.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Layers */}
          <div className="flex items-center space-x-4">
            <div className="text-sm font-semibold text-gray-700">Desenhar</div>
            <div className="flex items-center space-x-2">
              {layers.map((layer) => {
                const Icon = layer.icon;
                return (
                  <button
                    key={layer.id}
                    onClick={() => onLayerChange(layer.id)}
                    title={layer.title}
                    className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                      currentLayer === layer.id
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "text-gray-700 hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{layer.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
