import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRedis } from '../../redis/decorator/redis.decorator';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenService } from '../stratgies/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private tokenService: TokenService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const access_token = request.cookies['access_token'];

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
