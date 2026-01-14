'use client';

import { useState } from 'react';
import { useJoinRoom } from '../model/useJoinRoom';

/**
 * Форма присоединения к комнате
 */
export function JoinRoomForm() {
  const [code, setCode] = useState('');
  const { mutate: joinRoom, isPending } = useJoinRoom();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      joinRoom(code.trim().toUpperCase());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Код комнаты"
        required
        minLength={4}
        maxLength={8}
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
      />
      <button
        type="submit"
        disabled={isPending || !code.trim()}
        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
      >
        {isPending ? 'Присоединение...' : 'Присоединиться'}
      </button>
    </form>
  );
}
