import { UserRole } from '@prisma/client';
import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class VerifyEmailDto {
  @IsNotEmpty({ message: 'كود التحقق مطلوب' })
  code!: string;
}
