/**
 * Ответ с информацией о рисунке
 */
export interface DrawingResponse {
  id: string;
  matchId: string;
  userId: string;
  userName: string;
  imageUrl: string;
  createdAt: Date;
}

/**
 * DTO ответа для одного рисунка
 */
export interface DrawingResponseDto {
  success: boolean;
  data: DrawingResponse | null;
  error: string | null;
}

/**
 * DTO ответа для списка рисунков
 */
export interface DrawingsListResponseDto {
  success: boolean;
  data: DrawingResponse[];
  error: string | null;
}
