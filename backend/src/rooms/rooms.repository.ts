import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomStatus } from './dto/room-response.dto';
import { Prisma } from '@prisma/client';

/**
 * Репозиторий для работы с комнатами
 * Инкапсулирует доступ к данным через Prisma
 */
@Injectable()
export class RoomsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Генерация уникального кода комнаты
   */
  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Проверка уникальности кода комнаты
   */
  private async isCodeUnique(code: string): Promise<boolean> {
    const room = await this.prisma.room.findUnique({
      where: { code },
    });
    return !room;
  }

  /**
   * Генерация уникального кода комнаты с проверкой
   */
  private async generateUniqueCode(): Promise<string> {
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = this.generateRoomCode();
      attempts++;
      if (attempts > maxAttempts) {
        throw new Error('Failed to generate unique room code');
      }
    } while (!(await this.isCodeUnique(code)));

    return code;
  }

  /**
   * Создание комнаты
   */
  async create(hostId: string, dto: CreateRoomDto) {
    const code = await this.generateUniqueCode();
    const settings: Prisma.InputJsonValue = {
      difficulty: dto.difficulty,
      timer: dto.timer,
    };

    return this.prisma.room.create({
      data: {
        code,
        hostId,
        settings,
        status: RoomStatus.WAITING,
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
          },
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Поиск комнаты по коду
   */
  async findByCode(code: string) {
    const room = await this.prisma.room.findUnique({
      where: { code },
      include: {
        host: {
          select: {
            id: true,
            name: true,
          },
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException(`Room with code ${code} not found`);
    }

    return room;
  }

  /**
   * Поиск комнаты по ID
   */
  async findById(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            name: true,
          },
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException(`Room with id ${id} not found`);
    }

    return room;
  }

  /**
   * Проверка, является ли пользователь участником комнаты
   */
  async isUserInRoom(roomId: string, userId: string): Promise<boolean> {
    const roomUser = await this.prisma.roomUser.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });
    return !!roomUser;
  }

  /**
   * Добавление пользователя в комнату
   */
  async addUserToRoom(roomId: string, userId: string) {
    return this.prisma.roomUser.create({
      data: {
        roomId,
        userId,
        score: 0,
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
   * Удаление пользователя из комнаты
   */
  async removeUserFromRoom(roomId: string, userId: string) {
    return this.prisma.roomUser.delete({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });
  }

  /**
   * Удаление комнаты
   */
  async delete(roomId: string) {
    return this.prisma.room.delete({
      where: { id: roomId },
    });
  }

  /**
   * Обновление статуса комнаты
   */
  async updateStatus(roomId: string, status: RoomStatus) {
    return this.prisma.room.update({
      where: { id: roomId },
      data: { status },
      include: {
        host: {
          select: {
            id: true,
            name: true,
          },
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
