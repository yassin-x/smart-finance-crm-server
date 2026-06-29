import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { CreateAccountDto } from './dto/createAccount.dto';
import { SignInDTO } from './dto/signIn.dto';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { VerifyEmailDto } from './dto/verifyEmail.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard, RoleGuard)
  @Post('/create-account')
  async createAccount(
    @Res({ passthrough: true }) reply: FastifyReply,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return await this.authService.createAccount(reply, createAccountDto);
  }

  @Post('sign-in')
  async signIn(
    @Res({ passthrough: true }) reply: FastifyReply,
    @Body() signInDto: SignInDTO,
  ) {
    return await this.authService.signIn(reply, signInDto);
  }

  @UseGuards(AuthGuard)
  @Post('verify-email')
  async verifyEmail(
    @Req() req: FastifyRequest,
    @Body() verifyEmailDto: VerifyEmailDto,
  ) {
    return await this.authService.verifyEmail(req, verifyEmailDto);
  }

  @Patch('refresh-token')
  async refreshToken(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    return await this.authService.refreshToken(req, reply);
  }

  @Post('sign-out')
  async signOut(@Res({ passthrough: true }) reply: FastifyReply) {
    return await this.authService.signOut(reply);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@Req() req: FastifyRequest) {
    return await this.authService.me(req);
  }
}

/*
 Todo: Controller methods
  POST - Register ( ✅ )
  POST - Login ( ✅ )
  POST - Verify Email ( ✅ )
  STRATEGY - Access token ( ✅ )
  STRATEGY - Refresh token ( ✅ )
  POST - Logout ( ✅ )
  POST  - Change password ( ❌ )
  GET - User profile ( ✅ )
  Mange - Sessions ( ❌ )
*/
