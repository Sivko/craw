import { apiClient } from '@/shared/lib/api/client';
import { User } from './types';

export interface TelegramAuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  error: null;
}

export interface GuestAuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  error: null;
}

/**
 * API методы для работы с пользователем
 */
export const userApi = {
  /**
   * Авторизация через Telegram MiniApp
   */
  telegramAuth: async (data: {
    id: string;
    first_name: string;
    username?: string;
    photo_url?: string;
    auth_date: string;
    hash: string;
  }): Promise<TelegramAuthResponse> => {
    const response = await apiClient.post('/auth/telegram', data);
    return response.data;
  },

  /**
   * Гостевой вход
   */
  guestAuth: async (name: string): Promise<GuestAuthResponse> => {
    const response = await apiClient.post('/auth/guest', { name });
    return response.data;
  },
};
