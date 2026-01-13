import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RoomsRepository } from './rooms.repository';
import { CreateRoomDto } from './dto/create-room.dto';
import {
  RoomResponse,
  RoomResponseDto,
  RoomStatus,
  RoomUserResponse,
} from './dto/room-response.dto';
import { RedisStreamerService } from '../redis-streamer/redis-streamer.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Сервис для работы с комнатами
 * Содержит бизнес-логику управления комнатами
 */
@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);

  constructor(
    private readonly roomsRepository: RoomsRepository,
    private readonly redisStreamer: RedisStreamerService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Создание комнаты
   */
  async create(hostId: string, dto: CreateRoomDto): Promise<RoomResponseDto> {
    const room = await this.roomsRepository.create(hostId, dto);

    // Добавляем хоста в комнату как участника
    await this.roomsRepository.addUserToRoom(room.id, hostId);

    // Получаем обновленную комнату с пользователями
    const roomWithUsers = await this.roomsRepository.findById(room.id);

    // Публикуем событие создания комнаты
    await this.redisStreamer.publishRoomUpdate({
      roomId: room.id,
      type: 'room:created',
      data: {
        room: this.mapToRoomResponse(roomWithUsers),
      },
      timestamp: Date.now(),
    });

    this.logger.log(`Room created: ${room.code} by user ${hostId}`);

    return {
      success: true,
      data: this.mapToRoomResponse(roomWithUsers),
      error: null,
    };
  }

  /**
   * Получение информации о комнате по коду
   */
  async findByCode(code: string): Promise<RoomResponseDto> {
    const room = await this.roomsRepository.findByCode(code);

    return {
      success: true,
      data: this.mapToRoomResponse(room),
      error: null,
    };
  }

  /**
   * Присоединение к комнате
   */
  async joinRoom(userId: string, code: string): Promise<RoomResponseDto> {
    const room = await this.roomsRepository.findByCode(code);

    // Проверяем, что комната не в игре
    if (room.status !== RoomStatus.WAITING) {
      throw new BadRequestException(
        'Cannot join room that is already playing or finished',
      );
    }

    // Проверяем, не является ли пользователь уже участником
    const isAlreadyInRoom = await this.roomsRepository.isUserInRoom(
      room.id,
      userId,
    );
    if (isAlreadyInRoom) {
      throw new BadRequestException('User is already in the room');
    }

    // Добавляем пользователя в комнату
    await this.roomsRepository.addUserToRoom(room.id, userId);

    // Получаем обновленную комнату
    const updatedRoom = await this.roomsRepository.findById(room.id);

    // Публикуем событие присоединения
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.redisStreamer.publishRoomUpdate({
      roomId: room.id,
      type: 'room:user-joined',
      data: {
        room: this.mapToRoomResponse(updatedRoom),
        user: {
          id: user.id,
          name: user.name,
        },
      },
      timestamp: Date.now(),
    });

    this.logger.log(`User ${userId} joined room ${code}`);

    return {
      success: true,
      data: this.mapToRoomResponse(updatedRoom),
      error: null,
    };
  }

  /**
   * Выход из комнаты
   */
  async leaveRoom(userId: string, code: string): Promise<RoomResponseDto> {
    const room = await this.roomsRepository.findByCode(code);

    // Проверяем, что пользователь является участником комнаты
    const isInRoom = await this.roomsRepository.isUserInRoom(room.id, userId);
    if (!isInRoom) {
      throw new BadRequestException('User is not in the room');
    }

    // Если пользователь - хост, удаляем комнату
    if (room.hostId === userId) {
      await this.roomsRepository.delete(room.id);

      await this.redisStreamer.publishRoomUpdate({
        roomId: room.id,
        type: 'room:deleted',
        data: {
          roomId: room.id,
        },
        timestamp: Date.now(),
      });

      this.logger.log(`Room ${code} deleted by host ${userId}`);

      return {
        success: true,
        data: null,
        error: null,
      };
    }

    // Удаляем пользователя из комнаты
    await this.roomsRepository.removeUserFromRoom(room.id, userId);

    // Получаем обновленную комнату
    const updatedRoom = await this.roomsRepository.findById(room.id);

    // Публикуем событие выхода
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.redisStreamer.publishRoomUpdate({
      roomId: room.id,
      type: 'room:user-left',
      data: {
        room: this.mapToRoomResponse(updatedRoom),
        user: {
          id: user.id,
          name: user.name,
        },
      },
      timestamp: Date.now(),
    });

    this.logger.log(`User ${userId} left room ${code}`);

    return {
      success: true,
      data: this.mapToRoomResponse(updatedRoom),
      error: null,
    };
  }

  /**
   * Удаление комнаты (только хост)
   */
  async deleteRoom(userId: string, code: string): Promise<RoomResponseDto> {
    const room = await this.roomsRepository.findByCode(code);

    // Проверяем, что пользователь является хостом
    if (room.hostId !== userId) {
      throw new ForbiddenException('Only room host can delete the room');
    }

    await this.roomsRepository.delete(room.id);

    await this.redisStreamer.publishRoomUpdate({
      roomId: room.id,
      type: 'room:deleted',
      data: {
        roomId: room.id,
      },
      timestamp: Date.now(),
    });

    this.logger.log(`Room ${code} deleted by host ${userId}`);

    return {
      success: true,
      data: null,
      error: null,
    };
  }

  /**
   * Преобразование Prisma модели в RoomResponse
   */
  private mapToRoomResponse(room: any): RoomResponse {
    const settings = room.settings as { difficulty: string; timer: number };

    const users: RoomUserResponse[] = room.users.map((ru: any) => ({
      id: ru.id,
      userId: ru.user.id,
      userName: ru.user.name,
      score: ru.score,
      joinedAt: ru.joinedAt,
    }));

    return {
      id: room.id,
      code: room.code,
      hostId: room.host.id,
      hostName: room.host.name,
      settings: {
        difficulty: settings.difficulty as any,
        timer: settings.timer,
      },
      status: room.status as RoomStatus,
      users,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  }
}
