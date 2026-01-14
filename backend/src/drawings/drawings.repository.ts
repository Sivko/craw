import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Репозиторий для работы с рисунками
 * Инкапсулирует доступ к данным через Prisma
 */
@Injectable()
export class DrawingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создание записи о рисунке
   */
  async create(matchId: string, userId: string, imageUrl: string) {
    // Проверяем, что матч существует
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} not found`);
    }

    // Проверяем, что у матча еще нет рисунка
    const existingDrawing = await this.prisma.drawing.findUnique({
      where: { matchId },
    });

    if (existingDrawing) {
      throw new NotFoundException(
        `Drawing already exists for match ${matchId}`,
      );
    }

    return this.prisma.drawing.create({
      data: {
        matchId,
        userId,
        imageUrl,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        match: {
          select: {
            id: true,
            roomId: true,
          },
        },
      },
    });
  }

  /**
   * Получение рисунка по ID
   */
  async findById(id: string) {
    const drawing = await this.prisma.drawing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        match: {
          select: {
            id: true,
            roomId: true,
          },
        },
      },
    });

    if (!drawing) {
      throw new NotFoundException(`Drawing with id ${id} not found`);
    }

    return drawing;
  }

  /**
   * Получение рисунка по matchId
   */
  async findByMatchId(matchId: string) {
    const drawing = await this.prisma.drawing.findUnique({
      where: { matchId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        match: {
          select: {
            id: true,
            roomId: true,
          },
        },
      },
    });

    return drawing;
  }

  /**
   * Получение всех рисунков пользователя
   */
  async findByUserId(userId: string, limit: number = 50, offset: number = 0) {
    // Проверяем существование пользователя
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return this.prisma.drawing.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        match: {
          select: {
            id: true,
            roomId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Обновление URL изображения
   */
  async updateImageUrl(id: string, imageUrl: string) {
    return this.prisma.drawing.update({
      where: { id },
      data: { imageUrl },
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
}
