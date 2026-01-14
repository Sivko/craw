'use client';

import { useState } from 'react';
import { useCreateRoom } from '../model/useCreateRoom';
import { RoomSettings } from '@/entities/room';

/**
 * Форма создания комнаты
 */
export function CreateRoomForm() {
  const [difficulty, setDifficulty] = useState<RoomSettings['difficulty']>('easy');
  const [timer, setTimer] = useState(60);
  const { mutate: createRoom, isPending } = useCreateRoom();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRoom({ difficulty, timer });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block mb-2">Сложность</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as RoomSettings['difficulty'])}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="easy">Легкая</option>
          <option value="medium">Средняя</option>
          <option value="hard">Сложная</option>
        </select>
      </div>

      <div>
        <label className="block mb-2">Таймер (секунды)</label>
        <input
          type="number"
          value={timer}
          onChange={(e) => setTimer(Number(e.target.value))}
          min={30}
          max={180}
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {isPending ? 'Создание...' : 'Создать комнату'}
      </button>
    </form>
  );
}
