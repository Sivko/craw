import { create } from 'zustand';
import { DrawingEvent, DrawingState } from './types';

interface DrawingStore extends DrawingState {
  addEvent: (event: DrawingEvent) => void;
  clearEvents: () => void;
  setColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  setIsDrawing: (isDrawing: boolean) => void;
}

/**
 * Zustand store для управления состоянием холста
 */
export const useDrawingStore = create<DrawingStore>((set) => ({
  events: [],
  currentColor: '#000000',
  currentBrushSize: 5,
  isDrawing: false,
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
    })),
  clearEvents: () =>
    set({
      events: [],
    }),
  setColor: (color) =>
    set({
      currentColor: color,
    }),
  setBrushSize: (size) =>
    set({
      currentBrushSize: size,
    }),
  setIsDrawing: (isDrawing) =>
    set({
      isDrawing,
    }),
}));
