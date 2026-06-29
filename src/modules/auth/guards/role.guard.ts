import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException(`لم يتم تسجيل الدخول!`);
    }
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(`ليس لديك صلاحية!`);
    }

    return true;
  }
}
