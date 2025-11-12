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
    <div className="p-3 bg-gray-50 border-t">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Debug Info</h3>

      <div className="space-y-2 text-xs font-mono">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-gray-600 text-xs">Mouse:</div>
            <div className="text-xs">
              {debugInfo.mousePos.x}, {debugInfo.mousePos.y}
            </div>
          </div>
          <div>
            <div className="text-gray-600 text-xs">Canvas:</div>
            <div className="text-xs">
              {Math.round(debugInfo.canvasPos.x)},{" "}
              {Math.round(debugInfo.canvasPos.y)}
            </div>
          </div>
        </div>

        <div>
          <div className="text-gray-600 text-xs">Selecionado:</div>
          <div className="text-xs">
            {selectedElement
              ? `${selectedElement.name} (${selectedElement.layer})`
              : "Nenhum"}
          </div>
        </div>

        <div>
          <div className="text-gray-600 text-xs">Hit Test:</div>
          <div className="max-h-16 overflow-y-auto text-xs">
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
