import type { MapElement, MapLayers } from "../../types/fair-mapper";
import { LayerUtils } from "../../utils/layer-utils";

interface LayersPanelProps {
  layers: MapLayers;
  selectedElement: MapElement | null;
}

export function LayersPanel({ layers }: LayersPanelProps) {
  const counts = LayerUtils.getLayerCounts(layers);

  const layerConfig = [
    { key: "locations", name: "Locais", color: "#EF4444", zIndex: 3 },
    { key: "submaps", name: "Submapas", color: "#3B82F6", zIndex: 2 },
    { key: "background", name: "Background", color: "#6B7280", zIndex: 1 },
  ];

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Camadas</h3>

      <div className="space-y-2">
        {layerConfig.map((layer) => (
          <div
            key={layer.key}
            className="flex items-center justify-between p-2 rounded-md bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: layer.color }}
              />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {layer.name}
                </div>
                <div className="text-xs text-gray-500">
                  Z-index: {layer.zIndex}
                </div>
              </div>
            </div>

            <div className="text-sm font-medium text-gray-600">
              {counts[layer.key as keyof typeof counts]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
