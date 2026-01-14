import { useMutation } from '@tanstack/react-query';
import { roomsApi, RoomSettings } from '@/entities/room';
import { useRoomStore } from '@/entities/room';
import { useRouter } from 'next/navigation';
import { routes } from '@/shared/config/routes';

/**
 * Хук для создания комнаты
 */
export function useCreateRoom() {
  const router = useRouter();
  const setRoom = useRoomStore((state) => state.setRoom);

  return useMutation({
    mutationFn: (settings: RoomSettings) => roomsApi.create(settings),
    onSuccess: (response) => {
      const room = response.data;
      setRoom(room);
      router.push(routes.room(room.code));
    },
  });
}
