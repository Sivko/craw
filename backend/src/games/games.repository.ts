import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Difficulty } from '../rooms/dto/create-room.dto';

/**
 * Репозиторий для работы с играми и словами
 * Инкапсулирует доступ к данным через Prisma
 */
@Injectable()
export class GamesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получение случайного слова из словаря по уровню сложности
   */
  async getRandomWord(difficulty: Difficulty): Promise<string> {
    // Получаем количество активных слов для данной сложности
    const count = await this.prisma.wordDictionary.count({
      where: {
        difficulty,
        isActive: true,
      },
    });

    if (count === 0) {
      throw new NotFoundException(
        `No active words found for difficulty: ${difficulty}`,
      );
    }

    // Получаем случайное слово
    const randomIndex = Math.floor(Math.random() * count);
    const word = await this.prisma.wordDictionary.findMany({
      where: {
        difficulty,
        isActive: true,
      },
      skip: randomIndex,
      take: 1,
      select: {
        word: true,
      },
    });

    if (word.length === 0) {
      throw new NotFoundException(
        `Failed to get random word for difficulty: ${difficulty}`,
      );
    }

    return word[0].word;
  }

  /**
   * Создание матча
   */
  async createMatch(
    roomId: string,
    drawerId: string,
    word: string,
    difficulty: string,
  ) {
    return this.prisma.match.create({
      data: {
        roomId,
        drawerId,
        word,
        difficulty,
      },
      include: {
        drawer: {
          select: {
            id: true,
            name: true,
          },
        },
        room: {
          select: {
            id: true,
            settings: true,
          },
        },
      },
    });
  }

  /**
   * Получение текущего активного матча для комнаты
   */
  async getCurrentMatch(roomId: string) {
    return this.prisma.match.findFirst({
      where: {
        roomId,
        endedAt: null,
      },
      include: {
        drawer: {
          select: {
            id: true,
            name: true,
          },
        },
        room: {
          select: {
            id: true,
            settings: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });
  }

  /**
   * Завершение матча
   */
  async endMatch(matchId: string) {
    return this.prisma.match.update({
      where: { id: matchId },
      data: {
        endedAt: new Date(),
      },
      include: {
        drawer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Получение списка пользователей комнаты
   */
  async getRoomUsers(roomId: string) {
    return this.prisma.roomUser.findMany({
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
        joinedAt: 'asc',
      },
    });
  }

  /**
   * Обновление счета пользователя в комнате
   */
  async updateUserScore(roomId: string, userId: string, points: number) {
    const roomUser = await this.prisma.roomUser.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    if (!roomUser) {
      throw new NotFoundException('User not found in room');
    }

    return this.prisma.roomUser.update({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
      data: {
        score: roomUser.score + points,
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
}
