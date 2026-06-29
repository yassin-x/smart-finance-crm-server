import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redis = new Redis(config.get<string>('REDIS_URL') as string, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          retryStrategy(times) {
            return Math.min(times * 50, 2000);
          },
        });

        redis.on('error', (err) => {
          console.error('Redis Error:', err);
        });

        return redis;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
