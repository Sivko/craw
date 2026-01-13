/**
 * Сообщение чата
 */
export interface ChatMessageResponse {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  matchId: string | null;
  message: string;
  isCorrect: boolean;
  createdAt: Date;
}

/**
 * DTO для ответа API с сообщением
 */
export class MessageResponseDto {
  success: boolean;
  data: ChatMessageResponse;
  error: string | null;
}

/**
 * DTO для ответа API со списком сообщений
 */
export class MessagesListResponseDto {
  success: boolean;
  data: ChatMessageResponse[];
  error: string | null;
}
