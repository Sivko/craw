/**
 * Типы для рисования
 */
export interface DrawingEvent {
  type: 'draw' | 'start' | 'end' | 'clear';
  x: number;
  y: number;
  prevX?: number;
  prevY?: number;
  color: string;
  brushSize: number;
  timestamp: number;
}

export interface DrawingState {
  events: DrawingEvent[];
  currentColor: string;
  currentBrushSize: number;
  isDrawing: boolean;
}
