'use client';

import { useState } from 'react';
import { useGuestAuth } from '../model/useGuestAuth';

/**
 * Форма гостевого входа
 */
export function GuestAuthForm() {
  const [name, setName] = useState('');
  const { mutate: auth, isPending } = useGuestAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      auth(name.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Введите ваше имя"
        required
        minLength={2}
        maxLength={50}
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={isPending || !name.trim()}
        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
      >
        {isPending ? 'Вход...' : 'Войти как гость'}
      </button>
    </form>
  );
}
