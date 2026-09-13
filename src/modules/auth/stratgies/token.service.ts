import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private jwt: JwtService) {}

  generateAccessToken(payload: { userId: string }) {
    return this.jwt.sign(
      { ...payload },
      { expiresIn: '1d', secret: process.env.JWT_ACCESS_SECRET },
    );
  }

  generateRefreshToken(payload: { userId: string }) {
    return this.jwt.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });
  }

  async verifyAccessToken(token: string) {
    const payload = await this.jwt.verify(token, {
      secret: process.env.JWT_ACCESS_SECRET,
    });
    return { userId: payload.userId };
  }

  async verifyRefreshToken(token: string) {
    const payload = await this.jwt.verify(token, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    return { userId: payload.userId };
  }
}
