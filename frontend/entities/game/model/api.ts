import { apiClient } from '@/shared/lib/api/client';
import { Match } from './types';

export interface MatchResponse {
  success: boolean;
  data: Match;
  error: null;
}

/**
 * API методы для работы с играми
 */
export const gamesApi = {
  /**
   * Начать игру
   */
  startGame: async (roomId: string): Promise<MatchResponse> => {
    const response = await apiClient.post(`/games/${roomId}/start`);
    return response.data;
  },

  /**
   * Получить текущий матч
   */
  getCurrentMatch: async (roomId: string): Promise<MatchResponse> => {
    const response = await apiClient.get(`/games/${roomId}/current`);
    return response.data;
  },

  /**
   * Угадать слово
   */
  guessWord: async (
    roomId: string,
    guess: string,
  ): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/games/${roomId}/guess`, { guess });
    return response.data;
  },
};
