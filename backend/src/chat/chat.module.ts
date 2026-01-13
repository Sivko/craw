import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatRepository } from './chat.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisStreamerModule } from '../redis-streamer/redis-streamer.module';
import { RoomsModule } from '../rooms/rooms.module';

/**
 * Модуль чата
 * Предоставляет функциональность отправки и получения сообщений в комнатах
 */
@Module({
  imports: [PrismaModule, RedisStreamerModule, RoomsModule],
  controllers: [ChatController],
  providers: [ChatService, ChatRepository],
  exports: [ChatService, ChatRepository],
})
export class ChatModule {}
