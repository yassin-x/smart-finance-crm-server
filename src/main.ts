import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import fastifyCsrf from '@fastify/csrf-protection';
import fastifyCookie from '@fastify/cookie';
import compression from '@fastify/compress';
import secureSession from '@fastify/secure-session';
import { StandardSchemaValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    },
  );

  await app.register(helmet);
  await app.register(fastifyCsrf);
  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SIGNATURE_SECRET,
  });
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',').map((origin) => origin.trim()),
    optionsSuccessStatus: 204,
    credentials: true,
  });
  await app.register(compression);
  await app.register(secureSession, {
    secret: process.env.SESSION_SECRET!,
    salt: Buffer.from(process.env.SESSION_SALT!, 'hex'),
  });

  app.useGlobalPipes(
    new StandardSchemaValidationPipe({
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
