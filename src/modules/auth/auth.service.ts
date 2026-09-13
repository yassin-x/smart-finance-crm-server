import { Injectable } from '@nestjs/common';
import { InjectRedisClient } from '../redis/decorator/redis.decorator.js';
import { Redis } from 'ioredis';
import { PrismaService } from '../prisma/prisma.service.js';
import type { FastifyReply, FastifyRequest } from 'fastify';
import * as argon2 from 'argon2';
import { TokenService } from './stratgies/token.service.js';
import { LoginDto } from './dto/login.dto.js';
@Injectable()
export class AuthService {
  constructor(
    @InjectRedisClient() private readonly redis: Redis,
    private readonly prisma: PrismaService,
    private tokenService: TokenService,
  ) {}

  // async createAccount(reply: FastifyReply, createAccountDto: CreateAccountDto) {
  //   const { email, username, password, fullName } = createAccountDto;
  //   const existingUser = await this.prisma.account.findFirst({
  //     where: {
  //       OR: [{ email }, { username }],
  //     },
  //   });

  //   if (existingUser) {
  //     return reply.status(400).send({
  //       status: 'error',
  //       data: {
  //         message: 'Email or username already exists',
  //       },
  //     });
  //   }

  //   const hashedPassword = await argon2.hash(password);

  //   const newUser = await this.prisma.account.create({
  //     data: {
  //       email,
  //       username,
  //       password: hashedPassword,
  //       fullName,
  //     },
  //   });

  //   return reply.status(201).send({
  //     status: 'success',
  //     data: {
  //       id: newUser.id,
  //       email: newUser.email,
  //       username: newUser.username,
  //       fullName: newUser.fullName,
  //     },
  //   });
  // }

  async me(reply: FastifyReply, req: FastifyRequest) {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return reply.status(401).send({
        status: 'error',
        data: {
          message: 'Unauthorized',
        },
      });
    }

    const payload = await this.tokenService.verifyAccessToken(accessToken);

    if (!payload) {
      return reply.status(401).send({
        status: 'error',
        data: {
          message: 'Unauthorized',
        },
      });
    }

    const user = await this.prisma.account.findUnique({
      where: { id: payload.userId },
    });

    return {
      status: 'success',
      data: user,
    };
  }

  async login(reply: FastifyReply, loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.prisma.account.findFirst({
      where: { username },
    });

    if (!user) {
      return reply.status(400).send({
        status: 'error',
        data: {
          message: 'Invalid username or password',
        },
      });
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      return reply.status(400).send({
        status: 'error',
        data: {
          message: 'Invalid username or password',
        },
      });
    }

    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
    });
    const refreshToken = this.tokenService.generateRefreshToken({
      userId: user.id,
    });

    reply.cookie('accessToken', accessToken, {
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    reply.cookie('refreshToken', refreshToken, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return reply.status(200).send({
      status: 'success',
      data: {
        ...user,
      },
    });
  }

  async refreshToken(reply: FastifyReply, req: FastifyRequest) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return reply.status(401).send({
        status: 'error',
        data: {
          message: 'Unauthorized',
        },
      });
    }

    const payload = await this.tokenService.verifyRefreshToken(refreshToken);

    if (!payload) {
      return reply.status(401).send({
        status: 'error',
        data: {
          message: 'Unauthorized',
        },
      });
    }

    const accessToken = this.tokenService.generateAccessToken(payload);

    reply.clearCookie('accessToken', {
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    reply.cookie('accessToken', accessToken, {
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return reply.status(200).send({
      status: 'success',
      data: {
        accessToken,
      },
    });
  }

  async logout(reply: FastifyReply) {
    reply.clearCookie('accessToken', {
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    reply.clearCookie('refreshToken', {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return reply.status(200).send({
      status: 'success',
      data: {
        message: 'Logout successful',
      },
    });
  }
}
