import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Репозиторий для работы с сообщениями чата
 * Инкапсулирует доступ к данным через Prisma
 */
@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создание сообщения в чате
   */
  async create(
    roomId: string,
    userId: string,
    message: string,
    matchId?: string | null,
    isCorrect: boolean = false,
  ) {
    return this.prisma.chatMessage.create({
      data: {
        roomId,
        userId,
        message,
        matchId: matchId || null,
        isCorrect,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Получение истории сообщений для комнаты
   */
  async getMessagesByRoomId(
    roomId: string,
    limit: number = 100,
    offset: number = 0,
  ) {
    // Проверяем существование комнаты
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException(`Room with id ${roomId} not found`);
    }

    return this.prisma.chatMessage.findMany({
      where: { roomId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Очистка истории сообщений для комнаты
   */
  async clearMessagesByRoomId(roomId: string) {
    return this.prisma.chatMessage.deleteMany({
      where: { roomId },
    });
  }

  /**
   * Очистка истории сообщений для конкретного матча
   */
  async clearMessagesByMatchId(matchId: string) {
    return this.prisma.chatMessage.deleteMany({
      where: { matchId },
    });
  }

  /**
   * Получение сообщений для конкретного матча
   */
  async getMessagesByMatchId(matchId: string) {
    return this.prisma.chatMessage.findMany({
      where: { matchId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
