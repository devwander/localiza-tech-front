interface CanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export function Canvas({ canvasRef }: CanvasProps) {
  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-200 rounded-lg cursor-pointer"
        style={{ display: "block" }}
      />

      {/* Overlay para informações de seleção */}
      <div
        id="selectionInfo"
        className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-md text-sm opacity-0 transition-opacity pointer-events-none"
      >
        {/* Conteúdo será preenchido dinamicamente */}
      </div>
    </div>
  );
}
