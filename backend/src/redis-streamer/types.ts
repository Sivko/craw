/**
 * Типы для событий Redis Streams
 */

export interface DrawingUpdateEvent {
  roomId: string;
  userId: string;
  action: 'draw' | 'clear' | 'undo' | 'redo';
  data: {
    x?: number;
    y?: number;
    prevX?: number;
    prevY?: number;
    color?: string;
    brushSize?: number;
    timestamp: number;
  };
}

export interface ChatMessageEvent {
  roomId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}

export interface RoomUpdateEvent {
  roomId: string;
  type:
    | 'room:created'
    | 'room:deleted'
    | 'room:user-joined'
    | 'room:user-left'
    | 'room:settings-changed'
    | 'player_joined'
    | 'player_left'
    | 'settings_changed'
    | 'game_started'
    | 'game_ended';
  data: Record<string, any>;
  timestamp: number;
}

export interface GameEvent {
  roomId: string;
  type:
    | 'match_started'
    | 'match_ended'
    | 'word_selected'
    | 'artist_changed'
    | 'correct_guess'
    | 'timeout'
    | 'round_started'
    | 'round_ended';
  data: Record<string, any>;
  timestamp: number;
}

export type StreamEvent =
  | DrawingUpdateEvent
  | ChatMessageEvent
  | RoomUpdateEvent
  | GameEvent;

export interface StreamMessage {
  id: string;
  stream: string;
  fields: Record<string, string>;
}
