import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

const REDIS_CLIENT = 'REDIS_CLIENT' as const;

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        const redisUrl = config.getOrThrow<string>('REDIS_URL');

        const redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          retryStrategy: (times: number): number => Math.min(times * 50, 2000),
        });

        redis.on('error', (error: Error): void => {
          console.error('Redis Error:', error);
        });

        return redis;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
