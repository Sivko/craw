'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRoomStore } from '@/entities/room';
import { roomsApi } from '@/entities/room';
import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { useUserStore } from '@/entities/user';

/**
 * Страница комнаты (лобби)
 */
export function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const { token } = useUserStore();
  const { setRoom } = useRoomStore();

  // Загружаем информацию о комнате
  const { data: roomData, isLoading } = useQuery({
    queryKey: ['room', code],
    queryFn: () => roomsApi.getByCode(code),
    enabled: !!code,
  });

  // Подключаемся к WebSocket
  const socket = useWebSocket(token);

  useEffect(() => {
    if (roomData?.data) {
      setRoom(roomData.data);
    }
  }, [roomData, setRoom]);

  useEffect(() => {
    if (socket && roomData?.data) {
      const roomId = roomData.data.id;
      // Присоединяемся к комнате через WebSocket
      socket.emit('room:join', { roomId });

      // Подписываемся на обновления комнаты
      socket.on('room:updated', (data) => {
        console.log('Room updated:', data);
        // Обновляем комнату в store
      });

      socket.on('room:user-joined', (data) => {
        console.log('User joined:', data);
      });

      socket.on('room:user-left', (data) => {
        console.log('User left:', data);
      });

      return () => {
        if (roomData?.data) {
          socket.emit('room:leave', { roomId: roomData.data.id });
        }
        socket.off('room:updated');
        socket.off('room:user-joined');
        socket.off('room:user-left');
      };
    }
  }, [socket, roomData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Загрузка...</div>
      </div>
    );
  }

  if (!roomData?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Комната не найдена</div>
      </div>
    );
  }

  const room = roomData.data;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Комната: {room.code}</h1>
          <div className="mb-4">
            <p>Статус: {room.status}</p>
            <p>Хост: {room.host.name}</p>
            <p>Игроков: {room.users.length}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Игроки:</h2>
            <ul className="space-y-2">
              {room.users.map((roomUser) => (
                <li key={roomUser.id} className="flex items-center gap-2">
                  <span>{roomUser.user.name}</span>
                  <span className="text-gray-500">({roomUser.score} очков)</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
