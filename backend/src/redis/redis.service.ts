import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    this.client = new Redis({
      host,
      port,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  // Redis Streams methods
  async xadd(stream: string, fields: Record<string, string>): Promise<string> {
    return this.client.xadd(stream, '*', ...Object.entries(fields).flat());
  }

  async xread(
    streams: Array<{ key: string; id: string }>,
    count?: number,
    block?: number,
  ): Promise<Array<[string, Array<[string, string[]]>]>> {
    const args: any[] = [];
    if (count) args.push('COUNT', count);
    if (block !== undefined) args.push('BLOCK', block);
    args.push(
      'STREAMS',
      ...streams.map((s) => s.key),
      ...streams.map((s) => s.id),
    );

    return this.client.xread(...args);
  }

  async xgroup(
    command: 'CREATE' | 'SETID' | 'DELGROUP' | 'CREATECONSUMER' | 'DELCONSUMER',
    stream: string,
    group: string,
    id?: string,
  ): Promise<string | number> {
    const args: any[] = [command, stream, group];
    if (id) args.push(id);
    return this.client.xgroup(...args);
  }

  async xreadgroup(
    group: string,
    consumer: string,
    streams: Array<{ key: string; id: string }>,
    count?: number,
    block?: number,
  ): Promise<Array<[string, Array<[string, string[]]>]>> {
    const args: any[] = ['GROUP', group, consumer];
    if (count) args.push('COUNT', count);
    if (block !== undefined) args.push('BLOCK', block);
    args.push(
      'STREAMS',
      ...streams.map((s) => s.key),
      ...streams.map((s) => s.id),
    );

    return this.client.xreadgroup(...args);
  }
}
