import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RedisStreamerService } from '../redis-streamer/redis-streamer.service';
import { StreamMessage } from '../redis-streamer/types';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { RoomJoinDto } from './dto/room-join.dto';
import { DrawingEventDto } from './dto/drawing-event.dto';
import { ChatMessageDto } from './dto/chat-message.dto';
import { GuessWordDto } from './dto/guess-word.dto';
import { STREAM_KEYS } from '../redis-streamer/constants';

/**
 * WebSocket Gateway для real-time обновлений
 * Интегрирован с Redis Streamer для синхронизации между инстансами
 */
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/',
})
@UseGuards(WsJwtGuard)
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppGateway.name);
  private readonly roomClients = new Map<string, Set<string>>(); // roomId -> Set<socketId>

  constructor(private readonly redisStreamer: RedisStreamerService) {}

  /**
   * Инициализация Gateway
   * Запускаем consumers для чтения из Redis Streams
   */
  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
    this.startRedisConsumers();
  }

  /**
   * Обработка подключения клиента
   */
  handleConnection(client: Socket) {
    const user = client.data.user;
    this.logger.log(`Client connected: ${client.id}, User: ${user?.id}`);
  }

  /**
   * Обработка отключения клиента
   */
  handleDisconnect(client: Socket) {
    const user = client.data.user;
    this.logger.log(`Client disconnected: ${client.id}, User: ${user?.id}`);

    // Удаляем клиента из всех комнат
    this.roomClients.forEach((clients, roomId) => {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        // Уведомляем остальных участников комнаты
        client.to(roomId).emit('room:user-left', {
          userId: user?.id,
          userName: user?.name,
        });
      }
    });
  }

  /**
   * Запуск Redis Consumers для чтения из потоков
   */
  private startRedisConsumers() {
    this.redisStreamer.startConsumers(async (message: StreamMessage) => {
      await this.handleStreamMessage(message);
    });
    this.logger.log('Redis Stream consumers started');
  }

  /**
   * Обработка сообщений из Redis Streams
   */
  private async handleStreamMessage(message: StreamMessage) {
    try {
      const streamKey = message.stream;

      switch (streamKey) {
        case STREAM_KEYS.DRAWING_UPDATES:
          await this.handleDrawingUpdate(message);
          break;
        case STREAM_KEYS.CHAT_MESSAGES:
          await this.handleChatMessageFromStream(message);
          break;
        case STREAM_KEYS.ROOM_UPDATES:
          await this.handleRoomUpdate(message);
          break;
        case STREAM_KEYS.GAME_EVENTS:
          await this.handleGameEvent(message);
          break;
        default:
          this.logger.warn(`Unknown stream: ${streamKey}`);
      }
    } catch (error) {
      this.logger.error(
        `Error handling stream message: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Обработка обновления рисунка из Redis Stream
   */
  private async handleDrawingUpdate(message: StreamMessage) {
    const event = this.redisStreamer.parseDrawingUpdate(message);
    const roomId = event.roomId;

    // Рассылаем событие всем клиентам в комнате
    this.server.to(roomId).emit('game:drawing-update', {
      userId: event.userId,
      action: event.action,
      data: event.data,
    });
  }

  /**
   * Обработка сообщения чата из Redis Stream
   */
  private async handleChatMessageFromStream(message: StreamMessage) {
    const event = this.redisStreamer.parseChatMessage(message);
    const roomId = event.roomId;

    // Рассылаем сообщение всем клиентам в комнате
    this.server.to(roomId).emit('chat:new-message', {
      userId: event.userId,
      userName: event.userName,
      message: event.message,
      timestamp: event.timestamp,
    });
  }

  /**
   * Обработка обновления комнаты из Redis Stream
   */
  private async handleRoomUpdate(message: StreamMessage) {
    const event = this.redisStreamer.parseRoomUpdate(message);
    const roomId = event.roomId;

    // Рассылаем событие всем клиентам в комнате
    this.server.to(roomId).emit('room:updated', {
      type: event.type,
      data: event.data,
      timestamp: event.timestamp,
    });
  }

  /**
   * Обработка игрового события из Redis Stream
   */
  private async handleGameEvent(message: StreamMessage) {
    const event = this.redisStreamer.parseGameEvent(message);
    const roomId = event.roomId;

    // Рассылаем событие всем клиентам в комнате
    this.server.to(roomId).emit(`game:${event.type}`, {
      type: event.type,
      data: event.data,
      timestamp: event.timestamp,
    });
  }

  /**
   * Присоединение к комнате
   */
  @SubscribeMessage('room:join')
  async handleRoomJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: RoomJoinDto,
  ) {
    const user = client.data.user;
    const { roomId } = dto;

    // Присоединяемся к Socket.io комнате
    await client.join(roomId);

    // Сохраняем информацию о клиенте в комнате
    if (!this.roomClients.has(roomId)) {
      this.roomClients.set(roomId, new Set());
    }
    this.roomClients.get(roomId)!.add(client.id);

    this.logger.log(`User ${user.id} joined room ${roomId}`);

    // Уведомляем остальных участников комнаты
    client.to(roomId).emit('room:user-joined', {
      userId: user.id,
      userName: user.name,
    });

    // Подтверждаем присоединение
    return {
      success: true,
      roomId,
    };
  }

  /**
   * Выход из комнаты
   */
  @SubscribeMessage('room:leave')
  async handleRoomLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: RoomJoinDto,
  ) {
    const user = client.data.user;
    const { roomId } = dto;

    // Выходим из Socket.io комнаты
    await client.leave(roomId);

    // Удаляем клиента из комнаты
    const clients = this.roomClients.get(roomId);
    if (clients) {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.roomClients.delete(roomId);
      }
    }

    this.logger.log(`User ${user.id} left room ${roomId}`);

    // Уведомляем остальных участников комнаты
    client.to(roomId).emit('room:user-left', {
      userId: user.id,
      userName: user.name,
    });

    return {
      success: true,
      roomId,
    };
  }

  /**
   * Обработка события рисования от клиента
   */
  @SubscribeMessage('game:draw')
  async handleDrawingEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: DrawingEventDto,
  ) {
    const user = client.data.user;
    const { roomId, action, ...data } = dto;

    // Публикуем событие в Redis Stream
    await this.redisStreamer.publishDrawingUpdate({
      roomId,
      userId: user.id,
      action,
      data: {
        ...data,
        timestamp: Date.now(),
      },
    });

    this.logger.debug(`Drawing event published: ${action} in room ${roomId}`);

    return {
      success: true,
    };
  }

  /**
   * Обработка сообщения чата от клиента
   */
  @SubscribeMessage('chat:message')
  async handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: ChatMessageDto,
  ) {
    const user = client.data.user;
    const { roomId, message } = dto;

    // Публикуем сообщение в Redis Stream
    await this.redisStreamer.publishChatMessage({
      roomId,
      userId: user.id,
      userName: user.name,
      message,
      timestamp: Date.now(),
    });

    this.logger.debug(`Chat message published in room ${roomId}`);

    return {
      success: true,
    };
  }

  /**
   * Обработка угадывания слова от клиента
   */
  @SubscribeMessage('game:guess')
  async handleGuessWord(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: GuessWordDto,
  ) {
    const user = client.data.user;
    const { roomId, guess } = dto;

    // Публикуем событие в Redis Stream
    await this.redisStreamer.publishGameEvent({
      roomId,
      type: 'correct_guess',
      data: {
        userId: user.id,
        userName: user.name,
        guess,
      },
      timestamp: Date.now(),
    });

    this.logger.debug(`Guess word event published in room ${roomId}`);

    return {
      success: true,
    };
  }
}
