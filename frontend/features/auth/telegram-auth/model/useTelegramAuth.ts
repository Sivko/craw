import { useMutation } from '@tanstack/react-query';
import { userApi } from '@/entities/user';
import { useUserStore } from '@/entities/user';
import { useRouter } from 'next/navigation';

/**
 * Хук для авторизации через Telegram MiniApp
 */
export function useTelegramAuth() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: userApi.telegramAuth,
    onSuccess: (response) => {
      const { user, token } = response.data;
      setUser(user, token);
      localStorage.setItem('token', token);
      router.push('/');
    },
  });
}
