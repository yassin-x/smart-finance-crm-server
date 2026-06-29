import { BadRequestException, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRedis } from '../redis/decorator/redis.decorator';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateAccountDto } from './dto/createAccount.dto';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { SignInDTO } from './dto/signIn.dto';
import { TokenService } from './stratgies/token.service';
import { VerifyEmailDto } from './dto/verifyEmail.dto';
import { MailService } from '../mail/mail.service';
import { verifyEmailTemplate } from '../../mails/mail.message';

@Injectable()
export class AuthService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private prisma: PrismaService,
    private tokenService: TokenService,
    private mailService: MailService,
  ) {}

  async createAccount(reply: FastifyReply, createAccountDto: CreateAccountDto) {
    const existing = await this.prisma.account.findFirst({
      where: {
        OR: [
          { email: createAccountDto.email },
          { username: createAccountDto.username },
        ],
      },
    });
    if (existing) {
      if (existing.email === createAccountDto.email) {
        throw new BadRequestException('البريد الالكتروني مستخدم بلفعل!');
      }

      if (existing.username === createAccountDto.username) {
        throw new BadRequestException('اسم المستخدم مستخدم بلفعل!');
      }
    }

    const passwordHashed = await bcrypt.hash(createAccountDto.password, 12);

    const account = await this.prisma.account.create({
      data: {
        email: createAccountDto.email,
        username: createAccountDto.username,
        password: passwordHashed,
        fullName: createAccountDto.fullName,
        phone: createAccountDto.phoneNumber,
        role: createAccountDto.role as UserRole,
      },
    });

    await this.redis.set(`user:${account.id}`, JSON.stringify(account));
    return {
      message: 'تم إنشاء الحساب بنجاح',
      data: {
        ...account,
        password: undefined,
      },
    };
  }

  async signIn(reply: FastifyReply, signInDto: SignInDTO) {
    const account = await this.prisma.account.findUnique({
      where: {
        email: signInDto.email,
      },
    });
    if (!account) {
      throw new BadRequestException('البريد الالكتروني غير صحيح!');
    }

    const isPasswordMatch = await bcrypt.compare(
      signInDto.password,
      account.password,
    );
    if (!isPasswordMatch) {
      throw new BadRequestException('كلمة المرور غير صحيحة!');
    }

    const generateOTPCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const access_token = this.tokenService.generateAccessToken({
      userId: account.id,
    });
    const refresh_token = this.tokenService.generateRefreshToken({
      userId: account.id,
    });

    reply.setCookie('access_token', access_token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    reply.setCookie('refresh_token', refresh_token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    const updatedAccount = await this.prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        verifyCode: generateOTPCode,
        verifyCodeExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    this.mailService.sendMail(
      account.email,
      'كود التحقق',
      verifyEmailTemplate(account.email, generateOTPCode),
    );

    await this.redis.set(`user:${account.id}`, JSON.stringify(updatedAccount));
    return {
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        ...updatedAccount,
        password: undefined,
      },
    };
  }

  async verifyEmail(req: FastifyRequest, verifyEmailDto: VerifyEmailDto) {
    console.log(req.user);
    const account = await this.prisma.account.findUnique({
      where: {
        email: req.user?.email,
      },
    });
    if (!account) {
      throw new BadRequestException('البريد الالكتروني غير صحيح!');
    }

    if (account.verifyCode !== verifyEmailDto.code) {
      throw new BadRequestException('كود التحقق غير صحيح!');
    }
    if (
      account.verifyCodeExpiresAt &&
      account.verifyCodeExpiresAt < new Date()
    ) {
      throw new BadRequestException('تم انتهاء صلاحية كود التحقق!');
    }

    const updatedAccount = await this.prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        isVerified: true,
        verifyCode: null,
        verifyCodeExpiresAt: null,
      },
    });
    await this.redis.set(`user:${account.id}`, JSON.stringify(updatedAccount));
    return {
      message: 'تم التحقق بنجاح',
      data: {
        ...updatedAccount,
        password: undefined,
      },
    };
  }

  async refreshToken(req: FastifyRequest, reply: FastifyReply) {
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new BadRequestException('الرجاء تسجيل الدخول اولا');
    }

    try {
      const payload = await this.tokenService.verifyRefreshToken(refreshToken);
      const access_token = this.tokenService.generateAccessToken(payload);
      reply.setCookie('access_token', access_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return { message: 'تم تجديد الاتصال بنجاح' };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('الرجاء تسجيل الدخول اولا');
    }
  }

  async signOut(reply: FastifyReply) {
    reply.clearCookie('access_token', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    reply.clearCookie('refresh_token', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { message: 'تم تسجيل الخروج بنجاح' };
  }

  async me(req: FastifyRequest) {
    const account = req.user;

    if (!account) {
      throw new BadRequestException('الرجاء تسجيل الدخول اولا');
    }

    return account;
  }
}
