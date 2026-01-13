/**
 * Константы для Redis Streams
 */

export const STREAM_KEYS = {
  DRAWING_UPDATES: 'drawing:updates',
  CHAT_MESSAGES: 'chat:messages',
  ROOM_UPDATES: 'room:updates',
  GAME_EVENTS: 'game:events',
} as const;

export const CONSUMER_GROUPS = {
  DRAWING_UPDATES: 'drawing-updates-group',
  CHAT_MESSAGES: 'chat-messages-group',
  ROOM_UPDATES: 'room-updates-group',
  GAME_EVENTS: 'game-events-group',
} as const;

export const CONSUMER_NAME = 'craw-consumer';

/**
 * Конфигурация для чтения из потоков
 */
export const STREAM_CONFIG = {
  BLOCK_TIME: 1000, // Блокировка на 1 секунду при ожидании новых сообщений
  COUNT: 10, // Максимальное количество сообщений за один запрос
  MAX_LEN: 1000, // Максимальная длина потока (приблизительно)
} as const;
