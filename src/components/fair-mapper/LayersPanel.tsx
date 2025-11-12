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
    <div className="p-3">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Camadas</h3>

      <div className="space-y-1.5">
        {layerConfig.map((layer) => (
          <div
            key={layer.key}
            className="flex items-center justify-between p-2 rounded-md bg-gray-50"
          >
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: layer.color }}
              />
              <div>
                <div className="text-xs font-medium text-gray-900">
                  {layer.name}
                </div>
                <div className="text-xs text-gray-500">Z: {layer.zIndex}</div>
              </div>
            </div>

            <div className="text-xs font-semibold text-gray-600">
              {counts[layer.key as keyof typeof counts]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
