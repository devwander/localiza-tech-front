import { useCallback, useEffect, useRef, useState } from "react";
import type { Map } from "../../models";
import type { MapLayers } from "../../types/fair-mapper";
import { useCanvasRenderer } from "../../utils/canvas-renderer";
import { apiFormatToLayers } from "../../utils/map-converter";

interface MapPreviewProps {
  map: Map;
  width?: number;
  height?: number;
}

export function MapPreview({
  map,
  width = 200,
  height = 150,
}: MapPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const [layers, setLayers] = useState<MapLayers>({
    background: [],
    submaps: [],
    locations: [],
  });

  const { render } = useCanvasRenderer(canvasRef);

  // Convert map data to layers
  useEffect(() => {
    if (!map || !map.features) return;

    const { layers: convertedLayers } = apiFormatToLayers(map);
    setLayers(convertedLayers);
  }, [map]);

  // Render canvas
  const renderCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    render(layers, null, false);
  }, [layers, render]);

  // Re-render when layers change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Listen for canvas resize events
  useEffect(() => {
    const handleCanvasResize = () => {
      renderCanvas();
    };

    window.addEventListener("canvas-resized", handleCanvasResize);

    // Initial render with a delay to ensure canvas is ready
    const timer = setTimeout(() => {
      renderCanvas();
    }, 100);

    return () => {
      window.removeEventListener("canvas-resized", handleCanvasResize);
      clearTimeout(timer);
    };
  }, [renderCanvas]);

  // Set canvas dimensions
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    renderCanvas();
  }, [width, height, renderCanvas]);

  const hasElements =
    layers.background.length > 0 ||
    layers.submaps.length > 0 ||
    layers.locations.length > 0;

  return (
    <div
      className="relative bg-gray-50 rounded-lg overflow-hidden border border-gray-200"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {hasElements ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: "block" }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-gray-400">
            <svg
              className="mx-auto h-12 w-12 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <p className="text-xs">Mapa vazio</p>
          </div>
        </div>
      )}

      {/* Badge with element count */}
      {hasElements && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
          {map.features?.length || 0} elementos
        </div>
      )}
    </div>
  );
}
