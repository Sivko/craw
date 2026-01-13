import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GamesRepository } from './games.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisStreamerModule } from '../redis-streamer/redis-streamer.module';
import { RoomsModule } from '../rooms/rooms.module';
import { ChatModule } from '../chat/chat.module';

/**
 * Модуль игр
 * Предоставляет функциональность управления матчами, выбором слов и ротацией художника
 */
@Module({
  imports: [PrismaModule, RedisStreamerModule, RoomsModule, ChatModule],
  controllers: [GamesController],
  providers: [GamesService, GamesRepository],
  exports: [GamesService, GamesRepository],
})
export class GamesModule {}
