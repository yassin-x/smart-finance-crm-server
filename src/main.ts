import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { fastifyHelmet } from '@fastify/helmet';
import fastifyCsrf from '@fastify/csrf-protection';
import fastifyCookie from '@fastify/cookie';
import compression from '@fastify/compress';
import { StandardSchemaValidationPipe } from '@nestjs/common';
import fastifyStatic from '@fastify/static';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      trustProxy: true,
      logger: true,
    }),
    {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    },
  );

  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SIGNATURE_SECRET,
  });
  await app.register(compression);
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`, 'unpkg.com'],
        styleSrc: [
          `'self'`,
          `'unsafe-inline'`,
          'cdn.jsdelivr.net',
          'fonts.googleapis.com',
          'unpkg.com',
        ],
        fontSrc: [`'self'`, 'fonts.gstatic.com', 'data:'],
        imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net', 'https:'],
        scriptSrc: [
          `'self'`,
          `https: 'unsafe-inline'`,
          `cdn.jsdelivr.net`,
          `'unsafe-eval'`,
        ],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  });
  await app.register(fastifyCsrf);

  await app.register(fastifyStatic, {
    root: `${__dirname}/public`,
    prefix: '/public/',
  });

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',').map((origin) => origin.trim()),
    credentials: true,
  });

  app.useGlobalPipes(
    new StandardSchemaValidationPipe({
      transform: true,
    }),
  );

  console.log('BOOT: init');

  await app.listen(process.env.PORT ?? 3000);
  console.log('BOOT: listening');
}
await bootstrap();
