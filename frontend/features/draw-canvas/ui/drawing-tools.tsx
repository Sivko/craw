'use client';

import { useDrawingStore } from '@/entities/drawing';

/**
 * Панель инструментов для рисования
 */
export function DrawingTools({
  onClear,
}: {
  onClear: () => void;
}) {
  const { currentColor, currentBrushSize, setColor, setBrushSize } =
    useDrawingStore();

  const colors = [
    '#000000',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#FF00FF',
    '#00FFFF',
  ];

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow">
      <div>
        <label className="block mb-2">Цвет</label>
        <div className="flex gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setColor(color)}
              className={`w-8 h-8 rounded border-2 ${
                currentColor === color ? 'border-blue-500' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
      <div>
        <label className="block mb-2">Размер кисти: {currentBrushSize}px</label>
        <input
          type="range"
          min={1}
          max={20}
          value={currentBrushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <button
        onClick={onClear}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Очистить
      </button>
    </div>
  );
}
