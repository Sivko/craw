'use client';

import { TelegramAuthButton } from '@/features/auth/telegram-auth';
import { GuestAuthForm } from '@/features/auth/guest-auth';

/**
 * Страница авторизации
 */
export function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Вход в игру</h1>
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Telegram</h2>
            <TelegramAuthButton />
          </div>
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Гостевой вход</h2>
            <GuestAuthForm />
          </div>
        </div>
      </div>
    </div>
  );
}
