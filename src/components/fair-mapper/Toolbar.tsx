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
      label: "🗺️ Background",
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
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Ferramentas */}
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium text-gray-700 mr-3">
              Ferramentas:
            </span>
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                title={tool.title}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentTool === tool.id
                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                    : "text-gray-700 hover:bg-gray-100 border border-transparent"
                }`}
              >
                {tool.label}
              </button>
            ))}
          </div>

          {/* Divisor */}
          <div className="h-6 w-px bg-gray-300" />

          {/* Camadas de Desenho */}
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium text-gray-700 mr-3">
              Desenhar:
            </span>
            {layers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onLayerChange(layer.id)}
                title={layer.title}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentLayer === layer.id
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "text-gray-700 hover:bg-gray-100 border border-transparent"
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center text-sm text-gray-600">
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
  );
}
