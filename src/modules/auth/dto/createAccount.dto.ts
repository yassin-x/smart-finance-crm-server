import { UserRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  @IsEmail({}, { message: 'يجب أن يكون البريد الإلكتروني صالح' })
  @Matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, {
    message: 'يجب  أن يكون البريد الإلكتروني @gmail.com',
  })
  email!: string;

  @IsNotEmpty({ message: 'اسم المستخدم مطلوب' })
  @Matches(/^(?=.*[a-z])(?!.*\.\.)[a-z0-9](?:[a-z0-9._]{0,30}[a-z0-9])?$/, {
    message:
      'يجب ان يكون الاسم المستخدم أحرف وأرقام ويبدأ بحرف وينتهي بحرف أو رقم ويتكون من 8 أحرف',
  })
  username!: string;

  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  @MaxLength(20, { message: 'يجب أن يكون كلمة المرور أقل من 20 حرف' })
  @MinLength(6, { message: 'يجب أن يكون كلمة المرور أكثر من 6 حروف' })
  password!: string;

  @IsNotEmpty({ message: 'الاسم الكامل مطلوب' })
  @IsString({ message: 'يجب أن يكون الاسم الكامل حروف' })
  fullName!: string;

  @IsNotEmpty({ message: 'رقم الهاتف مطلوب' })
  @IsPhoneNumber('EG', { message: 'يجب أن يكون رقم الهاتف صالح' })
  phoneNumber!: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'الصلاحية غير صالحة' })
  role?: string;
}
