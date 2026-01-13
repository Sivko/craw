import { Module } from '@nestjs/common';
import { RedisStreamerService } from './redis-streamer.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [RedisStreamerService],
  exports: [RedisStreamerService],
})
export class RedisStreamerModule {}
