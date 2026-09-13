import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { InjectRedisClient } from '../../redis/decorator/redis.decorator.js';
import { TokenService } from '../stratgies/token.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRedisClient() private readonly redis: Redis,
    private tokenService: TokenService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const access_token = request.cookies['accessToken'];

    if (!access_token) {
      throw new UnauthorizedException('لم يتم تسجيل الدخول!');
    }
    let payload;
    try {
      payload = await this.tokenService.verifyAccessToken(access_token);
    } catch (error) {
      throw new UnauthorizedException('لم يتم تسجيل الدخول!');
    }

    const user = await this.prisma.account.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new UnauthorizedException('لم يتم تسجيل الدخول!');
    }

    request.user = user;
    return true;
  }
}
