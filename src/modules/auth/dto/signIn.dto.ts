import { UserRole } from '@prisma/client';
import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignInDTO {
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  @IsEmail({}, { message: 'يجب أن يكون البريد الإلكتروني صالح' })
  @Matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, {
    message: 'يجب  أن يكون البريد الإلكتروني @gmail.com',
  })
  email!: string;

  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  @MaxLength(20, { message: 'يجب أن يكون كلمة المرور أقل من 20 حرف' })
  @MinLength(6, { message: 'يجب أن يكون كلمة المرور أكثر من 6 حروف' })
  password!: string;
}
