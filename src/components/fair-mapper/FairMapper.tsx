import { useFairMapper } from "../../hooks/useFairMapper";
import { Canvas } from "./Canvas";
import { Sidebar } from "./Sidebar";
import { Toolbar } from "./Toolbar";

/**
 * Componente principal do Mapeador de Feira
 */
export function FairMapper() {
  const fairMapper = useFairMapper();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Mapeador de Feira
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={fairMapper.saveMap}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                💾 Salvar
              </button>

              <label className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                📂 Carregar
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      fairMapper.loadMap(file).catch(console.error);
                    }
                    e.target.value = "";
                  }}
                  className="sr-only"
                />
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={fairMapper.debugMode}
                  onChange={fairMapper.toggleDebugMode}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Debug</span>
              </label>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar
        currentTool={fairMapper.currentTool}
        currentLayer={fairMapper.currentLayer}
        onToolChange={fairMapper.setTool}
        onLayerChange={fairMapper.setDrawMode}
      />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Canvas Area */}
        <div className="flex-1 p-4">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <Canvas canvasRef={fairMapper.canvasRef} />
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar
          layers={fairMapper.layers}
          selectedElement={fairMapper.selectedElement}
          debugMode={fairMapper.debugMode}
          debugInfo={fairMapper.debugInfo}
          onUpdateElement={fairMapper.updateElement}
          onDeleteElement={fairMapper.deleteElement}
        />
      </div>
    </div>
  );
}
