import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoomResponseDto } from './dto/room-response.dto';

/**
 * Контроллер для работы с комнатами
 * Обрабатывает HTTP запросы для управления комнатами
 */
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  /**
   * Создание комнаты
   * POST /rooms
   */
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Body() createRoomDto: CreateRoomDto,
  ): Promise<RoomResponseDto> {
    return this.roomsService.create(user.id, createRoomDto);
  }

  /**
   * Получение информации о комнате по коду
   * GET /rooms/:code
   */
  @Get(':code')
  @HttpCode(HttpStatus.OK)
  async findByCode(@Param('code') code: string): Promise<RoomResponseDto> {
    return this.roomsService.findByCode(code);
  }

  /**
   * Присоединение к комнате
   * POST /rooms/:code/join
   */
  @Post(':code/join')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async joinRoom(
    @CurrentUser() user: any,
    @Param('code') code: string,
  ): Promise<RoomResponseDto> {
    return this.roomsService.joinRoom(user.id, code);
  }

  /**
   * Выход из комнаты
   * POST /rooms/:code/leave
   */
  @Post(':code/leave')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async leaveRoom(
    @CurrentUser() user: any,
    @Param('code') code: string,
  ): Promise<RoomResponseDto> {
    return this.roomsService.leaveRoom(user.id, code);
  }

  /**
   * Удаление комнаты (только хост)
   * DELETE /rooms/:code
   */
  @Delete(':code')
  @HttpCode(HttpStatus.OK)
  async deleteRoom(
    @CurrentUser() user: any,
    @Param('code') code: string,
  ): Promise<RoomResponseDto> {
    return this.roomsService.deleteRoom(user.id, code);
  }
}
