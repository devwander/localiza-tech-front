import type { DebugInfo, MapElement } from "../../types/fair-mapper";

interface DebugPanelProps {
  debugInfo: DebugInfo;
  selectedElement: MapElement | null;
  visible: boolean;
}

export function DebugPanel({
  debugInfo,
  selectedElement,
  visible,
}: DebugPanelProps) {
  if (!visible) return null;

  return (
    <div className="p-4 bg-gray-50 border-t">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Debug Info</h3>

      <div className="space-y-2 text-xs font-mono">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-gray-600">Mouse:</div>
            <div>
              {debugInfo.mousePos.x}, {debugInfo.mousePos.y}
            </div>
          </div>
          <div>
            <div className="text-gray-600">Canvas:</div>
            <div>
              {Math.round(debugInfo.canvasPos.x)},{" "}
              {Math.round(debugInfo.canvasPos.y)}
            </div>
          </div>
        </div>

        <div>
          <div className="text-gray-600">Selecionado:</div>
          <div>
            {selectedElement
              ? `${selectedElement.name} (${selectedElement.layer})`
              : "Nenhum"}
          </div>
        </div>

        <div>
          <div className="text-gray-600">Hit Test:</div>
          <div className="max-h-20 overflow-y-auto">
            {debugInfo.lastHitTest.map((info, index) => (
              <div
                key={index}
                className={
                  info.includes("✓") ? "text-green-600" : "text-red-600"
                }
              >
                {info}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
