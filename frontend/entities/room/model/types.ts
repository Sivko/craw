/**
 * Типы для комнаты
 */
export interface RoomSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  timer: number; // в секундах
}

export interface RoomUser {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    username?: string;
  };
  score: number;
  joinedAt: string;
}

export interface Room {
  id: string;
  code: string;
  hostId: string;
  host: {
    id: string;
    name: string;
  };
  settings: RoomSettings;
  status: 'waiting' | 'playing' | 'finished';
  users: RoomUser[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomState {
  currentRoom: Room | null;
}
