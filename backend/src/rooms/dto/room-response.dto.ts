import { Difficulty } from './create-room.dto';

/**
 * Настройки комнаты
 */
export interface RoomSettings {
  difficulty: Difficulty;
  timer: number;
}

/**
 * Статус комнаты
 */
export enum RoomStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished',
}

/**
 * Пользователь в комнате
 */
export interface RoomUserResponse {
  id: string;
  userId: string;
  userName: string;
  score: number;
  joinedAt: Date;
}

/**
 * Ответ с информацией о комнате
 */
export interface RoomResponse {
  id: string;
  code: string;
  hostId: string;
  hostName: string;
  settings: RoomSettings;
  status: RoomStatus;
  users: RoomUserResponse[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO для ответа API
 */
export class RoomResponseDto {
  success: boolean;
  data: RoomResponse | null;
  error: string | null;
}
