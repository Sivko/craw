import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import {
  MessageResponseDto,
  MessagesListResponseDto,
} from './dto/message-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

/**
 * Контроллер для работы с чатом
 * Обрабатывает HTTP запросы для отправки и получения сообщений
 */
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Отправка сообщения в чат
   * POST /chat/:roomId/messages
   */
  @Post(':roomId/messages')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @CurrentUser() user: any,
    @Param('roomId') roomId: string,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    return this.chatService.sendMessage(roomId, user.id, createMessageDto);
  }

  /**
   * Получение истории сообщений для комнаты
   * GET /chat/:roomId/messages
   */
  @Get(':roomId/messages')
  @HttpCode(HttpStatus.OK)
  async getMessages(
    @Param('roomId') roomId: string,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<MessagesListResponseDto> {
    return this.chatService.getMessages(roomId, limit, offset);
  }
}
