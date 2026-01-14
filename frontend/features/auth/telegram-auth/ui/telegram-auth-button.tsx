'use client';

import { useTelegramAuth } from '../model/useTelegramAuth';

/**
 * Кнопка авторизации через Telegram MiniApp
 */
export function TelegramAuthButton() {
  const { mutate: auth, isPending } = useTelegramAuth();

  const handleTelegramAuth = () => {
    // Проверяем, что мы в Telegram MiniApp
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      const user = tg.initDataUnsafe?.user;

      if (user) {
        auth({
          id: user.id.toString(),
          first_name: user.first_name,
          username: user.username,
          photo_url: user.photo_url,
          auth_date: tg.initDataUnsafe.auth_date?.toString() || '',
          hash: tg.initDataUnsafe.hash || '',
        });
      } else {
        alert('Telegram MiniApp не доступен');
      }
    } else {
      alert('Откройте приложение через Telegram');
    }
  };

  return (
    <button
      onClick={handleTelegramAuth}
      disabled={isPending}
      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
    >
      {isPending ? 'Вход...' : 'Войти через Telegram'}
    </button>
  );
}
