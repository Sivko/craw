import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import {
  STREAM_KEYS,
  CONSUMER_GROUPS,
  CONSUMER_NAME,
  STREAM_CONFIG,
} from './constants';
import {
  DrawingUpdateEvent,
  ChatMessageEvent,
  RoomUpdateEvent,
  GameEvent,
  StreamMessage,
} from './types';

/**
 * Сервис для работы с Redis Streams
 * Обеспечивает публикацию и чтение событий для real-time обновлений
 */
@Injectable()
export class RedisStreamerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisStreamerService.name);
  private isRunning = false;
  private consumerInterval: NodeJS.Timeout | null = null;

  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    await this.initializeConsumerGroups();
    this.logger.log('Redis Streamer Service initialized');
  }

  async onModuleDestroy() {
    this.stopConsumers();
    this.logger.log('Redis Streamer Service destroyed');
  }

  /**
   * Инициализация Consumer Groups для всех потоков
   */
  private async initializeConsumerGroups() {
    const streams = [
      {
        key: STREAM_KEYS.DRAWING_UPDATES,
        group: CONSUMER_GROUPS.DRAWING_UPDATES,
      },
      { key: STREAM_KEYS.CHAT_MESSAGES, group: CONSUMER_GROUPS.CHAT_MESSAGES },
      { key: STREAM_KEYS.ROOM_UPDATES, group: CONSUMER_GROUPS.ROOM_UPDATES },
      { key: STREAM_KEYS.GAME_EVENTS, group: CONSUMER_GROUPS.GAME_EVENTS },
    ];

    for (const { key, group } of streams) {
      try {
        // Создаем группу, если она не существует
        // Используем '0' для чтения всех сообщений с начала потока
        await this.redisService.xgroup('CREATE', key, group, '0', {
          MKSTREAM: true,
        });
        this.logger.log(`Consumer group ${group} created for stream ${key}`);
      } catch (error: any) {
        // Группа уже существует - это нормально
        if (error.message?.includes('BUSYGROUP')) {
          this.logger.debug(
            `Consumer group ${group} already exists for stream ${key}`,
          );
        } else {
          this.logger.error(
            `Failed to create consumer group ${group}: ${error.message}`,
          );
        }
      }
    }
  }

  /**
   * Публикация события обновления рисунка
   */
  async publishDrawingUpdate(event: DrawingUpdateEvent): Promise<string> {
    const fields = {
      roomId: event.roomId,
      userId: event.userId,
      action: event.action,
      data: JSON.stringify(event.data),
    };

    const messageId = await this.redisService.xadd(
      STREAM_KEYS.DRAWING_UPDATES,
      fields,
    );

    this.logger.debug(
      `Published drawing update: ${messageId} for room ${event.roomId}`,
    );
    return messageId;
  }

  /**
   * Публикация события сообщения чата
   */
  async publishChatMessage(event: ChatMessageEvent): Promise<string> {
    const fields = {
      roomId: event.roomId,
      userId: event.userId,
      userName: event.userName,
      message: event.message,
      timestamp: event.timestamp.toString(),
    };

    const messageId = await this.redisService.xadd(
      STREAM_KEYS.CHAT_MESSAGES,
      fields,
    );

    this.logger.debug(
      `Published chat message: ${messageId} for room ${event.roomId}`,
    );
    return messageId;
  }

  /**
   * Публикация события обновления комнаты
   */
  async publishRoomUpdate(event: RoomUpdateEvent): Promise<string> {
    const fields = {
      roomId: event.roomId,
      type: event.type,
      data: JSON.stringify(event.data),
      timestamp: event.timestamp.toString(),
    };

    const messageId = await this.redisService.xadd(
      STREAM_KEYS.ROOM_UPDATES,
      fields,
    );

    this.logger.debug(
      `Published room update: ${messageId} for room ${event.roomId}`,
    );
    return messageId;
  }

  /**
   * Публикация игрового события
   */
  async publishGameEvent(event: GameEvent): Promise<string> {
    const fields = {
      roomId: event.roomId,
      type: event.type,
      data: JSON.stringify(event.data),
      timestamp: event.timestamp.toString(),
    };

    const messageId = await this.redisService.xadd(
      STREAM_KEYS.GAME_EVENTS,
      fields,
    );

    this.logger.debug(
      `Published game event: ${messageId} for room ${event.roomId}`,
    );
    return messageId;
  }

  /**
   * Запуск consumers для чтения из всех потоков
   */
  startConsumers(handler: (message: StreamMessage) => Promise<void>) {
    if (this.isRunning) {
      this.logger.warn('Consumers are already running');
      return;
    }

    this.isRunning = true;
    this.logger.log('Starting Redis Stream consumers');

    // Запускаем чтение из всех потоков в цикле
    this.consumerInterval = setInterval(async () => {
      await this.processStreams(handler);
    }, 100); // Проверяем каждые 100ms
  }

  /**
   * Остановка consumers
   */
  stopConsumers() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.consumerInterval) {
      clearInterval(this.consumerInterval);
      this.consumerInterval = null;
    }
    this.logger.log('Redis Stream consumers stopped');
  }

  /**
   * Обработка всех потоков
   */
  private async processStreams(
    handler: (message: StreamMessage) => Promise<void>,
  ) {
    const streams = [
      {
        key: STREAM_KEYS.DRAWING_UPDATES,
        group: CONSUMER_GROUPS.DRAWING_UPDATES,
      },
      {
        key: STREAM_KEYS.CHAT_MESSAGES,
        group: CONSUMER_GROUPS.CHAT_MESSAGES,
      },
      {
        key: STREAM_KEYS.ROOM_UPDATES,
        group: CONSUMER_GROUPS.ROOM_UPDATES,
      },
      {
        key: STREAM_KEYS.GAME_EVENTS,
        group: CONSUMER_GROUPS.GAME_EVENTS,
      },
    ];

    for (const { key, group } of streams) {
      try {
        await this.processStream(key, group, handler);
      } catch (error: any) {
        this.logger.error(
          `Error processing stream ${key}: ${error.message}`,
          error.stack,
        );
      }
    }
  }

  /**
   * Обработка одного потока
   */
  private async processStream(
    streamKey: string,
    group: string,
    handler: (message: StreamMessage) => Promise<void>,
  ) {
    try {
      // Читаем новые сообщения из потока
      const results = await this.redisService.xreadgroup(
        group,
        CONSUMER_NAME,
        [{ key: streamKey, id: '>' }], // '>' означает новые сообщения
        STREAM_CONFIG.COUNT,
        STREAM_CONFIG.BLOCK_TIME,
      );

      if (!results || results.length === 0) {
        return;
      }

      for (const [stream, messages] of results) {
        for (const [messageId, fields] of messages) {
          // Преобразуем массив [key, value, key, value, ...] в объект
          const fieldsObj: Record<string, string> = {};
          for (let i = 0; i < fields.length; i += 2) {
            fieldsObj[fields[i]] = fields[i + 1];
          }

          const streamMessage: StreamMessage = {
            id: messageId,
            stream,
            fields: fieldsObj,
          };

          try {
            await handler(streamMessage);
          } catch (error: any) {
            this.logger.error(
              `Error handling message ${messageId} from stream ${stream}: ${error.message}`,
              error.stack,
            );
            // В реальном приложении здесь можно добавить обработку ошибок,
            // например, отправку в dead letter queue
          }
        }
      }
    } catch (error: any) {
      // Игнорируем ошибки таймаута (это нормально при отсутствии новых сообщений)
      if (!error.message?.includes('timeout')) {
        throw error;
      }
    }
  }

  /**
   * Парсинг события из сообщения потока
   */
  parseDrawingUpdate(message: StreamMessage): DrawingUpdateEvent {
    return {
      roomId: message.fields.roomId,
      userId: message.fields.userId,
      action: message.fields.action as DrawingUpdateEvent['action'],
      data: JSON.parse(message.fields.data),
    };
  }

  parseChatMessage(message: StreamMessage): ChatMessageEvent {
    return {
      roomId: message.fields.roomId,
      userId: message.fields.userId,
      userName: message.fields.userName,
      message: message.fields.message,
      timestamp: parseInt(message.fields.timestamp, 10),
    };
  }

  parseRoomUpdate(message: StreamMessage): RoomUpdateEvent {
    return {
      roomId: message.fields.roomId,
      type: message.fields.type as RoomUpdateEvent['type'],
      data: JSON.parse(message.fields.data),
      timestamp: parseInt(message.fields.timestamp, 10),
    };
  }

  parseGameEvent(message: StreamMessage): GameEvent {
    return {
      roomId: message.fields.roomId,
      type: message.fields.type as GameEvent['type'],
      data: JSON.parse(message.fields.data),
      timestamp: parseInt(message.fields.timestamp, 10),
    };
  }
}
