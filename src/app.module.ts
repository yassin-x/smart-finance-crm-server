import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module.js';
import { RedisModule } from './modules/redis/redis.module.js';
import { PrismaService } from './modules/prisma/prisma.service.js';
import { PrismaModule } from './modules/prisma/prisma.module.js';
import { APP_PIPE } from '@nestjs/core';
import { LeadModule } from './modules/lead/lead.module.js';
import { TemplateModule } from './modules/template/template.module.js';
import { TokenService } from './modules/auth/stratgies/token.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    AuthModule,
    PrismaModule,
    LeadModule,
    TemplateModule,
  ],
  controllers: [],
  providers: [
    PrismaService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
