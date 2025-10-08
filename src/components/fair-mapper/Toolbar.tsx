import type { LayerType, ToolType } from "../../types/fair-mapper";

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
    { id: "select" as ToolType, label: "👆 Selecionar", title: "Selecionar elementos" },
    { id: "move" as ToolType, label: "✋ Mover", title: "Mover elementos" },
    { id: "resize" as ToolType, label: "📏 Redimensionar", title: "Redimensionar elementos" },
    { id: "paint" as ToolType, label: "🎨 Pintar", title: "Alterar cor dos elementos" },
  ];

  const layers = [
    { id: "background" as LayerType, label: "�️ Background", title: "Desenhar elementos de fundo" },
    { id: "submaps" as LayerType, label: "🏢 Submapa", title: "Desenhar submapas/setores" },
    { id: "locations" as LayerType, label: "🏪 Local", title: "Desenhar locais/lojas" },
  ];

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          {/* Left: Tools */}
          <div className="flex items-center space-x-3">
            <div className="text-sm font-semibold text-gray-700">Ferramentas</div>
            <div className="flex items-center space-x-2">
              {tools.map((tool) => (
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
                  <span>{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Middle: Layers */}
          <div className="ml-2 flex items-center space-x-4">
            <div className="text-sm font-semibold text-gray-700">Desenhar</div>
            <div className="flex items-center space-x-2">
              {layers.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => onLayerChange(layer.id)}
                  title={layer.title}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
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

          {/* Right: Background controls + status */}
          <div className="ml-16 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="inline-flex items-center px-2 py-1 border border-gray-200 rounded-md text-sm cursor-pointer bg-white hover:bg-gray-50">
                🖼️ Rascunho
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

              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={backgroundOpacity ?? 0.5}
                onChange={(e) => onSetBackgroundOpacity?.(Number(e.target.value))}
                className="w-32"
              />

              <button
                onClick={() => onRemoveBackground?.()}
                className="px-2 py-1 text-sm border rounded-md bg-red-50 text-red-700"
              >
                Remover
              </button>
            </div>

            <div className="text-sm text-gray-600">
              <span>
                Modo: <strong>{currentLayer ? `Desenhar ${currentLayer}` : currentTool}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
