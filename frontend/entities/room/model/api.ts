import { apiClient } from '@/shared/lib/api/client';
import { Room, RoomSettings } from './types';

export interface RoomResponse {
  success: boolean;
  data: Room;
  error: null;
}

export interface RoomsListResponse {
  success: boolean;
  data: Room[];
  error: null;
}

/**
 * API методы для работы с комнатами
 */
export const roomsApi = {
  /**
   * Создание комнаты
   */
  create: async (settings: RoomSettings): Promise<RoomResponse> => {
    const response = await apiClient.post('/rooms', { settings });
    return response.data;
  },

  /**
   * Получение комнаты по коду
   */
  getByCode: async (code: string): Promise<RoomResponse> => {
    const response = await apiClient.get(`/rooms/${code}`);
    return response.data;
  },

  /**
   * Присоединение к комнате
   */
  join: async (code: string): Promise<RoomResponse> => {
    const response = await apiClient.post(`/rooms/${code}/join`);
    return response.data;
  },

  /**
   * Выход из комнаты
   */
  leave: async (code: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/rooms/${code}/leave`);
    return response.data;
  },

  /**
   * Удаление комнаты
   */
  delete: async (code: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/rooms/${code}`);
    return response.data;
  },
};
