import { apiClient } from '@/shared/lib/api/client';
import { ChatMessage } from './types';

export interface MessagesListResponse {
  success: boolean;
  data: ChatMessage[];
  error: null;
}

/**
 * API методы для работы с чатом
 */
export const chatApi = {
  /**
   * Получить историю сообщений
   */
  getMessages: async (
    roomId: string,
    limit = 100,
    offset = 0,
  ): Promise<MessagesListResponse> => {
    const response = await apiClient.get(
      `/chat/${roomId}/messages?limit=${limit}&offset=${offset}`,
    );
    return response.data;
  },
};
