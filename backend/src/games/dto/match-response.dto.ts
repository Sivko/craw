/**
 * Ответ с информацией о матче
 */
export interface MatchResponse {
  id: string;
  roomId: string;
  drawerId: string;
  drawerName: string;
  word: string;
  difficulty: string;
  startedAt: Date;
  endedAt: Date | null;
  timer: number;
  timeRemaining: number;
}

/**
 * DTO ответа с матчем
 */
export interface MatchResponseDto {
  success: boolean;
  data: MatchResponse | null;
  error: string | null;
}
