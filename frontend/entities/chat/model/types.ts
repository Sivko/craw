/**
 * Типы для чата
 */
export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  matchId?: string;
  message: string;
  isCorrect: boolean;
  createdAt: string;
}

export interface ChatState {
  messages: ChatMessage[];
}
