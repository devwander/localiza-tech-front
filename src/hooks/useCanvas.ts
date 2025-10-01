/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useRef } from "react";
import type { Point, UseCanvasReturn } from "../types/fair-mapper";

/**
 * Hook personalizado para gerenciar o canvas e seus eventos
 */
export function useCanvas(): UseCanvasReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * Converte coordenadas do mouse para coordenadas do canvas
   */
  const getCanvasCoordinates = useCallback((e: MouseEvent): Point => {
    if (!canvasRef.current) {
      return { x: 0, y: 0 };
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    return { x, y };
  }, []);

  /**
   * Handler para clique no canvas
   */
  const onCanvasClick = useCallback((_e: MouseEvent): void => {
    // Implementação será feita no hook principal
  }, []);

  /**
   * Handler para mouse down
   */
  const onMouseDown = useCallback((_e: MouseEvent): void => {
    // Implementação será feita no hook principal
  }, []);

  /**
   * Handler para mouse move
   */
  const onMouseMove = useCallback((_e: MouseEvent): void => {
    // Implementação será feita no hook principal
  }, []);

  /**
   * Handler para mouse up
   */
  const onMouseUp = useCallback((_e: MouseEvent): void => {
    // Implementação será feita no hook principal
  }, []);

  /**
   * Handler para clique direito
   */
  const onRightClick = useCallback((e: MouseEvent): void => {
    e.preventDefault();
    // Implementação será feita no hook principal
  }, []);

  return {
    canvasRef: canvasRef as React.RefObject<HTMLCanvasElement>,
    getCanvasCoordinates,
    onCanvasClick,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onRightClick,
  };
}
