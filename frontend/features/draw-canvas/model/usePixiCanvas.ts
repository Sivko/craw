import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { useDrawingStore } from '@/entities/drawing';
import { Socket } from 'socket.io-client';

/**
 * Хук для инициализации и работы с PixiJS canvas
 */
export function usePixiCanvas(
  containerRef: React.RefObject<HTMLDivElement>,
  socket: Socket | null,
  roomId: string | null,
) {
  const appRef = useRef<PIXI.Application | null>(null);
  const graphicsRef = useRef<PIXI.Graphics | null>(null);
  const isDrawingRef = useRef(false);
  const { currentColor, currentBrushSize, addEvent, setIsDrawing } =
    useDrawingStore();

  useEffect(() => {
    if (!containerRef.current) return;

    // Инициализация PixiJS приложения
    const app = new PIXI.Application();
    appRef.current = app;

    app
      .init({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        backgroundColor: 0xffffff,
        antialias: true,
      })
      .then(() => {
        if (!containerRef.current) return;
        containerRef.current.appendChild(app.canvas);

        // Создаем графический объект для рисования
        const graphics = new PIXI.Graphics();
        graphicsRef.current = graphics;
        app.stage.addChild(graphics);

        // Обработка событий мыши
        app.canvas.addEventListener('mousedown', handleStart);
        app.canvas.addEventListener('mousemove', handleMove);
        app.canvas.addEventListener('mouseup', handleEnd);
        app.canvas.addEventListener('mouseleave', handleEnd);

        // Обработка touch событий для мобильных устройств
        app.canvas.addEventListener('touchstart', handleTouchStart);
        app.canvas.addEventListener('touchmove', handleTouchMove);
        app.canvas.addEventListener('touchend', handleTouchEnd);
      });

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [containerRef]);

  const getCoordinates = (
    e: MouseEvent | TouchEvent,
  ): { x: number; y: number } => {
    if (!appRef.current) return { x: 0, y: 0 };

    const rect = appRef.current.canvas.getBoundingClientRect();
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: (e as MouseEvent).clientX - rect.left,
      y: (e as MouseEvent).clientY - rect.top,
    };
  };

  const handleStart = (e: MouseEvent) => {
    isDrawingRef.current = true;
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    drawPoint(x, y, true);
  };

  const handleMove = (e: MouseEvent) => {
    if (!isDrawingRef.current) return;
    const { x, y } = getCoordinates(e);
    drawPoint(x, y, false);
  };

  const handleEnd = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      setIsDrawing(false);
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    isDrawingRef.current = true;
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    drawPoint(x, y, true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const { x, y } = getCoordinates(e);
    drawPoint(x, y, false);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    handleEnd();
  };

  const drawPoint = (x: number, y: number, isStart: boolean) => {
    if (!graphicsRef.current) return;

    const graphics = graphicsRef.current;
    const color = parseInt(currentColor.replace('#', ''), 16);

    if (isStart) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }

    graphics.stroke({ width: currentBrushSize, color });

    // Сохраняем событие
    const event = {
      type: isStart ? 'start' : 'draw',
      x,
      y,
      color: currentColor,
      brushSize: currentBrushSize,
      timestamp: Date.now(),
    };
    addEvent(event);

    // Отправляем событие через WebSocket
    if (socket && roomId) {
      socket.emit('game:draw', {
        roomId,
        action: isStart ? 'draw' : 'draw',
        x,
        y,
        prevX: isStart ? undefined : x,
        prevY: isStart ? undefined : y,
        color: currentColor,
        brushSize: currentBrushSize,
        timestamp: Date.now(),
      });
    }
  };

  const clearCanvas = () => {
    if (graphicsRef.current) {
      graphicsRef.current.clear();
      const event = {
        type: 'clear' as const,
        x: 0,
        y: 0,
        color: currentColor,
        brushSize: currentBrushSize,
        timestamp: Date.now(),
      };
      addEvent(event);

      // Отправляем событие очистки через WebSocket
      if (socket && roomId) {
        socket.emit('game:draw', {
          roomId,
          action: 'clear',
          timestamp: Date.now(),
        });
      }
    }
  };

  return {
    clearCanvas,
    app: appRef.current,
  };
}
