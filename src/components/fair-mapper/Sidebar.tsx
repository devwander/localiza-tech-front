import type { DebugInfo, MapElement, MapLayers } from "../../types/fair-mapper";
import { DebugPanel } from "./DebugPanel";
import { LayersPanel } from "./LayersPanel";
import { PropertiesPanel } from "./PropertiesPanel";

interface SidebarProps {
  layers: MapLayers;
  selectedElement: MapElement | null;
  debugMode: boolean;
  debugInfo: DebugInfo;
  onUpdateElement: (id: number, updates: Partial<MapElement>) => void;
  onDeleteElement: (id: number) => void;
}

export function Sidebar({
  layers,
  selectedElement,
  debugMode,
  debugInfo,
  onUpdateElement,
  onDeleteElement,
}: SidebarProps) {
  return (
    <div className="w-80 bg-white border-l shadow-sm flex flex-col">
      {/* Painel de Camadas */}
      <div className="border-b">
        <LayersPanel layers={layers} selectedElement={selectedElement} />
      </div>

      {/* Painel de Propriedades */}
      <div className="flex-1 border-b">
        <PropertiesPanel
          selectedElement={selectedElement}
          onUpdateElement={onUpdateElement}
          onDeleteElement={onDeleteElement}
        />
      </div>

      {/* Painel de Debug */}
      {debugMode && (
        <div className="h-48">
          <DebugPanel
            debugInfo={debugInfo}
            selectedElement={selectedElement}
            visible={debugMode}
          />
        </div>
      )}
    </div>
  );
}
