/**
 * Типы для игры
 */
export interface Match {
  id: string;
  roomId: string;
  drawerId: string;
  drawer: {
    id: string;
    name: string;
  };
  word: string;
  difficulty: string;
  startedAt: string;
  endedAt?: string;
}

export interface GameState {
  currentMatch: Match | null;
  timeRemaining: number;
  scores: Record<string, number>;
}
