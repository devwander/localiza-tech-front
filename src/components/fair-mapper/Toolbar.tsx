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
      label: "👆 Selecionar",
      title: "Selecionar elementos",
    },
    { id: "move" as ToolType, label: "✋ Mover", title: "Mover elementos" },
    {
      id: "resize" as ToolType,
      label: "📏 Redimensionar",
      title: "Redimensionar elementos",
    },
    {
      id: "paint" as ToolType,
      label: "🎨 Pintar",
      title: "Alterar cor dos elementos",
    },
  ];

  const layers = [
    {
      id: "background" as LayerType,
      label: "�️ Background",
      title: "Desenhar elementos de fundo",
    },
    {
      id: "submaps" as LayerType,
      label: "🏢 Submapa",
      title: "Desenhar submapas/setores",
    },
    {
      id: "locations" as LayerType,
      label: "🏪 Local",
      title: "Desenhar locais/lojas",
    },
  ];

  return (
    <div className="bg-white border-b shadow-sm flex-shrink-0">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between py-2 space-x-4">
          {/* Left: Tools */}
          <div className="flex items-center space-x-2">
            <div className="text-xs font-semibold text-gray-700 hidden lg:block">
              Ferramentas
            </div>
            <div className="flex items-center space-x-1">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => onToolChange(tool.id)}
                  title={tool.title}
                  className={`flex items-center px-2.5 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    currentTool === tool.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <span>{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Middle: Layers */}
          <div className="flex items-center space-x-2">
            <div className="text-xs font-semibold text-gray-700 hidden lg:block">
              Desenhar
            </div>
            <div className="flex items-center space-x-1">
              {layers.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => onLayerChange(layer.id)}
                  title={layer.title}
                  className={`px-2.5 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    currentLayer === layer.id
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "text-gray-700 hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  {layer.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Status */}
          <div className="flex items-center">
            <div className="text-xs text-gray-600 hidden xl:block">
              <span>
                Modo:{" "}
                <strong>
                  {currentLayer ? `Desenhar ${currentLayer}` : currentTool}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
