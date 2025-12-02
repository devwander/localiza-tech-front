import React from "react";

interface CanvasProps {
  readonly canvasRef: React.RefObject<HTMLCanvasElement>;
}

export function Canvas({ canvasRef }: CanvasProps) {
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize handler that sets canvas internal buffer according to container size and DPR
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;

      // try to measure the canvas container; fall back to 800x800
      const parent = canvas.parentElement;
      const rect = parent?.getBoundingClientRect();
      const cssWidth = rect ? Math.max(100, Math.round(rect.width)) : 800;
      const cssHeight = rect ? Math.max(100, Math.round(rect.height)) : 800;

      // set the internal buffer size for crisp rendering on high-DPR displays
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      // apply transform so drawing commands can use CSS pixels
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Note: clearing is removed here - let the renderer handle it
      // ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    // Use ResizeObserver when available to detect container changes
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        resizeCanvas();
        // Dispatch custom event to notify that canvas was resized
        window.dispatchEvent(new CustomEvent("canvas-resized"));
      });
      ro.observe(canvas.parentElement ?? canvas);
    } else {
      // fallback: window resize
      window.addEventListener("resize", () => {
        resizeCanvas();
        window.dispatchEvent(new CustomEvent("canvas-resized"));
      });
    }

    // initial size
    resizeCanvas();
    // Force a re-render after initial resize
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("canvas-resized"));
    }, 100);

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", resizeCanvas);
    };
  }, [canvasRef]);

  return (
    <div
      style={{
        flexGrow: 1,
        overflow: "hidden",
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={800}
        aria-label="Área de desenho do mapa"
        tabIndex={0}
        // Removida a borda do Canvas
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          background: "transparent",
          borderRadius: "8px",
        }}
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
