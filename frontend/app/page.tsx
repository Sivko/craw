'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/entities/user';
import { CreateRoomForm, JoinRoomForm } from '@/features';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useUserStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Крокодил</h1>
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Создать комнату</h2>
            <CreateRoomForm />
          </div>
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Присоединиться к комнате</h2>
            <JoinRoomForm />
          </div>
        </div>
      </div>
    </div>
  );
}
