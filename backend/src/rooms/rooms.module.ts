import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { RoomsRepository } from './rooms.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisStreamerModule } from '../redis-streamer/redis-streamer.module';

/**
 * Модуль комнат
 * Предоставляет функциональность создания, управления и присоединения к комнатам
 */
@Module({
  imports: [PrismaModule, RedisStreamerModule],
  controllers: [RoomsController],
  providers: [RoomsService, RoomsRepository],
  exports: [RoomsService, RoomsRepository],
})
export class RoomsModule {}
