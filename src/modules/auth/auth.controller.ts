import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  Body,
  Controller,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthGuard } from './guards/auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('me')
  async me(
    @Res({ passthrough: true }) reply: FastifyReply,
    @Req() req: FastifyRequest,
  ) {
    return await this.service.me(reply, req);
  }

  @Post('login')
  async login(
    @Res({ passthrough: true }) reply: FastifyReply,
    @Body() loginDto: LoginDto,
  ) {
    return await this.service.login(reply, loginDto);
  }

  @Post('refresh-token')
  async refreshToken(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    return await this.service.refreshToken(reply, req);
  }

  async logout(@Res({ passthrough: true }) reply: FastifyReply) {
    return await this.service.logout(reply);
  }
}
