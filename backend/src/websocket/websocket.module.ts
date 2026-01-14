import { Module } from '@nestjs/common';
import { AppGateway } from './websocket.gateway';
import { RedisStreamerModule } from '../redis-streamer/redis-streamer.module';
import { AuthModule } from '../auth/auth.module';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

/**
 * WebSocket модуль для real-time обновлений
 */
@Module({
  imports: [
    RedisStreamerModule,
    AuthModule,
    JwtModule,
    ConfigModule,
  ],
  providers: [AppGateway, WsJwtGuard],
  exports: [AppGateway],
})
export class WebSocketModule {}
