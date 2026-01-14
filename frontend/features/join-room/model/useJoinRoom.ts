import { useMutation } from '@tanstack/react-query';
import { roomsApi } from '@/entities/room';
import { useRoomStore } from '@/entities/room';
import { useRouter } from 'next/navigation';
import { routes } from '@/shared/config/routes';

/**
 * Хук для присоединения к комнате
 */
export function useJoinRoom() {
  const router = useRouter();
  const setRoom = useRoomStore((state) => state.setRoom);

  return useMutation({
    mutationFn: (code: string) => roomsApi.join(code),
    onSuccess: (response) => {
      const room = response.data;
      setRoom(room);
      router.push(routes.room(room.code));
    },
  });
}
