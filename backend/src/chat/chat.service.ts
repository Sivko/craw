import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { CreateMessageDto } from './dto/create-message.dto';
import {
  ChatMessageResponse,
  MessageResponseDto,
  MessagesListResponseDto,
} from './dto/message-response.dto';
import { RedisStreamerService } from '../redis-streamer/redis-streamer.service';
import { PrismaService } from '../prisma/prisma.service';
import { RoomsRepository } from '../rooms/rooms.repository';

/**
 * Сервис для работы с чатом
 * Содержит бизнес-логику отправки и получения сообщений
 */
@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly redisStreamer: RedisStreamerService,
    private readonly prisma: PrismaService,
    private readonly roomsRepository: RoomsRepository,
  ) {}

  /**
   * Отправка сообщения в чат
   */
  async sendMessage(
    roomId: string,
    userId: string,
    dto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    // Проверяем, что комната существует
    const room = await this.roomsRepository.findById(roomId);

    // Проверяем, что пользователь является участником комнаты
    const isInRoom = await this.roomsRepository.isUserInRoom(roomId, userId);
    if (!isInRoom) {
      throw new BadRequestException('User is not in the room');
    }

    // Получаем информацию о пользователе
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Получаем текущий матч, если есть
    const currentMatch = await this.prisma.match.findFirst({
      where: {
        roomId,
        endedAt: null,
      },
    });

    // Проверяем, является ли сообщение правильным ответом
    let isCorrect = false;
    if (currentMatch) {
      // Нормализуем сообщение и слово для сравнения
      const normalizedMessage = dto.message.trim().toLowerCase();
      const normalizedWord = currentMatch.word.trim().toLowerCase();
      isCorrect = normalizedMessage === normalizedWord;

      // Проверяем, что пользователь не является художником
      if (currentMatch.drawerId === userId) {
        // Художник не может угадывать, но может отправлять обычные сообщения
        isCorrect = false;
      }
    }

    // Создаем сообщение в БД
    const chatMessage = await this.chatRepository.create(
      roomId,
      userId,
      dto.message,
      currentMatch?.id || null,
      isCorrect,
    );

    // Публикуем сообщение в Redis Stream
    await this.redisStreamer.publishChatMessage({
      roomId,
      userId: user.id,
      userName: user.name,
      message: dto.message,
      timestamp: Date.now(),
    });

    this.logger.log(
      `Message sent by user ${userId} in room ${roomId}: ${dto.message.substring(0, 50)}...`,
    );

    return {
      success: true,
      data: this.mapToMessageResponse(chatMessage),
      error: null,
    };
  }

  /**
   * Получение истории сообщений для комнаты
   */
  async getMessages(
    roomId: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<MessagesListResponseDto> {
    // Проверяем, что комната существует
    await this.roomsRepository.findById(roomId);

    const messages = await this.chatRepository.getMessagesByRoomId(
      roomId,
      limit,
      offset,
    );

    return {
      success: true,
      data: messages.map((msg) => this.mapToMessageResponse(msg)),
      error: null,
    };
  }

  /**
   * Очистка истории сообщений для комнаты
   * Вызывается при начале нового матча
   */
  async clearMessages(roomId: string): Promise<void> {
    await this.chatRepository.clearMessagesByRoomId(roomId);
    this.logger.log(`Chat history cleared for room ${roomId}`);
  }

  /**
   * Очистка истории сообщений для конкретного матча
   */
  async clearMessagesByMatch(matchId: string): Promise<void> {
    await this.chatRepository.clearMessagesByMatchId(matchId);
    this.logger.log(`Chat history cleared for match ${matchId}`);
  }

  /**
   * Преобразование Prisma модели в ChatMessageResponse
   */
  private mapToMessageResponse(message: any): ChatMessageResponse {
    return {
      id: message.id,
      roomId: message.roomId,
      userId: message.user.id,
      userName: message.user.name,
      matchId: message.matchId,
      message: message.message,
      isCorrect: message.isCorrect,
      createdAt: message.createdAt,
    };
  }
}
